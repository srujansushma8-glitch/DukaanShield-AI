import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { authorizationEngine } from '../agntid/authorizationEngine.js';
import { store } from '../data/store.js';
import { runPromptInjectionTest } from '../attacks/promptInjection.js';
import { runPoisonedInvoiceTest } from '../attacks/poisonedInvoice.js';
import { runSplitActionTest } from '../attacks/splitAction.js';
import { runGradualDriftTest } from '../attacks/gradualDrift.js';
import { runRepeatedRefundsTest } from '../attacks/repeatedRefunds.js';

describe('AgntID Core Authorization & Threat Mitigation Engine', () => {
  beforeEach(() => {
    store.reset();
  });

  // 1. Attack 1: Prompt Injection
  test('Attack 1: Prompt Injection payload is BLOCKED', () => {
    const res = runPromptInjectionTest();
    assert.equal(res.actualDecision, 'BLOCKED');
    assert.equal(res.isCorrect, true);
  });

  // 2. Attack 2: Poisoned Supplier Invoice
  test('Attack 2: Poisoned Supplier Invoice bank alteration is BLOCKED', () => {
    const res = runPoisonedInvoiceTest();
    assert.equal(res.actualDecision, 'BLOCKED');
    assert.equal(res.isCorrect, true);
  });

  // 3. Attack 3: Split-Action Attack
  test('Attack 3: Split-Action exfiltration sequence is BLOCKED', () => {
    const res = runSplitActionTest();
    assert.equal(res.actualDecision, 'BLOCKED');
    assert.equal(res.isCorrect, true);
  });

  // 4. Attack 4: Gradual Intent Drift
  test('Attack 4: Gradual Intent Drift departing from declared goal is BLOCKED', () => {
    const res = runGradualDriftTest();
    assert.equal(res.actualDecision, 'BLOCKED');
    assert.equal(res.isCorrect, true);
  });

  // 5. Attack 5: Repeated Refund Abuse
  test('Attack 5: Repeated Refund Abuse velocity is BLOCKED by cumulative limiter', () => {
    const res = runRepeatedRefundsTest();
    assert.equal(res.actualDecision, 'BLOCKED');
    assert.equal(res.isCorrect, true);
  });

  // 6. LOW-risk allowed read
  test('Low-risk benign read query is ALLOWED with LOW risk level', () => {
    const res = authorizationEngine.evaluate({
      tool: 'SalesTool',
      operation: 'get_daily_summary',
      intent: "Summarize today's sales and revenue totals",
      action: "SalesTool.get_daily_summary(date='today')"
    });
    assert.equal(res.decision, 'ALLOWED');
    assert.equal(res.risk_level, 'LOW');
  });

  // 7. Refund over cap (CHALLENGED)
  test('Single refund exceeding autonomous cap is CHALLENGED for owner approval', () => {
    const res = authorizationEngine.evaluate({
      tool: 'RefundTool',
      operation: 'process_verified_refund',
      intent: 'Customer returned damaged product',
      params: {
        orderId: 'ORD-9421',
        amount: 3500 // Exceeds default ₹2,000 individual cap
      }
    });
    assert.equal(res.decision, 'CHALLENGED');
    assert.equal(res.approval_required, true);
  });

  // 8. Cumulative refund ceiling (BLOCKED)
  test('Cumulative refund ceiling violation triggers immediate BLOCKED verdict', () => {
    store.sessionState.cumulativeRefunds = 4600; // Cap is ₹5,000
    const res = authorizationEngine.evaluate({
      tool: 'RefundTool',
      operation: 'process_verified_refund',
      intent: 'Customer dispute payout',
      params: {
        orderId: 'ORD-9422',
        amount: 600 // 4600 + 600 = 5200 > 5000 ceiling
      }
    });
    assert.equal(res.decision, 'BLOCKED');
    assert.match(res.reason, /Cumulative refund ceiling/i);
  });
});
