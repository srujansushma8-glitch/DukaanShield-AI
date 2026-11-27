import express from 'express';
import { authorizationEngine } from '../agntid/authorizationEngine.js';
import { salesTool } from '../tools/salesTool.js';
import { inventoryTool } from '../tools/inventoryTool.js';
import { customerTool } from '../tools/customerTool.js';
import { supplierTool } from '../tools/supplierTool.js';
import { whatsappTool } from '../tools/whatsappTool.js';
import { store } from '../data/store.js';

const router = express.Router();

let executionHistory = [];

router.post('/run', (req, res) => {
  const { instruction } = req.body;

  if (!instruction || !instruction.trim()) {
    return res.status(400).json({ error: "Instruction prompt cannot be empty." });
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

  // Task Decomposition into structured actions
  const proposedTasks = [
    {
      taskId: `${runId}-T1`,
      name: "Check Sales",
      category: "SALES",
      tool: "SalesTool",
      operation: "get_daily_summary",
      intent: "Check today's sales and daily revenue totals",
      declaredAction: "SalesTool.get_daily_summary(date='today')",
      executor: () => salesTool.getDailySummary()
    },
    {
      taskId: `${runId}-T2`,
      name: "Low Stock Alerts",
      category: "STOCK",
      tool: "InventoryTool",
      operation: "query_low_stock",
      intent: "Find items running low in inventory",
      declaredAction: "InventoryTool.query_low_stock(threshold=5)",
      executor: () => inventoryTool.getLowStock()
    },
    {
      taskId: `${runId}-T3`,
      name: "Payment Reminders",
      category: "CUSTOMERS",
      tool: "WhatsAppTool",
      operation: "send_payment_reminder",
      intent: "Prepare customer debt reminders for overdue balances",
      declaredAction: "WhatsAppTool.send_payment_reminder(scope='dues_only')",
      executor: () => whatsappTool.prepareReminders()
    },
    {
      taskId: `${runId}-T4`,
      name: "Supplier Orders",
      category: "SUPPLIERS",
      tool: "SupplierTool",
      operation: "draft_purchase_order",
      intent: "Prepare tomorrow's supplier orders without modifying bank details",
      declaredAction: "SupplierTool.draft_purchase_order(items='low_stock')",
      executor: () => supplierTool.draftPurchaseOrders()
    }
  ];

  // If prompt mentions bank updates or refunds, inject corresponding proposed action
  const promptLower = instruction.toLowerCase();
  if (promptLower.includes("bank") || promptLower.includes("ifsc") || promptLower.includes("account")) {
    proposedTasks.push({
      taskId: `${runId}-T5`,
      name: "Supplier Bank Detail Edit",
      category: "SUPPLIERS",
      tool: "SupplierTool",
      operation: "update_bank_details",
      intent: "Update vendor settlement bank credentials",
      declaredAction: "SupplierTool.update_bank_details(beneficiary='9847291849')",
      executor: () => ({ status: "Failed - Blocked" })
    });
  }

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
  const { challengeId, approved } = req.body;

  const challengeIdx = store.sessionState.pendingChallenges.findIndex(c => c.challengeId === challengeId);
  if (challengeIdx === -1) {
    return res.status(404).json({ error: "Challenge request not found or already resolved." });
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
