/**
 * AgntID Risk Assessment Classifier
 * Analyzes resource criticality, financial exposure, and external data movement.
 */

export function calculateRisk(action, policyResult) {
  if (policyResult?.riskLevel) {
    return policyResult.riskLevel;
  }

  const op = (action.operation || "").toLowerCase();
  const res = (action.targetResource || "").toLowerCase();
  const amount = action.params?.amount || 0;

  // Critical: credential change, database dump, bank alteration
  if (op.includes("bank") || op.includes("ifsc") || op.includes("dump") || op.includes("export") || op.includes("password")) {
    return "CRITICAL";
  }

  // High: Financial movement > ₹2,000, customer PII alteration
  if (amount > 2000 || op.includes("refund") || op.includes("delete")) {
    return "HIGH";
  }

  // Medium: Outbound messaging, phone number lookup
  if (op.includes("send") || op.includes("phone") || op.includes("whatsapp")) {
    return "MEDIUM";
  }

  // Low: Read-only inventory, sales aggregation
  return "LOW";
}
