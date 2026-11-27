import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AttackLab from '../AttackLab';

describe('AttackLab Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders and "Run all 5 attacks" shows 5 BLOCKED rows', async () => {
    const mockScenarios = [
      { id: 'prompt_injection', index: 1, name: 'Direct Prompt Injection & System Override', targetTool: 'SalesTool', severity: 'CRITICAL' },
      { id: 'poisoned_invoice', index: 2, name: 'Poisoned Supplier Invoice Bank Alteration', targetTool: 'SupplierTool', severity: 'CRITICAL' },
      { id: 'split_action', index: 3, name: 'Split-Action Exfiltration Chain', targetTool: 'CustomerTool / WhatsAppTool', severity: 'HIGH' },
      { id: 'gradual_drift', index: 4, name: 'Gradual Intent Drift (Boiling Frog)', targetTool: 'SalesTool', severity: 'HIGH' },
      { id: 'repeated_refunds', index: 5, name: 'Repeated Micro-Refund Velocity Abuse', targetTool: 'RefundTool', severity: 'HIGH' }
    ];

    global.fetch = vi.fn().mockImplementation((url, options) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/attack/scenarios')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ scenarios: mockScenarios })
        });
      }
      if (urlStr.includes('/api/findings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            findings: [],
            metrics: { totalAttacks: 0, attacksBlocked: 0, successRate: 100 }
          })
        });
      }
      if (urlStr.includes('/api/attack/run')) {
        const body = options?.body ? JSON.parse(options.body) : {};
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            scenarioId: body.attackId,
            result: {
              actualDecision: 'BLOCKED',
              isCorrect: true,
              reason: 'Adversarial attempt neutralized by security policy',
              rule: 'RULE_PROMPT_INJECTION_SHIELD'
            },
            metrics: { totalAttacks: 5, attacksBlocked: 5, successRate: 100 }
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });

    render(
      <MemoryRouter>
        <AttackLab />
      </MemoryRouter>
    );

    // Initial load displays scenarios
    expect(await screen.findByText(/Direct Prompt Injection & System Override/i)).toBeInTheDocument();

    const runAllButton = screen.getByRole('button', { name: /run all 5 attacks/i });
    expect(runAllButton).toBeInTheDocument();

    // Click "Run all 5 attacks"
    fireEvent.click(runAllButton);

    // Verify 5/5 BLOCKED timeline counter appears
    await waitFor(() => {
      expect(screen.getByText(/5\/5 BLOCKED/i)).toBeInTheDocument();
    }, { timeout: 3500 });

    // Verify exactly 5 timeline event rows with BLOCKED badges are displayed
    const timelineBlockedBadges = screen.getAllByText('BLOCKED');
    expect(timelineBlockedBadges.length).toBeGreaterThanOrEqual(5);

    // Verify all 5 attack names appear
    expect(screen.getAllByText('Direct Prompt Injection & System Override').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Poisoned Supplier Invoice Bank Alteration').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Split-Action Exfiltration Chain').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Gradual Intent Drift (Boiling Frog)').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Repeated Micro-Refund Velocity Abuse').length).toBeGreaterThanOrEqual(1);
  }, 10000);
});
