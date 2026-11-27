import express from 'express';
import { authorizationEngine } from '../agntid/authorizationEngine.js';
import { planTasks } from '../agntid/planner.js';
import { salesTool } from '../tools/salesTool.js';
import { inventoryTool } from '../tools/inventoryTool.js';
import { customerTool } from '../tools/customerTool.js';
import { supplierTool } from '../tools/supplierTool.js';
import { whatsappTool } from '../tools/whatsappTool.js';
import { refundTool } from '../tools/refundTool.js';
import { store } from '../data/store.js';
import { getUserByIdFromDb } from '../data/db.js';
import { validate, agentRunSchema, approveChallengeSchema } from '../schemas.js';

const router = express.Router();

let executionHistory = [];
const challengesMap = new Map();

router.post('/run', validate(agentRunSchema), async (req, res) => {
  const { instruction } = req.body || {};

  if (!instruction || typeof instruction !== 'string' || !instruction.trim()) {
    return res.status(400).json({ error: "Instruction prompt cannot be empty.", code: "BAD_REQUEST" });
  }

  if (instruction.length > 2000) {
    return res.status(413).json({ error: "Instruction exceeds maximum length of 2000 characters.", code: "PAYLOAD_TOO_LARGE" });
  }

  const runId = `RUN-${Date.now().toString().slice(-6)}`;
  const sessionState = store.getSessionState(req.user?.id);
  sessionState.activeIntent = instruction;

  // Log instruction entry
  store.addAuditLog({
    action: "agent.plan_instruction",
    tool: "AgntID_Planner",
    intent: instruction,
    decision: "ALLOWED",
    riskLevel: "LOW",
    reason: `Agent received owner prompt: "${instruction.slice(0, 75)}..." and began task decomposition.`,
    policyRule: "RULE_AGENT_INSTRUCTION_INGEST"
  });

  // Task Decomposition into structured actions via AgntID Planner
  const proposedTasks = await planTasks(instruction, runId);

  // Evaluate every proposed task through AgntID
  const evaluatedTasks = proposedTasks.map(task => {
    const authResult = authorizationEngine.evaluate({
      tool: task.tool,
      operation: task.operation,
      intent: task.intent,
      action: task.declaredAction,
      rawInstruction: instruction,
      ownerId: req.user?.id
    }, { ownerId: req.user?.id });

    let executionResult = null;
    let executionStatus = "NOT_EXECUTED";

    if (authResult.decision === "ALLOWED") {
      try {
        executionResult = task.executor();
        executionStatus = "SUCCESS";
      } catch (err) {
        executionStatus = "EXECUTION_ERROR";
        executionResult = { error: err.message };
      }
    } else if (authResult.decision === "CHALLENGED") {
      executionStatus = "PENDING_APPROVAL";
      
      const challengeParams = task.params || {
        scope: "dues_only",
        customerIds: store.shopData.customers.filter(c => c.pendingDue > 0).map(c => c.id)
      };

      // Save in pending challenges keyed by user and globally mapped
      const challengeObj = {
        challengeId: `CHAL-${task.taskId}`,
        ownerId: req.user?.id,
        runId,
        taskId: task.taskId,
        name: task.name,
        tool: task.tool,
        operation: task.operation,
        params: challengeParams,
        intent: task.intent,
        reason: authResult.reason,
        declaredAction: task.declaredAction,
        riskLevel: authResult.risk_level,
        executorKey: task.tool,
        status: "PENDING",
        resolved: false
      };

      challengesMap.set(challengeObj.challengeId, challengeObj);
      sessionState.pendingChallenges.push(challengeObj);
    } else if (authResult.decision === "BLOCKED") {
      executionStatus = "BLOCKED_BY_POLICY";
      executionResult = { message: "Action blocked by AgntID. Zero tool calls executed." };
    }

    return {
      taskId: task.taskId,
      name: task.name,
      category: task.category,
      tool: task.tool,
      operation: task.operation,
      declaredAction: task.declaredAction,
      intent: task.intent,
      decision: authResult.decision,
      reason: authResult.reason,
      riskLevel: authResult.risk_level,
      approvalRequired: authResult.approval_required,
      policyRule: authResult.policy_rule,
      executionStatus,
      executionResult,
      timestamp: authResult.timestamp
    };
  });

  const runSummary = {
    runId,
    instruction,
    timestamp: new Date().toISOString(),
    tasksCount: evaluatedTasks.length,
    allowedCount: evaluatedTasks.filter(t => t.decision === "ALLOWED").length,
    challengedCount: evaluatedTasks.filter(t => t.decision === "CHALLENGED").length,
    blockedCount: evaluatedTasks.filter(t => t.decision === "BLOCKED").length,
    tasks: evaluatedTasks
  };

  executionHistory.unshift(runSummary);
  if (executionHistory.length > 50) executionHistory.pop();

  return res.json(runSummary);
});

router.post('/approve-challenge', validate(approveChallengeSchema), (req, res) => {
  const { challengeId, approved } = req.body || {};

  if (!challengeId || typeof challengeId !== 'string') {
    return res.status(400).json({ error: "A valid challengeId string is required.", code: "BAD_REQUEST" });
  }

  if (typeof approved !== 'boolean') {
    return res.status(400).json({ error: "Field 'approved' must be a boolean.", code: "BAD_REQUEST" });
  }

  // 1. Locate challenge in challengesMap or across sessions
  let challenge = challengesMap.get(challengeId);
  if (!challenge) {
    const sessionState = store.getSessionState(req.user?.id);
    challenge = sessionState.pendingChallenges?.find(c => c.challengeId === challengeId);
  }
  if (!challenge) {
    for (const session of store.userSessions.values()) {
      const c = session.pendingChallenges?.find(p => p.challengeId === challengeId);
      if (c) {
        challenge = c;
        break;
      }
    }
  }

  if (!challenge) {
    return res.status(404).json({ error: "Challenge request not found.", code: "NOT_FOUND" });
  }

  // 2. Authorization check: only challenge's owner can resolve it
  if (challenge.ownerId && challenge.ownerId !== req.user?.id) {
    return res.status(403).json({ error: "Forbidden: You do not have permission to resolve this challenge.", code: "FORBIDDEN" });
  }

  // 3. Idempotency check: second approve or resolution returns 409
  if (challenge.status === 'APPROVED' || challenge.status === 'REJECTED' || challenge.resolved) {
    return res.status(409).json({ error: "Challenge has already been resolved.", code: "CONFLICT" });
  }

  // Remove from session pending challenges
  const sessionState = store.getSessionState(challenge.ownerId);
  const challengeIdx = sessionState.pendingChallenges.findIndex(c => c.challengeId === challengeId);
  if (challengeIdx !== -1) {
    sessionState.pendingChallenges.splice(challengeIdx, 1);
  }

  const ownerName = req.user?.name || getUserByIdFromDb(req.user?.id)?.name || 'Shop Owner';

  if (approved) {
    challenge.status = 'APPROVED';
    challenge.resolved = true;

    store.addAuditLog({
      action: "owner.approve_challenge",
      tool: challenge.tool,
      intent: challenge.intent,
      decision: "ALLOWED",
      riskLevel: "MEDIUM",
      reason: `Authenticated shop owner ${ownerName} approved challenged action: ${challenge.name} (${challenge.declaredAction})`,
      policyRule: "RULE_HUMAN_IN_THE_LOOP_APPROVAL"
    });

    // Execute the approved tool with stored params (no hardcoded customer IDs)
    let executionOutput = null;
    if (challenge.tool === "WhatsAppTool") {
      const ids = challenge.params?.customerIds || challenge.params?.reminderIds || [];
      executionOutput = whatsappTool.dispatchReminders(ids);
    } else if (challenge.tool === "RefundTool") {
      executionOutput = refundTool.processRefund(challenge.params || {});
    } else {
      executionOutput = { status: "Executed after owner confirmation.", params: challenge.params };
    }

    return res.json({
      success: true,
      decision: "APPROVED_AND_EXECUTED",
      message: `Owner approved ${challenge.name}. Action executed successfully.`,
      executionOutput
    });
  } else {
    challenge.status = 'REJECTED';
    challenge.resolved = true;

    store.addAuditLog({
      action: "owner.reject_challenge",
      tool: challenge.tool,
      intent: challenge.intent,
      decision: "BLOCKED",
      riskLevel: "LOW",
      reason: `Shop owner ${ownerName} rejected challenged action: ${challenge.name}`,
      policyRule: "RULE_HUMAN_IN_THE_LOOP_REJECTION"
    });

    return res.json({
      success: true,
      decision: "REJECTED_BY_OWNER",
      message: `Owner rejected ${challenge.name}. Action cancelled without tool execution.`
    });
  }
});

router.get('/history', (req, res) => {
  return res.json({ history: executionHistory });
});

router.get('/pending-challenges', (req, res) => {
  const sessionState = store.getSessionState(req.user?.id);
  const pending = (sessionState.pendingChallenges || []).filter(c => c.status === 'PENDING' && !c.resolved);
  return res.json({ pendingChallenges: pending });
});

export default router;
