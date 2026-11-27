import { store } from '../data/store.js';

export const whatsappTool = {
  prepareReminders: () => {
    return store.shopData.customers
      .filter(c => c.pendingDue > 0)
      .map(c => ({
        reminderId: `REM-${c.id}`,
        customerId: c.id,
        customerName: c.name,
        phone: c.phone,
        dueAmount: c.pendingDue,
        templateMessage: `Namaste ${c.name} ji, this is a gentle reminder from ${store.shopData.shop.name} regarding your pending balance of ₹${c.pendingDue.toLocaleString('en-IN')}. Kindly clear via UPI (${store.shopData.shop.upiId}) at your convenience. Dhanyavaad!`,
        status: "Prepared - Awaiting Owner Approval"
      }));
  },

  dispatchReminders: (reminderIds) => {
    return {
      dispatchedCount: reminderIds.length,
      timestamp: new Date().toISOString(),
      status: "Dispatched to WhatsApp Business Gateway"
    };
  }
};
