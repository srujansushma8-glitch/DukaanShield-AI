import { store } from '../data/store.js';

export const salesTool = {
  getDailySummary: () => {
    const today = store.shopData.salesHistory[store.shopData.salesHistory.length - 1];
    return {
      date: today.date,
      grossRevenue: today.revenue,
      totalTransactions: today.orders,
      averageTicketSize: today.avgTicket,
      topSellingCategories: ["Grains & Flours", "Oils & Ghee", "Packaged Snacks"]
    };
  },

  getRevenueTrend: () => {
    return store.shopData.salesHistory;
  },

  getBestSellers: () => {
    return store.shopData.products
      .slice()
      .sort((a, b) => b.soldToday - a.soldToday)
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        soldToday: p.soldToday,
        revenue: p.soldToday * p.price
      }));
  }
};
