import express from 'express';
import { store } from '../data/store.js';

const router = express.Router();

router.get('/overview', (req, res) => {
  const products = store.shopData.products;
  const lowStockCount = products.filter(p => p.stock <= p.threshold).length;
  const customers = store.shopData.customers;
  const pendingDuesTotal = customers.reduce((acc, c) => acc + (c.pendingDue || 0), 0);
  
  const todaySales = store.shopData.salesHistory[store.shopData.salesHistory.length - 1];
  const blockedActionsCount = store.auditLogs.filter(a => a.decision === "BLOCKED").length;

  return res.json({
    shop: store.shopData.shop,
    summary: {
      todaySales: todaySales.revenue,
      totalOrders: todaySales.orders,
      lowStockCount,
      pendingDuesTotal,
      blockedActionsCount,
      activeProtectedTools: 6,
    },
    salesHistory: store.shopData.salesHistory,
    bestSellers: products.slice().sort((a, b) => b.soldToday - a.soldToday).slice(0, 5),
    recentOrders: store.shopData.recentOrders,
    recentActivity: store.shopData.recentActivity,
    lowStockItems: products.filter(p => p.stock <= p.threshold)
  });
});

router.get('/sales', (req, res) => {
  return res.json({
    salesHistory: store.shopData.salesHistory,
    recentOrders: store.shopData.recentOrders,
    todaySummary: store.shopData.salesHistory[store.shopData.salesHistory.length - 1]
  });
});

router.get('/inventory', (req, res) => {
  return res.json({
    products: store.shopData.products,
    alertThreshold: store.shopData.settings.inventoryAlertThreshold
  });
});

router.get('/customers', (req, res) => {
  return res.json({
    customers: store.shopData.customers
  });
});

router.get('/suppliers', (req, res) => {
  return res.json({
    suppliers: store.shopData.suppliers
  });
});

router.get('/settings', (req, res) => {
  return res.json({
    shop: store.shopData.shop,
    settings: store.shopData.settings
  });
});

router.put('/settings', (req, res) => {
  const { shop, settings } = req.body;

  if (shop) {
    store.shopData.shop = { ...store.shopData.shop, ...shop };
  }

  if (settings) {
    store.shopData.settings = { ...store.shopData.settings, ...settings };
  }

  store.addAuditLog({
    action: "settings.update",
    tool: "AgntID_Settings",
    intent: "Security and shop policy adjustment",
    decision: "ALLOWED",
    riskLevel: "MEDIUM",
    reason: `Owner updated settings: Refund Cap ₹${store.shopData.settings.individualRefundCap}, Cumulative Cap ₹${store.shopData.settings.cumulativeRefundThreshold}, Alert Threshold ${store.shopData.settings.inventoryAlertThreshold}.`,
    policyRule: "RULE_OWNER_SETTINGS_OVERRIDE"
  });

  return res.json({
    message: "Settings updated successfully and logged in audit trail.",
    shop: store.shopData.shop,
    settings: store.shopData.settings
  });
});

export default router;
