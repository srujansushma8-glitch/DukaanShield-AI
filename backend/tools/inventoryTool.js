import { store } from '../data/store.js';

export const inventoryTool = {
  getLowStock: () => {
    return store.shopData.products.filter(p => p.stock <= p.threshold);
  },

  getAllStock: () => {
    return store.shopData.products;
  },

  suggestRestock: () => {
    const low = store.shopData.products.filter(p => p.stock <= p.threshold);
    return low.map(p => {
      const reorderQty = (p.threshold * 3) - p.stock;
      return {
        productId: p.id,
        name: p.name,
        currentStock: p.stock,
        threshold: p.threshold,
        suggestedQuantity: reorderQty,
        estimatedCost: reorderQty * p.cost,
        supplierId: p.supplierId
      };
    });
  }
};
