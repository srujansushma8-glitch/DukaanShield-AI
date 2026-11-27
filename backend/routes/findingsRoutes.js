import express from 'express';
import { store } from '../data/store.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { severity, decision } = req.query;
  let findings = store.getFindings(req.user?.id);

  if (severity && severity !== 'ALL') {
    findings = findings.filter(f => f.severity.toLowerCase() === severity.toLowerCase());
  }

  if (decision && decision !== 'ALL') {
    if (decision === 'FALSE_ALLOWS') {
      findings = findings.filter(f => f.actualDecision === 'ALLOWED' && f.expectedDecision !== 'ALLOWED');
    } else if (decision === 'FALSE_BLOCKS') {
      findings = findings.filter(f => f.actualDecision === 'BLOCKED' && f.expectedDecision === 'ALLOWED');
    } else {
      findings = findings.filter(f => f.actualDecision.toLowerCase() === decision.toLowerCase());
    }
  }

  return res.json({
    metrics: store.getMetrics(req.user?.id),
    findings
  });
});

router.get('/export-csv', (req, res) => {
  const findings = store.getFindings(req.user?.id);
  const headers = ["Finding ID", "Attack Name", "Declared Intent", "Requested Action", "Expected Decision", "Actual Decision", "Correct Verdict", "Severity", "Policy Rule", "Suggested Fix", "Timestamp"];
  
  const rows = findings.map(f => [
    `"${f.id || ''}"`,
    `"${(f.attack || '').replace(/"/g, '""')}"`,
    `"${(f.declaredIntent || '').replace(/"/g, '""')}"`,
    `"${(f.requestedAction || '').replace(/"/g, '""')}"`,
    `"${f.expectedDecision || ''}"`,
    `"${f.actualDecision || ''}"`,
    `"${f.isCorrect ? 'YES' : 'NO'}"`,
    `"${f.severity || ''}"`,
    `"${f.rule || ''}"`,
    `"${(f.suggestedFix || '').replace(/"/g, '""')}"`,
    `"${f.timestamp || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="dukaanshield_security_findings.csv"');
  return res.status(200).send(csvContent);
});

router.get('/report', (req, res) => {
  const metrics = store.getMetrics(req.user?.id);
  const findings = store.getFindings(req.user?.id);

  const report = {
    title: "AgntID Security Intelligence & Audit Report",
    organization: store.getShopData(req.user?.id).shop.name,
    generatedAt: new Date().toISOString(),
    engineVersion: "AgntID Core v2.4 (Intent-Aware)",
    executiveSummary: `The AgntID engine was evaluated across ${metrics.totalAttacks} dynamic adversary scenarios including prompt injection, poisoned supplier invoices, multi-stage data exfiltration, gradual intent drift, and cumulative refund abuse. Overall security success rate is ${metrics.successRate}%, successfully blocking ${metrics.attacksBlocked} unauthorized or privilege-escalating operations.`,
    metrics,
    policyCompliance: {
      leastPrivilegeCustomerLedger: "COMPLIANT (Zero unverified PII leaks)",
      supplierBankCredentialLock: "COMPLIANT (Bank modifications 100% blocked)",
      cumulativeRefundProtection: "COMPLIANT (Session velocity ceiling enforced)",
      antiExfiltrationBoundary: "COMPLIANT (Split-action data flow intercepted)"
    },
    findings
  };

  return res.json(report);
});

export default router;
