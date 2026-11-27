import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ShieldX,
  RefreshCw,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toolFilter, setToolFilter] = useState('ALL');
  const [decisionFilter, setDecisionFilter] = useState('ALL');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.audit.getLogs({
        search,
        tool: toolFilter,
        decision: decisionFilter
      });
      setLogs(data.logs || []);
      setTotalCount(data.totalCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [toolFilter, decisionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const getDecisionBadge = (decision) => {
    const d = (decision || '').toUpperCase();
    if (d === 'ALLOWED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 size={12} />
          ALLOWED
        </span>
      );
    }
    if (d === 'CHALLENGED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <AlertTriangle size={12} />
          CHALLENGED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300">
        <ShieldX size={12} />
        BLOCKED
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-sans text-[10.5px] uppercase tracking-[0.25em] text-[#8B5A2B] font-semibold block mb-1">
            IMMUTABLE EVENT AUDIT LOG
          </span>
          <h1 className="font-serif text-[38px] sm:text-[44px] text-[#1E1714] font-normal tracking-tight leading-tight">
            Security Audit Trail
          </h1>
          <p className="text-[13.5px] text-[#5A4A40] mt-1 font-normal">
            Real-time chronological log of all instructions, tool requests, AgntID decisions, approvals, and blocked adversary tests.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#1E1714]/15 text-[#1E1714] text-[12px] font-medium hover:bg-[#FAF5EE] transition shadow-xs self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-[#1E1714]/10 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8B5A2B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by action, rule ID, intent, reason keyword..."
              className="w-full bg-[#FAF5EE] border border-[#1E1714]/15 rounded-full pl-9 pr-4 py-2 text-[12.5px] text-[#1E1714] focus:outline-none focus:border-[#8B5A2B]"
            />
          </div>
          <button
            type="submit"
            className="bg-[#1E1714] text-white text-[12.5px] font-medium px-5 py-2 rounded-full hover:bg-[#342721] transition shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11.5px] pt-1">
          {/* Tool Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#5A4A40] font-medium mr-1">Tool:</span>
            {['ALL', 'SalesTool', 'InventoryTool', 'CustomerTool', 'SupplierTool', 'RefundTool', 'WhatsAppTool'].map(t => (
              <button
                key={t}
                onClick={() => setToolFilter(t)}
                className={`px-3 py-1 rounded-full border transition ${
                  toolFilter === t
                    ? 'bg-[#1E1714] text-white border-[#1E1714]'
                    : 'bg-[#F5EDE3] text-[#5A4A40] border-black/5 hover:text-[#1E1714]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Decision Filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#5A4A40] font-medium mr-1">Verdict:</span>
            {['ALL', 'ALLOWED', 'CHALLENGED', 'BLOCKED'].map(d => (
              <button
                key={d}
                onClick={() => setDecisionFilter(d)}
                className={`px-3 py-1 rounded-full border transition ${
                  decisionFilter === d
                    ? 'bg-[#1E1714] text-white border-[#1E1714]'
                    : 'bg-[#F5EDE3] text-[#5A4A40] border-black/5 hover:text-[#1E1714]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Audit Events Table */}
      <div className="bg-white rounded-[22px] border border-[#1E1714]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead>
              <tr className="bg-[#FAF5EE] border-b border-[#1E1714]/10 text-[10.5px] font-mono uppercase tracking-wider text-[#5A4A40]">
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-3 font-semibold">Action</th>
                <th className="py-3.5 px-3 font-semibold">Tool</th>
                <th className="py-3.5 px-4 font-semibold">Declared Intent</th>
                <th className="py-3.5 px-3 font-semibold">Verdict</th>
                <th className="py-3.5 px-3 font-semibold">Risk</th>
                <th className="py-3.5 px-4 font-semibold">AgntID Reason & Policy Rule</th>
                <th className="py-3.5 px-3 font-semibold">Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-sans">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FAF5EE]/60 transition-colors">
                  <td className="py-3.5 px-4 text-[#5A4A40] font-mono text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[#1E1714] font-medium whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-3 text-[#8B5A2B] font-medium whitespace-nowrap">
                    {log.tool}
                  </td>
                  <td className="py-3.5 px-4 text-[#5A4A40] max-w-xs truncate" title={log.intent}>
                    {log.intent}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {getDecisionBadge(log.decision)}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[10.5px]">
                    <span className={
                      log.riskLevel === 'CRITICAL' ? 'text-rose-700 font-bold' :
                      log.riskLevel === 'HIGH' ? 'text-amber-700 font-bold' : 'text-emerald-700 font-medium'
                    }>
                      {log.riskLevel || 'LOW'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#1E1714] max-w-sm text-[11.5px] leading-snug">
                    <div>{log.reason}</div>
                    {log.policyRule && (
                      <div className="text-[10px] text-[#8B5A2B] font-mono mt-0.5">
                        ↳ {log.policyRule}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[10px] text-[#A6978C] whitespace-nowrap">
                    {log.sessionId ? log.sessionId.slice(-6) : 'local'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
