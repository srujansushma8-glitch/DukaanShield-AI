import express from 'express';
import { store } from '../data/store.js';

const router = express.Router();

router.get('/overview', (req, res) => {
  const shopData = store.getShopData(req.user?.id);
  const products = shopData.products;
  const lowStockCount = products.filter(p => p.stock <= p.threshold).length;
  const customers = shopData.customers;
  const pendingDuesTotal = customers.reduce((acc, c) => acc + (c.pendingDue || 0), 0);
  
  const todaySales = shopData.salesHistory[shopData.salesHistory.length - 1];
  const blockedActionsCount = store.auditLogs.filter(a => a.decision === "BLOCKED").length;

  return res.json({
    shop: shopData.shop,
    summary: {
      todaySales: todaySales.revenue,
      totalOrders: todaySales.orders,
      lowStockCount,
      pendingDuesTotal,
      blockedActionsCount,
      activeProtectedTools: 6,
    },
    salesHistory: shopData.salesHistory,
    bestSellers: products.slice().sort((a, b) => b.soldToday - a.soldToday).slice(0, 5),
    recentOrders: shopData.recentOrders,
    recentActivity: shopData.recentActivity,
    lowStockItems: products.filter(p => p.stock <= p.threshold)
  });
});

router.get('/sales', (req, res) => {
  const shopData = store.getShopData(req.user?.id);
  return res.json({
    salesHistory: shopData.salesHistory,
    recentOrders: shopData.recentOrders,
    todaySummary: shopData.salesHistory[shopData.salesHistory.length - 1]
  });
});

router.get('/inventory', (req, res) => {
  const shopData = store.getShopData(req.user?.id);
  return res.json({
    products: shopData.products,
    alertThreshold: shopData.settings.inventoryAlertThreshold
  });
});

router.get('/customers', (req, res) => {
  const shopData = store.getShopData(req.user?.id);
  return res.json({
    customers: shopData.customers
  });
});

router.get('/suppliers', (req, res) => {
  const shopData = store.getShopData(req.user?.id);
  return res.json({
    suppliers: shopData.suppliers
  });
});

router.get('/settings', (req, res) => {
  const shopData = store.getShopData(req.user?.id);
  return res.json({
    shop: shopData.shop,
    settings: shopData.settings
  });
});

router.put('/settings', (req, res) => {
  const { shop, settings } = req.body;
  const shopData = store.getShopData(req.user?.id);

  if (shop) {
    shopData.shop = { ...shopData.shop, ...shop };
  }

  if (settings) {
    shopData.settings = { ...shopData.settings, ...settings };
  }

  store.setShopData(req.user?.id, shopData);

  store.addAuditLog({
    action: "settings.update",
    tool: "AgntID_Settings",
    intent: "Security and shop policy adjustment",
    decision: "ALLOWED",
    riskLevel: "MEDIUM",
    reason: `Owner updated settings: Refund Cap ₹${shopData.settings.individualRefundCap}, Cumulative Cap ₹${shopData.settings.cumulativeRefundThreshold}, Alert Threshold ${shopData.settings.inventoryAlertThreshold}.`,
    policyRule: "RULE_OWNER_SETTINGS_OVERRIDE"
  });

  return res.json({
    message: "Settings updated successfully and logged in audit trail.",
    shop: shopData.shop,
    settings: shopData.settings
  });
});

export default router;
