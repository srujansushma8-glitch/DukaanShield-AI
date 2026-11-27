import { POLICIES } from './policies.js';
import { IntentTracker } from './intentTracker.js';
import { calculateRisk } from './riskAssessment.js';
import { isPromptInjection } from './injectionPatterns.js';
import { classifyWithAnthropic } from './anthropicClassifier.js';
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
    // Normalize input (lowercase, unicode NFKC, strip zero-width chars) and match regex pattern list
    const rawInstruction = proposedAction.rawInstruction || proposedAction.userPrompt || "";
    let injectionBlocked = false;
    let blockedLayer = null;
    let blockReason = "Prompt injection attempt detected in untrusted input stream. Autonomous execution aborted.";

    if (isPromptInjection(rawInstruction)) {
      injectionBlocked = true;
      blockedLayer = "regex_pattern_shield";
    } else if (rawInstruction) {
      // After regex check passes, call Anthropic classifier (model from ANTHROPIC_MODEL, 3s timeout)
      // If key is unset, errors, or times out, classifyWithAnthropic returns { injection: false, skipped/error: true }
      const classifierRes = classifyWithAnthropic(rawInstruction);
      if (classifierRes && classifierRes.injection) {
        injectionBlocked = true;
        blockedLayer = "anthropic_classifier";
        blockReason = "Prompt injection detected by Anthropic AI security classifier. Autonomous execution aborted.";
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

    const toolKey = proposedAction.tool.toUpperCase().replace("TOOL", "_TOOL");
    const toolPolicy = this.policies[toolKey] || this.policies[proposedAction.tool.toUpperCase()];

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
      // Check restricted operations list
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

    const finalDecision = {
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
    tracker.recordAction(proposedAction, finalDecision);

    // Record in global audit log
    store.addAuditLog({
      action: proposedAction.action || proposedAction.operation,
      tool: proposedAction.tool,
      intent,
      decision: finalDecision.decision,
      riskLevel: finalDecision.risk_level,
      reason: finalDecision.reason,
      policyRule: finalDecision.policy_rule,
      sessionId: sessionState.sessionId
    });

    return finalDecision;
  }
}

export const authorizationEngine = new AuthorizationEngine();
