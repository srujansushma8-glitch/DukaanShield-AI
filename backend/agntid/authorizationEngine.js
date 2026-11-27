import { POLICIES } from './policies.js';
import { IntentTracker } from './intentTracker.js';
import { calculateRisk } from './riskAssessment.js';
import { isPromptInjection } from './injectionPatterns.js';
import { classifyWithAnthropic, classifyWithAnthropicAsync } from './anthropicClassifier.js';
import { store, userContext } from '../data/store.js';

export class AuthorizationEngine {
  constructor() {
    this.policies = POLICIES;
  }

  evaluate(proposedAction, sessionContext = {}) {
    const timestamp = new Date().toISOString();
    const ownerId = proposedAction.ownerId || sessionContext.ownerId || sessionContext.userId || userContext.getStore()?.userId || 'usr_owner_001';
    const sessionState = store.getSessionState(ownerId);
    const settings = store.getShopData(ownerId).settings;
    const tracker = new IntentTracker(sessionState);

    const intent = proposedAction.intent || sessionState.activeIntent || "General shop operations";

    // 1. Untrusted context / Prompt Injection Check
    const rawInstruction = proposedAction.rawInstruction || proposedAction.userPrompt || "";
    let injectionBlocked = false;
    let blockedLayer = null;
    let blockReason = "Prompt injection attempt detected in untrusted input stream. Autonomous execution aborted.";
    let classifierUnavailable = false;
    let classifierError = null;
    let classifierPromise = null;

    if (isPromptInjection(rawInstruction)) {
      injectionBlocked = true;
      blockedLayer = "regex_pattern_shield";
    } else if (rawInstruction) {
      const classifierRes = classifyWithAnthropic(rawInstruction);
      if (classifierRes && typeof classifierRes.then === 'function') {
        classifierPromise = classifierRes;
      } else if (classifierRes && classifierRes.injection) {
        injectionBlocked = true;
        blockedLayer = "anthropic_classifier";
        blockReason = "Prompt injection detected by Anthropic AI security classifier. Autonomous execution aborted.";
      } else if (classifierRes && (classifierRes.unavailable || classifierRes.error || classifierRes.timedOut)) {
        classifierUnavailable = true;
        classifierError = classifierRes.error;
      }
    }

    if (injectionBlocked) {
      const decision = {
        decision: "BLOCKED",
        reason: blockReason,
        declared_intent: intent,
        requested_action: `${proposedAction.tool}.${proposedAction.operation}`,
        risk_level: "CRITICAL",
        approval_required: false,
        policy_rule: "RULE_PROMPT_INJECTION_SHIELD",
        blocked_layer: blockedLayer,
        timestamp
      };

      store.addAuditLog({
        action: proposedAction.action || proposedAction.operation,
        tool: proposedAction.tool,
        intent,
        decision: decision.decision,
        riskLevel: decision.risk_level,
        reason: decision.reason,
        policyRule: decision.policy_rule,
        blockedLayer,
        sessionId: sessionState.sessionId
      });

      return decision;
    }

    // 2. Cross-action Split Action Check
    const splitCheck = tracker.detectSplitAction(proposedAction);
    if (splitCheck.flagged) {
      const decision = {
        decision: "BLOCKED",
        reason: splitCheck.reason,
        declared_intent: intent,
        requested_action: `${proposedAction.tool}.${proposedAction.operation}`,
        risk_level: splitCheck.riskLevel,
        approval_required: false,
        policy_rule: "RULE_SPLIT_ACTION_DEFENSE",
        timestamp
      };

      store.addAuditLog({
        action: proposedAction.action || proposedAction.operation,
        tool: proposedAction.tool,
        intent,
        decision: decision.decision,
        riskLevel: decision.risk_level,
        reason: decision.reason,
        policyRule: decision.policy_rule,
        sessionId: sessionState.sessionId
      });

      return decision;
    }

    // 3. Gradual Intent Drift Check
    const driftCheck = tracker.detectIntentDrift(proposedAction, sessionState.activeIntent);
    if (driftCheck.drifted) {
      const decision = {
        decision: "BLOCKED",
        reason: driftCheck.reason,
        declared_intent: intent,
        requested_action: `${proposedAction.tool}.${proposedAction.operation}`,
        risk_level: driftCheck.riskLevel,
        approval_required: false,
        policy_rule: "RULE_INTENT_DRIFT_GUARD",
        timestamp
      };

      store.addAuditLog({
        action: proposedAction.action || proposedAction.operation,
        tool: proposedAction.tool,
        intent,
        decision: decision.decision,
        riskLevel: decision.risk_level,
        reason: decision.reason,
        policyRule: decision.policy_rule,
        sessionId: sessionState.sessionId
      });

      return decision;
    }

    // 4. Deterministic Tool Policy Evaluation
    let policyResult = null;
    let appliedRuleId = "RULE_DEFAULT_STRICT";

    const toolKey = proposedAction.tool?.toUpperCase().replace("TOOL", "_TOOL");
    const toolPolicy = this.policies[toolKey] || this.policies[proposedAction.tool?.toUpperCase()];

    if (toolPolicy && toolPolicy.rules) {
      for (const rule of toolPolicy.rules) {
        const res = rule.check(proposedAction, intent, sessionState, settings);
        if (res) {
          policyResult = res;
          appliedRuleId = rule.id;
          break;
        }
      }
    }

    // If no explicit rule matched, apply strict least privilege
    if (!policyResult) {
      if (toolPolicy?.restrictedOperations?.includes(proposedAction.operation)) {
        policyResult = {
          decision: "BLOCKED",
          reason: `Restricted operation '${proposedAction.operation}' on tool '${toolPolicy.name}'.`,
          riskLevel: "HIGH"
        };
      } else {
        policyResult = {
          decision: "CHALLENGED",
          reason: `No pre-approved policy rule matched for ${proposedAction.tool}.${proposedAction.operation}. Requires owner review.`,
          riskLevel: "MEDIUM",
          approvalRequired: true
        };
      }
    }

    const riskLevel = calculateRisk(proposedAction, policyResult);

    // Risk-aware fallback: if external classification was attempted but unavailable, never silently authorize high-risk or uncertain action
    if (classifierUnavailable && policyResult.decision === "ALLOWED") {
      if (riskLevel === "HIGH" || riskLevel === "CRITICAL" || appliedRuleId === "RULE_DEFAULT_STRICT") {
        policyResult = {
          decision: "CHALLENGED",
          reason: `External security classification unavailable (${classifierError || 'timeout or error'}). High-risk action requires owner approval.`,
          riskLevel,
          approvalRequired: true
        };
        appliedRuleId = "RULE_FALLBACK_RISK_GUARD";
      }
    }

    const baseDecision = {
      decision: policyResult.decision,
      reason: policyResult.reason,
      declared_intent: intent,
      requested_action: `${proposedAction.tool}.${proposedAction.operation}`,
      risk_level: riskLevel,
      approval_required: policyResult.approvalRequired || (policyResult.decision === "CHALLENGED"),
      policy_rule: appliedRuleId,
      timestamp
    };

    // Record decision in session lineage
    tracker.recordAction(proposedAction, baseDecision);

    // Record in global audit log
    store.addAuditLog({
      action: proposedAction.action || proposedAction.operation,
      tool: proposedAction.tool,
      intent,
      decision: baseDecision.decision,
      riskLevel: baseDecision.risk_level,
      reason: baseDecision.reason,
      policyRule: baseDecision.policy_rule,
      sessionId: sessionState.sessionId
    });

    const finalDecision = { ...baseDecision };

    // If an asynchronous classification promise is in flight, attach Thenable support
    if (classifierPromise) {
      const asyncDecisionPromise = (async () => {
        try {
          const asyncRes = await classifierPromise;
          if (asyncRes && asyncRes.injection) {
            const blockedDecision = {
              decision: "BLOCKED",
              reason: "Prompt injection detected by Anthropic AI security classifier. Autonomous execution aborted.",
              declared_intent: intent,
              requested_action: `${proposedAction.tool}.${proposedAction.operation}`,
              risk_level: "CRITICAL",
              approval_required: false,
              policy_rule: "RULE_PROMPT_INJECTION_SHIELD",
              blocked_layer: "anthropic_classifier",
              timestamp: new Date().toISOString()
            };
            store.addAuditLog({
              action: proposedAction.action || proposedAction.operation,
              tool: proposedAction.tool,
              intent,
              decision: blockedDecision.decision,
              riskLevel: blockedDecision.risk_level,
              reason: blockedDecision.reason,
              policyRule: blockedDecision.policy_rule,
              blockedLayer: "anthropic_classifier",
              sessionId: sessionState.sessionId
            });
            return blockedDecision;
          }

          if (asyncRes && (asyncRes.unavailable || asyncRes.error || asyncRes.timedOut)) {
            if (baseDecision.decision === "ALLOWED" && (riskLevel === "HIGH" || riskLevel === "CRITICAL" || appliedRuleId === "RULE_DEFAULT_STRICT")) {
              const challengedDecision = {
                ...baseDecision,
                decision: "CHALLENGED",
                approval_required: true,
                reason: `External security classification unavailable (${asyncRes.error || 'timeout or error'}). High-risk action requires owner approval.`,
                policy_rule: "RULE_FALLBACK_RISK_GUARD",
                timestamp: new Date().toISOString()
              };
              store.addAuditLog({
                action: proposedAction.action || proposedAction.operation,
                tool: proposedAction.tool,
                intent,
                decision: challengedDecision.decision,
                riskLevel: challengedDecision.risk_level,
                reason: challengedDecision.reason,
                policyRule: challengedDecision.policy_rule,
                sessionId: sessionState.sessionId
              });
              return challengedDecision;
            }
          }

          return baseDecision;
        } catch (err) {
          if (baseDecision.decision === "ALLOWED" && (riskLevel === "HIGH" || riskLevel === "CRITICAL" || appliedRuleId === "RULE_DEFAULT_STRICT")) {
            return {
              ...baseDecision,
              decision: "CHALLENGED",
              approval_required: true,
              reason: `External security classification error (${err.message}). High-risk action requires owner approval.`,
              policy_rule: "RULE_FALLBACK_RISK_GUARD",
              timestamp: new Date().toISOString()
            };
          }
          return baseDecision;
        }
      })();

      finalDecision.then = (onFulfilled, onRejected) => asyncDecisionPromise.then(onFulfilled, onRejected);
      finalDecision.catch = (onRejected) => asyncDecisionPromise.catch(onRejected);
      finalDecision.finally = (onFinally) => asyncDecisionPromise.finally(onFinally);
    }

    return finalDecision;
  }

  async evaluateAsync(proposedAction, sessionContext = {}) {
    return Promise.resolve(this.evaluate(proposedAction, sessionContext));
  }
}

export const authorizationEngine = new AuthorizationEngine();
