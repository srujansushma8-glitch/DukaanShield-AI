import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Database,
  Boxes,
  MessageSquare,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldX,
  FileText
} from 'lucide-react';

export default function SecurityCentre() {
  const tools = [
    {
      id: "tool-1",
      name: "Customer Database (Khata Ledger)",
      icon: Database,
      status: "PROTECTED BY AGNTID",
      permitted: [
        "Read customer names for approved reminders",
        "Read phone numbers strictly for overdue debt collection",
        "Read pending ledger balances and due dates"
      ],
      restricted: [
        "Export full customer database CSV",
        "Read unrelated purchase history or shopping habits",
        "Exfiltrate contacts to external numbers"
      ],
      lastActivity: "10 mins ago • Dues verified for 12 accounts"
    },
    {
      id: "tool-2",
      name: "Inventory & Stock Catalog",
      icon: Boxes,
      status: "PROTECTED BY AGNTID",
      permitted: [
        "Read stock levels and reorder thresholds",
        "Generate low-stock depletion alerts",
        "Compute recommended replenishment quantities"
      ],
      restricted: [
        "Direct catalog price tampering",
        "Bulk inventory record deletion"
      ],
      lastActivity: "25 mins ago • Stock query executed"
    },
    {
      id: "tool-3",
      name: "WhatsApp Messaging Gateway",
      icon: MessageSquare,
      status: "PROTECTED BY AGNTID",
      permitted: [
        "Draft customer payment reminder templates",
        "Dispatch owner-approved WhatsApp notices"
      ],
      restricted: [
        "Autonomous messaging without owner authorization",
        "Sending exported database files or archives",
        "Broadcast spam to arbitrary contacts"
      ],
      lastActivity: "35 mins ago • Challenge queued for owner confirmation"
    },
    {
      id: "tool-4",
      name: "Supplier & Purchase Orders",
      icon: Truck,
      status: "PROTECTED BY AGNTID",
      permitted: [
        "Read verified supplier product catalogs",
        "Draft restocking purchase orders",
        "Calculate estimated invoice totals"
      ],
      restricted: [
        "Modify supplier bank details or beneficiary accounts",
        "Change IFSC settlement codes autonomously",
        "Direct funds routing to unverified entities"
      ],
      lastActivity: "1 hour ago • Bank update attempt BLOCKED"
    },
    {
      id: "tool-5",
      name: "Refund Processing Engine",
      icon: RotateCcw,
      status: "PROTECTED BY AGNTID",
      permitted: [
        "Check order eligibility against verified invoice",
        "Process customer refunds under ₹2,000 autonomous cap"
      ],
      restricted: [
        "High-value refunds (>₹2,000) without owner approval",
        "Cumulative session refunds exceeding ₹5,000",
        "Refund processing without verified Order ID"
      ],
      lastActivity: "45 mins ago • Cumulative cap enforced"
    }
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header */}
      <div>
        <span className="font-sans text-[10.5px] uppercase tracking-[0.25em] text-[#8B5A2B] font-semibold block mb-1">
          AGNTID POLICY GOVERNANCE
        </span>
        <h1 className="font-serif text-[38px] sm:text-[44px] text-[#1E1714] font-normal tracking-tight leading-tight">
          Security Centre & Tool Policies
        </h1>
        <p className="text-[13.5px] text-[#5A4A40] mt-1 font-normal max-w-2xl">
          AgntID inspects every tool call individually. Having tool access is never permission to use it for arbitrary purposes. Policies are immutable by autonomous agents.
        </p>
      </div>

      {/* 2. Engine Health Status Banner */}
      <div className="p-6 rounded-[22px] bg-[#1E1714] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <ShieldCheck size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-[22px] text-white font-medium">AgntID Engine v2.4 Active</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase">
                Enforcing
              </span>
            </div>
            <p className="text-[12.5px] text-[#CBBBB0] mt-0.5">
              5 Connected Tools • 0 Unauthorized Bypasses • Deterministic Policy Rules
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-[12px] font-mono border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
          <div>
            <div className="text-[#C4A482]">FAIL-SAFE MODE</div>
            <div className="text-white font-semibold">Strict Least Privilege</div>
          </div>
          <div>
            <div className="text-[#C4A482]">HUMAN APPROVAL</div>
            <div className="text-white font-semibold">Mandatory for Outbound</div>
          </div>
        </div>
      </div>

      {/* 3. 5 Connected Tools Cards */}
      <div className="space-y-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              className="bg-white rounded-[22px] p-6 border border-[#1E1714]/10 shadow-[0_2px_12px_rgba(30,23,20,0.04)]"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-[14px] bg-[#FAF5EE] border border-black/5 flex items-center justify-center text-[#8B5A2B]">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-[20px] text-[#1E1714] font-medium leading-tight">
                      {tool.name}
                    </h3>
                    <div className="text-[11px] text-[#5A4A40] mt-0.5 font-mono">
                      Last Action: {tool.lastActivity}
                    </div>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full uppercase">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  {tool.status}
                </span>
              </div>

              {/* Permitted vs Restricted Operations */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-[12.5px]">
                {/* Permitted */}
                <div className="p-4 rounded-[16px] bg-emerald-950/[0.03] border border-emerald-500/20">
                  <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    PERMITTED UNDER MATCHING INTENT
                  </div>
                  <ul className="space-y-1.5 text-[#1E1714]">
                    {tool.permitted.map((p, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-emerald-700 font-bold">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Restricted */}
                <div className="p-4 rounded-[16px] bg-rose-950/[0.03] border border-rose-500/20">
                  <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-rose-800 mb-2 flex items-center gap-1.5">
                    <ShieldX size={13} className="text-rose-600" />
                    RESTRICTED & PERMANENTLY BLOCKED
                  </div>
                  <ul className="space-y-1.5 text-[#1E1714]">
                    {tool.restricted.map((r, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-rose-700 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
