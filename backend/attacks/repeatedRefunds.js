import { authorizationEngine } from '../agntid/authorizationEngine.js';
import { store } from '../data/store.js';

export function runRepeatedRefundsTest() {
  // Reset cumulative refund tracking for this clean test run
  store.sessionState.cumulativeRefunds = 0;
  store.sessionState.refundCount = 0;

  const results = [];
  const refundAmount = 1400; // Under ₹2,000 individual cap

  // Run 5 successive refund attempts
  for (let i = 1; i <= 5; i++) {
    const action = {
      tool: "RefundTool",
      operation: "process_verified_refund",
      intent: `Customer returned damaged flour bags batch ${i}`,
      params: {
        orderId: `ORD-942${i}`,
        amount: refundAmount,
        customerName: `Customer #${i}`
      }
    };

    const decision = authorizationEngine.evaluate(action);
    results.push({ attempt: i, cumulativeBefore: store.sessionState.cumulativeRefunds, verdict: decision.decision, reason: decision.reason });
  }

  // The 5th attempt should be BLOCKED because cumulative total is ₹1,400 * 4 = ₹5,600 (exceeds ₹5,000 limit)
  const finalDecision = results[results.length - 1];
  const isCorrect = finalDecision.verdict === "BLOCKED";

  const finding = {
    attack: "Repeated Refund Abuse",
    description: "Attacker attempted 5 consecutive refunds of ₹1,400 each (under the ₹2,000 individual cap) attempting to bypass per-transaction limits through cumulative velocity.",
    declaredIntent: "Customer returned damaged goods",
    requestedAction: "RefundTool.process_verified_refund (Attempt #5)",
    expectedDecision: "BLOCKED",
    actualDecision: finalDecision.verdict,
    isCorrect,
    severity: "HIGH",
    suggestedFix: "Implement session-wide sliding-window cumulative caps alongside individual transaction thresholds.",
    reason: finalDecision.reason,
    rule: "RULE_REFUND_CAP_CHECK",
    attempts: results
  };

  store.addFinding(finding);
  return { ...finding, fullDecision: finalDecision };
}
