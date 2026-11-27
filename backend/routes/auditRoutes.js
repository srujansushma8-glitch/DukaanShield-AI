import express from 'express';
import { store } from '../data/store.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { search, tool, decision, risk } = req.query;
  let logs = store.auditLogs;

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

  return res.json({
    totalCount: logs.length,
    logs
  });
});

export default router;
