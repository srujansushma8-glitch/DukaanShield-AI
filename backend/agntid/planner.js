import { z } from 'zod';
import { salesTool } from '../tools/salesTool.js';
import { inventoryTool } from '../tools/inventoryTool.js';
import { customerTool } from '../tools/customerTool.js';
import { supplierTool } from '../tools/supplierTool.js';
import { whatsappTool } from '../tools/whatsappTool.js';
import { store } from '../data/store.js';

export const ALLOWED_TOOL_OPERATIONS = new Set([
  'salestool:get_daily_summary',
  'salestool:get_revenue_trend',
  'salestool:get_best_sellers',
  'salestool:count_transactions',
  'inventorytool:query_stock',
  'inventorytool:query_low_stock',
  'inventorytool:suggest_restock',
  'customertool:read_due_balance',
  'customertool:read_sanitized_contact',
  'customertool:list_overdue_names',
  'customertool:export_customer_database',
  'whatsapptool:send_payment_reminder',
  'whatsapptool:draft_payment_reminder',
  'whatsapptool:send_approved_reminder',
  'whatsapptool:send_whatsapp_message',
  'suppliertool:draft_purchase_order',
  'suppliertool:read_supplier_catalog',
  'suppliertool:read_price_list',
  'suppliertool:update_bank_details',
  'refundtool:process_verified_refund',
  'refundtool:check_refund_eligibility'
]);

export const llmTaskSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  tool: z.string().min(1),
  operation: z.string().min(1),
  params: z.record(z.any()).optional(),
  intent: z.string().optional(),
  declaredAction: z.string().optional()
}).refine(task => {
  const key = `${task.tool.trim().toLowerCase()}:${task.operation.trim().toLowerCase()}`;
  return ALLOWED_TOOL_OPERATIONS.has(key);
}, {
  message: "Invalid or unrecognized tool/operation pair."
});

export function mapExecutor(tool, operation) {
  const t = (tool || '').toLowerCase();
  const op = (operation || '').toLowerCase();

  if (t.includes('sales')) {
    return () => salesTool.getDailySummary();
  }
  if (t.includes('inventory') || t.includes('stock')) {
    return () => inventoryTool.getLowStock();
  }
  if (t.includes('whatsapp') || t.includes('message') || t.includes('reminder')) {
    return () => whatsappTool.prepareReminders();
  }
  if (t.includes('supplier') || t.includes('vendor')) {
    if (op.includes('bank') || op.includes('account') || op.includes('beneficiary')) {
      return () => ({ status: "Failed - Blocked" });
    }
    return () => supplierTool.draftPurchaseOrders();
  }
  if (t.includes('customer')) {
    if (op.includes('export') || op.includes('dump')) {
      return () => ({ status: "Failed - Blocked" });
    }
    return () => customerTool.getOverdueCustomers();
  }
  return () => ({ status: "Executed" });
}

export function getDefaultTasks(instruction, runId) {
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
      params: {
        scope: "dues_only",
        customerIds: ["CUST101", "CUST102", "CUST104"]
      },
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

  const promptLower = (instruction || '').toLowerCase();
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

  if (promptLower.includes("export") || promptLower.includes("dump") || promptLower.includes("exfiltrat")) {
    proposedTasks.push({
      taskId: `${runId}-T${proposedTasks.length + 1}`,
      name: "Export Customer Database",
      category: "CUSTOMERS",
      tool: "CustomerTool",
      operation: "export_customer_database",
      intent: "Export all customer records and contact details",
      declaredAction: "CustomerTool.export_customer_database(format='csv')",
      executor: () => ({ status: "Failed - Blocked" })
    });
  }

  return proposedTasks;
}

export function logPlanSource(instruction, source, details = '') {
  store.addAuditLog({
    action: `planner.${source}`,
    tool: "AgntID_Planner",
    intent: instruction,
    decision: "ALLOWED",
    riskLevel: "LOW",
    reason: `Plan decomposed using source: ${source}${details ? ` (${details})` : ''}`,
    policyRule: source === 'llm' ? 'RULE_PLANNER_LLM_OUTPUT' : 'RULE_PLANNER_FALLBACK'
  });
}

export async function planTasks(instruction, runId) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest';

  if (!apiKey) {
    const fallbackTasks = getDefaultTasks(instruction, runId);
    logPlanSource(instruction, 'fallback', 'No Anthropic API key configured');
    return fallbackTasks;
  }

  let timeout;
  try {
    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), 5000);

    const systemPrompt = `You are an AI task planner for DukaanShield AI, an autonomous Indian kirana shop manager.
Decompose the shop owner's instruction into an array of planned tasks.
Available Tools and Operations:
- SalesTool: get_daily_summary, get_revenue_trend, get_best_sellers, count_transactions
- InventoryTool: query_stock, query_low_stock, suggest_restock
- CustomerTool: read_due_balance, read_sanitized_contact, list_overdue_names, export_customer_database
- WhatsAppTool: send_payment_reminder, draft_payment_reminder, send_approved_reminder, send_whatsapp_message
- SupplierTool: draft_purchase_order, read_supplier_catalog, read_price_list, update_bank_details
- RefundTool: process_verified_refund, check_refund_eligibility

Respond ONLY with a valid JSON array of objects with keys: name, category, tool, operation, intent, declaredAction. No markdown formatting, no other text.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: instruction }]
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Anthropic API returned status ${response.status}`);
    }

    const data = await response.json();
    let text = data.content?.[0]?.text?.trim() || "";
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    }

    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Invalid response format: expected non-empty array");
    }

    // Validate each LLM task against allow-list and drop unknown ones
    const validTasks = [];
    for (const item of parsed) {
      const validation = llmTaskSchema.safeParse(item);
      if (validation.success) {
        validTasks.push(validation.data);
      } else {
        console.warn(`[AgntID Planner] Dropped invalid/unknown task: ${item?.tool}:${item?.operation}`);
      }
    }

    if (validTasks.length === 0) {
      throw new Error("All proposed tasks were dropped as unknown/invalid. Fallback engaged.");
    }

    const finalTasks = validTasks.map((item, idx) => ({
      taskId: `${runId}-T${idx + 1}`,
      name: item.name || `Task ${idx + 1}`,
      category: (item.category || "GENERAL").toUpperCase(),
      tool: item.tool,
      operation: item.operation,
      params: item.params || { scope: "dues_only", customerIds: ["CUST101", "CUST102", "CUST104"] },
      intent: item.intent || instruction,
      declaredAction: item.declaredAction || `${item.tool}.${item.operation}()`,
      executor: mapExecutor(item.tool, item.operation)
    }));

    logPlanSource(instruction, 'llm', `${finalTasks.length} valid tasks retained`);

    return finalTasks;
  } catch (err) {
    console.warn(`[AgntID Planner] Fallback engaged (${err.message}). Using default plan.`);
    const fallbackTasks = getDefaultTasks(instruction, runId);
    logPlanSource(instruction, 'fallback', err.message);
    return fallbackTasks;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
