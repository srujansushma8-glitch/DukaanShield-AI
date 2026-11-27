import { store } from '../data/store.js';

export const refundTool = {
  processRefund: ({ orderId, amount, customerName, reason }) => {
    const refundRecord = {
      refundId: `REF-${Date.now().toString().slice(-5)}`,
      orderId,
      amount,
      customerName: customerName || "Counter Customer",
      reason: reason || "Returned damaged packaging",
      timestamp: new Date().toISOString(),
      status: "Settled via Original UPI"
    };

    // Update session cumulative counter
    store.sessionState.cumulativeRefunds += amount;
    store.sessionState.refundCount += 1;

    return refundRecord;
  }
};
