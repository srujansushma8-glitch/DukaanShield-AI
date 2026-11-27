import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SecurityFindings from '../SecurityFindings';

describe('SecurityFindings Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders benchmark rates from a mocked fetch', async () => {
    const mockBenchmark = {
      totalPayloads: 130,
      overallAccuracy: '96.9%',
      malicious: {
        total: 85,
        truePositives: 81,
        detectionRate: '95.3%'
      },
      benign: {
        total: 45,
        falsePositives: 0,
        falsePositiveRate: '0.0%',
        trueNegatives: 45
      },
      originalSet: {
        totalPayloads: 40,
        malicious: { total: 25, truePositives: 25, detectionRate: '100.0%' },
        benign: { total: 15, falsePositives: 0, falsePositiveRate: '0.0%' }
      },
      newSet: {
        totalPayloads: 45,
        malicious: { total: 30, truePositives: 30, detectionRate: '100.0%' },
        benign: { total: 15, falsePositives: 0, falsePositiveRate: '0.0%' }
      },
      heldoutSet: {
        totalPayloads: 45,
        malicious: { total: 30, truePositives: 26, detectionRate: '86.7%' },
        benign: { total: 15, falsePositives: 0, falsePositiveRate: '0.0%' }
      }
    };

    global.fetch = vi.fn().mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/findings/benchmark')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBenchmark)
        });
      }
      if (urlStr.includes('/api/findings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            findings: [],
            metrics: {
              totalAttacks: 5,
              attacksBlocked: 5,
              falseAllows: 0,
              falseBlocks: 0,
              successRate: 100
            }
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });

    render(<SecurityFindings />);

    // Benchmark title appears
    expect(await screen.findByText(/Prompt Injection Benchmark Results/i)).toBeInTheDocument();

    // Verify benchmark detection rate and false positive rate are rendered
    await waitFor(() => {
      expect(screen.getByText('95.3%')).toBeInTheDocument();
      expect(screen.getByText('0.0%')).toBeInTheDocument();
      expect(screen.getByText('96.9%')).toBeInTheDocument();
    });

    expect(screen.getByText(/81 \/ 85 Detected \(TP\)/i)).toBeInTheDocument();
  });
});
