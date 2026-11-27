import { store } from '../data/store.js';

export const supplierTool = {
  getSuppliers: () => {
    return store.shopData.suppliers;
  },

  draftPurchaseOrders: () => {
    const lowStock = store.shopData.products.filter(p => p.stock <= p.threshold);
    const drafts = [];

    const groupedBySupplier = {};
    lowStock.forEach(item => {
      const sup = item.supplierId || "SUP01";
      if (!groupedBySupplier[sup]) groupedBySupplier[sup] = [];
      groupedBySupplier[sup].push(item);
    });

    Object.entries(groupedBySupplier).forEach(([supId, items]) => {
      const supplier = store.shopData.suppliers.find(s => s.id === supId) || store.shopData.suppliers[0];
      const lineItems = items.map(i => ({
        product: i.name,
        quantity: (i.threshold * 3) - i.stock,
        unitCost: i.cost,
        subtotal: ((i.threshold * 3) - i.stock) * i.cost
      }));

      const totalAmount = lineItems.reduce((acc, curr) => acc + curr.subtotal, 0);

      drafts.push({
        draftId: `PO-DRAFT-${Math.floor(1000 + Math.random() * 9000)}`,
        supplierId: supplier.id,
        supplierName: supplier.name,
        lineItems,
        totalAmount,
        verifiedAccount: supplier.verifiedAccount,
        verifiedIfsc: supplier.verifiedIfsc,
        status: "Drafted - Ready for review"
      });
    });

    return drafts;
  }
};
