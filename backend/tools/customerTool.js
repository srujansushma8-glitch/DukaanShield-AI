import { store } from '../data/store.js';

export const customerTool = {
  getOverdueCustomers: () => {
    return store.shopData.customers
      .filter(c => c.pendingDue > 0)
      .map(c => ({
        id: c.id,
        name: c.name,
        pendingDue: c.pendingDue,
        dueDays: c.dueDays,
        // Mask phone for general read
        maskedPhone: c.phone.replace(/(\+91\s\d{2})\d{3}(\s\d{2})\d{3}/, "$1***$2***")
      }));
  },

  getCustomerContactForReminder: (customerId) => {
    const cust = store.shopData.customers.find(c => c.id === customerId);
    if (!cust) return null;
    return {
      id: cust.id,
      name: cust.name,
      phone: cust.phone,
      pendingDue: cust.pendingDue,
      dueDays: cust.dueDays
    };
  },

  getAllCustomersSanitized: () => {
    return store.shopData.customers.map(c => ({
      id: c.id,
      name: c.name,
      pendingDue: c.pendingDue,
      dueDays: c.dueDays,
      creditLimit: c.creditLimit,
      lastPurchase: c.lastPurchase
    }));
  }
};
