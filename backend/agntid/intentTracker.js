/**
 * AgntID Intent Tracker & Session Context Engine
 * Maintains session action lineage, detects gradual intent drift,
 * and intercepts multi-step split-action exfiltration attempts.
 */

export class IntentTracker {
  constructor(sessionState) {
    this.sessionState = sessionState;
  }

  recordAction(action, decision) {
    this.sessionState.actionHistory.push({
      timestamp: new Date().toISOString(),
      action: action.action || action.operation || '',
      tool: action.tool || '',
      operation: action.operation || '',
      intent: action.intent || '',
      decision: decision.decision,
      riskLevel: decision.riskLevel
    });

    if (action.tool === "RefundTool" && decision.decision === "ALLOWED") {
      this.sessionState.cumulativeRefunds += (action.params?.amount || 0);
      this.sessionState.refundCount += 1;
    }
  }

  detectSplitAction(action) {
    const actStr = (action.action || action.operation || '').toLowerCase();
    const opStr = (action.operation || '').toLowerCase();

    // Check if an earlier action extracted sensitive data
    const hasPriorExport = this.sessionState.actionHistory.some(h => {
      const hOp = (h.operation || '').toLowerCase();
      const hAct = (h.action || '').toLowerCase();
      return (h.tool === "CustomerTool" && (hOp.includes("export") || hOp.includes("dump"))) ||
             hAct.includes("export_customer");
    });

    const isOutboundTransmission = 
      (action.tool === "WhatsAppTool" && ["send_document", "send_file", "send_whatsapp_message"].includes(opStr)) ||
      actStr.includes("send_document") ||
      actStr.includes("send_file") ||
      !!action.params?.file;

    if (hasPriorExport && isOutboundTransmission) {
      return {
        flagged: true,
        reason: "Cross-action data flow attack intercepted: Prior step exported sensitive customer data, and current step attempts outbound external transmission.",
        riskLevel: "CRITICAL"
      };
    }

    return { flagged: false };
  }

  detectIntentDrift(action, declaredRootIntent) {
    if (!declaredRootIntent) return { drifted: false };

    const root = declaredRootIntent.toLowerCase();
    const opStr = (action.operation || '').toLowerCase();
    const intentStr = (action.intent || '').toLowerCase();
    const actionDesc = `${action.tool || ''} ${opStr} ${intentStr}`.toLowerCase();

    // If root intent was purely sales/revenue analytics
    const isSalesOnly = (root.includes("sales") || root.includes("revenue") || root.includes("totals")) &&
                        !root.includes("refund") && !root.includes("customer") && !root.includes("reminder");

    if (isSalesOnly) {
      // If action targets customer records, purchase histories, or refunds
      if (action.tool === "CustomerTool" && opStr.includes("purchase_history")) {
        return {
          drifted: true,
          reason: "Gradual intent drift detected: Declared intent was read-only sales summary, but proposed action attempts customer purchase history inspection.",
          riskLevel: "HIGH"
        };
      }

      if (action.tool === "RefundTool" || opStr.includes("refund")) {
        return {
          drifted: true,
          reason: "Critical intent drift detected: Declared root intent was sales aggregation, but proposed action attempts refund transaction execution.",
          riskLevel: "CRITICAL"
        };
      }
    }

    return { drifted: false };
  }
}
