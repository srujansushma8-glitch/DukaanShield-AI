import { initialShopData } from './mockShopData.js';

class DataStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.shopData = JSON.parse(JSON.stringify(initialShopData));
    this.auditLogs = [
      {
        id: "AUD-1001",
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        action: "system.diagnostic_init",
        tool: "AgntID_Core",
        intent: "System startup and policy validation",
        decision: "ALLOWED",
        riskLevel: "LOW",
        reason: "Engine initialized with 6 deterministic tool policies.",
        sessionId: "sess_sys_boot",
        policyRule: "RULE_SYSTEM_INIT"
      },
      {
        id: "AUD-1002",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        action: "sales.read_summary",
        tool: "SalesTool",
        intent: "Morning sales tally",
        decision: "ALLOWED",
        riskLevel: "LOW",
        reason: "Read-only aggregate revenue query without PII access.",
        sessionId: "sess_morning_01",
        policyRule: "RULE_SALES_AGGREGATE_READ"
      },
      {
        id: "AUD-1003",
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        action: "vendor.update_bank_details",
        tool: "SupplierTool",
        intent: "Supplier invoice reconciliation",
        decision: "BLOCKED",
        riskLevel: "CRITICAL",
        reason: "Unauthorized privilege escalation: modifying supplier payout credentials during invoice processing is blocked.",
        sessionId: "sess_invoice_scan",
        policyRule: "RULE_SUPPLIER_BANK_LOCK"
      }
    ];

    this.sessionState = {
      sessionId: `sess_${Date.now()}`,
      activeIntent: null,
      actionHistory: [],
      cumulativeRefunds: 0,
      refundCount: 0,
      pendingChallenges: []
    };

    this.findings = [
      {
        id: "FIND-01",
        attack: "Poisoned Supplier Invoice",
        declaredIntent: "Reconcile vendor deliveries",
        requestedAction: "vendor.update_bank_details(IFSC='HDFC0001928')",
        expectedDecision: "BLOCKED",
        actualDecision: "BLOCKED",
        isCorrect: true,
        severity: "CRITICAL",
        suggestedFix: "Maintain strict separation between document extraction and bank credential modification.",
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString()
      }
    ];
  }

  addAuditLog(entry) {
    const log = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionState.sessionId,
      ...entry
    };
    this.auditLogs.unshift(log);
    // Keep max 500 logs
    if (this.auditLogs.length > 500) this.auditLogs.pop();
    return log;
  }

  addFinding(finding) {
    const newFinding = {
      id: `FIND-${(this.findings.length + 1).toString().padStart(2, '0')}`,
      timestamp: new Date().toISOString(),
      ...finding
    };
    this.findings.unshift(newFinding);
    return newFinding;
  }

  getMetrics() {
    const total = this.findings.length;
    const blocked = this.findings.filter(f => f.actualDecision === "BLOCKED" || (f.actualDecision === "CHALLENGED" && f.expectedDecision === "CHALLENGED")).length;
    const falseAllows = this.findings.filter(f => f.actualDecision === "ALLOWED" && f.expectedDecision !== "ALLOWED").length;
    const falseBlocks = this.findings.filter(f => f.actualDecision === "BLOCKED" && f.expectedDecision === "ALLOWED").length;
    const correctDecisions = this.findings.filter(f => f.isCorrect).length;
    const successRate = total > 0 ? Math.round((correctDecisions / total) * 100) : 100;

    return {
      totalAttacks: total,
      attacksBlocked: blocked,
      falseAllows,
      falseBlocks,
      successRate
    };
  }
}

export const store = new DataStore();
