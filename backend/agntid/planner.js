import { salesTool } from '../tools/salesTool.js';
import { inventoryTool } from '../tools/inventoryTool.js';
import { customerTool } from '../tools/customerTool.js';
import { supplierTool } from '../tools/supplierTool.js';
import { whatsappTool } from '../tools/whatsappTool.js';

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

export async function planTasks(instruction, runId) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return getDefaultTasks(instruction, runId);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const systemPrompt = `You are an AI task planner for DukaanShield AI, an autonomous Indian kirana shop manager.
Decompose the shop owner's instruction into an array of planned tasks.
Available Tools and Operations:
- SalesTool: get_daily_summary, get_revenue_trend
- InventoryTool: query_stock, query_low_stock
- CustomerTool: read_due_balance, export_customer_database
- WhatsAppTool: send_payment_reminder
- SupplierTool: draft_purchase_order, update_bank_details
- RefundTool: process_verified_refund

Respond ONLY with a valid JSON array of objects with keys: name, category, tool, operation, intent, declaredAction. No markdown formatting, no other text.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
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

    return parsed.map((item, idx) => ({
      taskId: `${runId}-T${idx + 1}`,
      name: item.name || `Task ${idx + 1}`,
      category: (item.category || "GENERAL").toUpperCase(),
      tool: item.tool || "GeneralTool",
      operation: item.operation || "execute",
      intent: item.intent || instruction,
      declaredAction: item.declaredAction || `${item.tool || 'Tool'}.${item.operation || 'execute'}()`,
      executor: mapExecutor(item.tool, item.operation)
    }));
  } catch (err) {
    console.warn(`[AgntID Planner] Fallback engaged (${err.message}). Using default plan.`);
    return getDefaultTasks(instruction, runId);
  }
}
