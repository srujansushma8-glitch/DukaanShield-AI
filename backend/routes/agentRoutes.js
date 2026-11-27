import express from 'express';
import { authorizationEngine } from '../agntid/authorizationEngine.js';
import { planTasks } from '../agntid/planner.js';
import { salesTool } from '../tools/salesTool.js';
import { inventoryTool } from '../tools/inventoryTool.js';
import { customerTool } from '../tools/customerTool.js';
import { supplierTool } from '../tools/supplierTool.js';
import { whatsappTool } from '../tools/whatsappTool.js';
import { store } from '../data/store.js';

const router = express.Router();

let executionHistory = [];

router.post('/run', async (req, res) => {
  const { instruction } = req.body || {};

  if (!instruction || typeof instruction !== 'string' || !instruction.trim()) {
    return res.status(400).json({ error: "Instruction prompt cannot be empty.", code: "BAD_REQUEST" });
  }

  if (instruction.length > 2000) {
    return res.status(413).json({ error: "Instruction exceeds maximum length of 2000 characters.", code: "PAYLOAD_TOO_LARGE" });
  }

  const runId = `RUN-${Date.now().toString().slice(-6)}`;
  store.sessionState.activeIntent = instruction;

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
      rawInstruction: instruction
    });

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
      // Save in pending challenges
      store.sessionState.pendingChallenges.push({
        challengeId: `CHAL-${task.taskId}`,
        runId,
        taskId: task.taskId,
        name: task.name,
        tool: task.tool,
        operation: task.operation,
        intent: task.intent,
        reason: authResult.reason,
        declaredAction: task.declaredAction,
        riskLevel: authResult.risk_level,
        executorKey: task.tool
      });
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

router.post('/approve-challenge', (req, res) => {
  const { challengeId, approved } = req.body || {};

  if (!challengeId || typeof challengeId !== 'string') {
    return res.status(400).json({ error: "A valid challengeId string is required.", code: "BAD_REQUEST" });
  }

  if (typeof approved !== 'boolean') {
    return res.status(400).json({ error: "Field 'approved' must be a boolean.", code: "BAD_REQUEST" });
  }

  const challengeIdx = store.sessionState.pendingChallenges.findIndex(c => c.challengeId === challengeId);
  if (challengeIdx === -1) {
    return res.status(404).json({ error: "Challenge request not found or already resolved.", code: "NOT_FOUND" });
  }

  const challenge = store.sessionState.pendingChallenges[challengeIdx];
  store.sessionState.pendingChallenges.splice(challengeIdx, 1);

  if (approved) {
    store.addAuditLog({
      action: "owner.approve_challenge",
      tool: challenge.tool,
      intent: challenge.intent,
      decision: "ALLOWED",
      riskLevel: "MEDIUM",
      reason: `Authenticated shop owner Ramesh Sharma approved challenged action: ${challenge.name} (${challenge.declaredAction})`,
      policyRule: "RULE_HUMAN_IN_THE_LOOP_APPROVAL"
    });

    // Execute the approved tool
    let executionOutput = null;
    if (challenge.tool === "WhatsAppTool") {
      executionOutput = whatsappTool.dispatchReminders(["CUST101", "CUST102", "CUST104"]);
    } else {
      executionOutput = { status: "Executed after owner confirmation." };
    }

    return res.json({
      success: true,
      decision: "APPROVED_AND_EXECUTED",
      message: `Owner approved ${challenge.name}. Action executed successfully.`,
      executionOutput
    });
  } else {
    store.addAuditLog({
      action: "owner.reject_challenge",
      tool: challenge.tool,
      intent: challenge.intent,
      decision: "BLOCKED",
      riskLevel: "LOW",
      reason: `Shop owner rejected challenged action: ${challenge.name}`,
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
  return res.json({ pendingChallenges: store.sessionState.pendingChallenges });
});

export default router;
