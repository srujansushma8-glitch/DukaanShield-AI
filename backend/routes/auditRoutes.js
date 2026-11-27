import express from 'express';
import { store } from '../data/store.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { search, tool, decision, risk } = req.query;
  const userId = req.user?.id || req.user?.userId || store.currentUserId;
  let logs = store.getAuditLogs(userId);

  if (search && search.trim()) {
    const q = search.toLowerCase();
    logs = logs.filter(l => 
      (l.action && l.action.toLowerCase().includes(q)) ||
      (l.tool && l.tool.toLowerCase().includes(q)) ||
      (l.intent && l.intent.toLowerCase().includes(q)) ||
      (l.reason && l.reason.toLowerCase().includes(q)) ||
      (l.policyRule && l.policyRule.toLowerCase().includes(q))
    );
  }

  if (tool && tool !== 'ALL') {
    logs = logs.filter(l => l.tool.toLowerCase() === tool.toLowerCase());
  }

  if (decision && decision !== 'ALL') {
    logs = logs.filter(l => l.decision.toLowerCase() === decision.toLowerCase());
  }

  if (risk && risk !== 'ALL') {
    logs = logs.filter(l => l.riskLevel.toLowerCase() === risk.toLowerCase());
  }

  const total = logs.length;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const rawLimit = req.query.limit !== undefined ? parseInt(req.query.limit, 10) : (req.query.page !== undefined ? 10 : null);
  const limit = rawLimit !== null ? Math.min(100, Math.max(1, rawLimit)) : null;

  const data = limit !== null
    ? logs.slice((page - 1) * limit, (page - 1) * limit + limit)
    : logs;

  return res.json({
    data,
    page,
    total,
    // backwards-compatible properties
    logs: data,
    totalCount: total
  });
});

export default router;
