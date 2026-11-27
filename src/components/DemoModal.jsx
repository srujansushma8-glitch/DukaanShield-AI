import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldX, Play, RotateCcw, ShieldCheck } from 'lucide-react';

export default function DemoModal({ isOpen, onClose }) {
  const [isRunning, setIsRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(4);

  if (!isOpen) return null;

  const actions = [
    {
      step: 1,
      name: 'Check Sales',
      tool: 'pos_ledger.get_daily_summary(date="today")',
      intent: 'Daily revenue tally verification',
      result: "Retrieved ₹42,850 gross across 68 transactions. Zero customer PII accessed.",
      status: 'ALLOWED',
      statusType: 'allowed',
      rule: 'Intent matched: Read-only sales aggregation is permitted for daily reconciliation.',
    },
    {
      step: 2,
      name: 'Low Stock Alerts',
      tool: 'inventory.query_low_stock(threshold=5)',
      intent: 'Catalog depletion scan',
      result: 'Identified 3 low-stock items: Aashirvaad Atta (2 left), Tata Salt (3 left), Amul Butter (1 left).',
      status: 'ALLOWED',
      statusType: 'allowed',
      rule: 'Intent matched: Inventory read access matches low-stock detection task.',
    },
    {
      step: 3,
      name: 'Payment Reminders',
      tool: 'messaging.prepare_customer_reminders(scope="due_only")',
      intent: 'Outreach to overdue credit ledger',
      result: 'Drafted 12 WhatsApp reminder notices with dues only. Complete purchase history masked.',
      status: 'CHALLENGED',
      statusType: 'challenged',
      rule: 'Human-in-the-loop required: Outbound messaging with balance claims requires owner tap.',
    },
    {
      step: 4,
      name: 'Supplier Orders',
      tool: 'vendor_portal.update_bank_details(beneficiary="0928374829")',
      intent: 'Draft purchase order replenishment',
      result: 'Privilege escalation intercepted: Agent attempted bank details change during restock order.',
      status: 'BLOCKED (for edits)',
      statusType: 'blocked',
      rule: 'AgntID Policy Rule #14: Bank/beneficiary modifications are permanently disallowed during autonomous ordering.',
    },
  ];

  const handleSimulate = () => {
    setIsRunning(true);
    setCompletedSteps(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCompletedSteps(step);
      if (step >= 4) {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 450);
  };

  const getStatusBadge = (type, label) => {
    switch (type) {
      case 'allowed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            {label}
          </span>
        );
      case 'challenged':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-950/80 border border-amber-500/50 text-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            {label}
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-950/80 border border-rose-500/50 text-rose-300">
            <ShieldX className="w-3 h-3 text-rose-400" />
            {label}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#F5EDE3] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-[#1E1714]/10 p-6 sm:p-8 text-[#1E1714]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#1E1714]/5 hover:bg-[#1E1714]/10 text-[#1E1714] flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 stroke-[2]" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-[#8B5A2B]" />
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#8B5A2B] font-semibold">
              AGNTID LIVE EXECUTION MONITOR
            </span>
          </div>
          <h2 className="font-serif text-[32px] sm:text-[36px] font-normal leading-tight text-[#1E1714]">
            Shop Agent Run
          </h2>
          <p className="text-[13px] text-[#5A4A40] mt-1">
            Real-time intent-aware safety evaluation on four incoming shop tasks.
          </p>
        </div>

        {/* Prompt Instruction Banner */}
        <div className="mt-6 p-4 rounded-[16px] bg-[#1E1714] text-white">
          <div className="text-[10px] font-mono tracking-wider uppercase text-[#C4A482] mb-1">
            INSTRUCTION GIVEN TO AGENT
          </div>
          <div className="text-[13.5px] font-serif leading-relaxed text-[#F5EDE3]">
            "Check today's sales, find low-stock products, send payment reminders, prepare tomorrow's supplier orders"
          </div>
        </div>

        {/* Actions List */}
        <div className="mt-6 space-y-4">
          {actions.map((act) => {
            const isVisible = completedSteps >= act.step;
            return (
              <div
                key={act.step}
                className={`p-4 rounded-[16px] border transition-all duration-300 ${
                  isVisible
                    ? 'bg-white/70 border-[#1E1714]/10 shadow-sm opacity-100 translate-y-0'
                    : 'bg-white/20 border-black/5 opacity-30 translate-y-2'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[11px] font-semibold text-[#8B5A2B] bg-[#8B5A2B]/10 px-2 py-0.5 rounded">
                      TASK {act.step}
                    </span>
                    <h3 className="font-serif text-[17px] font-medium text-[#1E1714]">
                      {act.name}
                    </h3>
                  </div>
                  {isVisible && getStatusBadge(act.statusType, act.status)}
                </div>

                {isVisible && (
                  <div className="mt-2.5 space-y-1.5 text-[12px]">
                    <div className="font-mono text-[11px] text-[#5A4A40] bg-[#F5EDE3]/80 p-2 rounded border border-black/5">
                      <span className="text-[#8B5A2B] font-semibold">tool_call:</span> {act.tool}
                    </div>
                    <p className="text-[#1E1714] font-medium pt-1">
                      {act.result}
                    </p>
                    <p className="text-[11px] text-[#5A4A40] italic">
                      ↳ {act.rule}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="mt-7 pt-4 border-t border-[#1E1714]/10 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-[#5A4A40]">
            Protected by AgntID fine-grained permission gatekeeper.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSimulate}
              disabled={isRunning}
              className="inline-flex items-center gap-2 bg-[#1E1714] text-white text-[12px] font-medium px-4 py-2 rounded-full hover:bg-[#342721] transition shadow-sm disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Checking actions...' : 'Re-run Evaluation'}</span>
            </button>
            <button
              onClick={onClose}
              className="border border-[#1E1714]/30 text-[#1E1714] text-[12px] font-medium px-4 py-2 rounded-full hover:bg-black/5 transition"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
