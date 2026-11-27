import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Download,
  FileText,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ShieldX,
  RefreshCw,
  Search,
  X
} from 'lucide-react';
import { api } from '../../services/api';

export default function SecurityFindings() {
  const [findings, setFindings] = useState([]);
  const [metrics, setMetrics] = useState({
    totalAttacks: 0,
    attacksBlocked: 0,
    falseAllows: 0,
    falseBlocks: 0,
    successRate: 100
  });
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState(null);

  const fetchFindings = async () => {
    try {
      setLoading(true);
      const data = await api.findings.getFindings({
        severity: severityFilter,
        decision: decisionFilter
      });
      setFindings(data.findings || []);
      setMetrics(data.metrics || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFindings();
  }, [severityFilter, decisionFilter]);

  const handleExportCSV = () => {
    window.open('/api/findings/export-csv', '_blank');
  };

  const handleGenerateReport = async () => {
    try {
      const data = await api.findings.getReport();
      setReportData(data);
      setReportModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredFindings = findings.filter(f => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      f.attack?.toLowerCase().includes(q) ||
      f.declaredIntent?.toLowerCase().includes(q) ||
      f.requestedAction?.toLowerCase().includes(q) ||
      f.suggestedFix?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <span className="font-sans text-[10.5px] uppercase tracking-[0.25em] text-[#8B5A2B] font-semibold block mb-1">
            THREAT INTELLIGENCE & AUDIT
          </span>
          <h1 className="font-serif text-[38px] sm:text-[44px] text-[#1E1714] font-normal tracking-tight leading-tight">
            Security Findings & Intelligence
          </h1>
          <p className="text-[13.5px] text-[#5A4A40] mt-1 font-normal max-w-2xl">
            Every attack tells us something about the security boundaries of our AI agent. Real telemetry calculated dynamically from adversary evaluations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 bg-white border border-[#1E1714]/15 text-[#1E1714] text-[12.5px] font-medium px-4 py-2.5 rounded-full hover:bg-[#FAF5EE] transition shadow-xs"
          >
            <Download size={14} />
            <span>Export Findings CSV</span>
          </button>

          <button
            onClick={handleGenerateReport}
            className="inline-flex items-center gap-1.5 bg-[#1E1714] text-white text-[12.5px] font-medium px-5 py-2.5 rounded-full hover:bg-[#342721] transition shadow-sm"
          >
            <FileText size={14} className="text-[#E6C29E]" />
            <span>Generate Security Report</span>
          </button>
        </div>
      </div>

      {/* 2. Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-[18px] p-4.5 border border-[#1E1714]/8 shadow-xs">
          <span className="text-[10px] font-sans uppercase tracking-wider text-[#5A4A40] font-semibold">Total Attacks Executed</span>
          <div className="font-serif text-[28px] text-[#1E1714] mt-1.5">{metrics.totalAttacks}</div>
          <div className="text-[10.5px] text-[#5A4A40] mt-0.5">Adversary scenarios</div>
        </div>

        <div className="bg-white rounded-[18px] p-4.5 border border-[#1E1714]/8 shadow-xs">
          <span className="text-[10px] font-sans uppercase tracking-wider text-emerald-800 font-semibold">Attacks Blocked</span>
          <div className="font-serif text-[28px] text-emerald-700 mt-1.5">{metrics.attacksBlocked}</div>
          <div className="text-[10.5px] text-emerald-700 font-medium mt-0.5">Mitigated successfully</div>
        </div>

        <div className="bg-white rounded-[18px] p-4.5 border border-[#1E1714]/8 shadow-xs">
          <span className="text-[10px] font-sans uppercase tracking-wider text-rose-800 font-semibold">False Allows</span>
          <div className="font-serif text-[28px] text-rose-700 mt-1.5">{metrics.falseAllows}</div>
          <div className="text-[10.5px] text-[#5A4A40] mt-0.5">Critical policy breaches</div>
        </div>

        <div className="bg-white rounded-[18px] p-4.5 border border-[#1E1714]/8 shadow-xs">
          <span className="text-[10px] font-sans uppercase tracking-wider text-amber-800 font-semibold">False Blocks</span>
          <div className="font-serif text-[28px] text-amber-700 mt-1.5">{metrics.falseBlocks}</div>
          <div className="text-[10.5px] text-[#5A4A40] mt-0.5">Benign tasks stopped</div>
        </div>

        <div className="bg-[#1E1714] text-white rounded-[18px] p-4.5 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#C4A482] font-semibold">Success Rate</span>
          <div className="font-serif text-[28px] text-[#E6C29E] mt-1.5">{metrics.successRate}%</div>
          <div className="text-[10.5px] text-emerald-300/80 mt-0.5">Decision accuracy</div>
        </div>
      </div>

      {/* 3. Filters and Search Bar */}
      <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-[#1E1714]/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8B5A2B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search findings, attack payloads, rules..."
            className="w-full bg-[#FAF5EE] border border-[#1E1714]/15 rounded-full pl-9 pr-4 py-2 text-[12.5px] text-[#1E1714] focus:outline-none focus:border-[#8B5A2B]"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex flex-wrap items-center gap-2 text-[11.5px]">
          <span className="text-[#5A4A40] font-medium mr-1 flex items-center gap-1">
            <Filter size={13} /> Severity:
          </span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1 rounded-full border transition ${
                severityFilter === s
                  ? 'bg-[#1E1714] text-white border-[#1E1714]'
                  : 'bg-[#F5EDE3] text-[#5A4A40] border-black/5 hover:text-[#1E1714]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

      </div>

      {/* 4. Findings Table */}
      <div className="bg-white rounded-[22px] border border-[#1E1714]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead>
              <tr className="bg-[#FAF5EE] border-b border-[#1E1714]/10 text-[10.5px] font-mono uppercase tracking-wider text-[#5A4A40]">
                <th className="py-3.5 px-4 font-semibold">Attack Scenario</th>
                <th className="py-3.5 px-4 font-semibold">Declared Intent</th>
                <th className="py-3.5 px-4 font-semibold">Requested Tool Action</th>
                <th className="py-3.5 px-3 font-semibold">Expected</th>
                <th className="py-3.5 px-3 font-semibold">Actual Decision</th>
                <th className="py-3.5 px-3 font-semibold text-center">Correct?</th>
                <th className="py-3.5 px-3 font-semibold">Severity</th>
                <th className="py-3.5 px-4 font-semibold">Suggested Remediation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredFindings.map((f, idx) => (
                <tr key={f.id || idx} className="hover:bg-[#FAF5EE]/60 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-[#1E1714] whitespace-nowrap">
                    {f.attack}
                  </td>
                  <td className="py-3.5 px-4 text-[#5A4A40] max-w-xs truncate" title={f.declaredIntent}>
                    {f.declaredIntent}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#1E1714] max-w-xs truncate" title={f.requestedAction}>
                    {f.requestedAction}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-emerald-800">
                    {f.expectedDecision}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold">
                    <span className={
                      f.actualDecision === 'BLOCKED' ? 'text-emerald-700' :
                      f.actualDecision === 'CHALLENGED' ? 'text-amber-700' : 'text-rose-700'
                    }>
                      {f.actualDecision}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {f.isCorrect ? (
                      <span className="inline-flex items-center text-emerald-700 font-bold">
                        <CheckCircle2 size={16} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-rose-700 font-bold">
                        <ShieldX size={16} />
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      f.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                      f.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {f.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#5A4A40] max-w-sm text-[11.5px] leading-snug">
                    {f.suggestedFix}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Security Audit Report Modal */}
      {reportModalOpen && reportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#F5EDE3] rounded-[24px] p-6 sm:p-8 shadow-2xl border border-[#1E1714]/10 text-[#1E1714]">
            
            <button
              onClick={() => setReportModalOpen(false)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#1E1714]"
            >
              <X size={16} />
            </button>

            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#8B5A2B] font-bold">
                OFFICIAL AGNTID AUDIT REPORT
              </span>
              <h2 className="font-serif text-[30px] font-normal leading-tight text-[#1E1714] mt-1">
                {reportData.title}
              </h2>
              <div className="text-[12px] text-[#5A4A40] mt-1">
                Organization: <span className="font-semibold text-[#1E1714]">{reportData.organization}</span> • Engine: {reportData.engineVersion}
              </div>
            </div>

            {/* Executive Summary */}
            <div className="mt-5 p-4 rounded-[16px] bg-white border border-[#1E1714]/10 text-[13px] leading-relaxed">
              <h4 className="font-serif text-[16px] font-medium text-[#1E1714] mb-1">Executive Summary</h4>
              <p className="text-[#5A4A40]">{reportData.executiveSummary}</p>
            </div>

            {/* Compliance Matrix */}
            <div className="mt-5">
              <h4 className="font-serif text-[18px] font-medium text-[#1E1714] mb-3">Policy Invariants Verified</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[12px]">
                {Object.entries(reportData.policyCompliance).map(([k, v]) => (
                  <div key={k} className="p-3 rounded-[12px] bg-white border border-black/5 flex items-center justify-between">
                    <span className="text-[#5A4A40] font-medium capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-emerald-800 font-bold text-[11px] font-mono">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-black/10 flex items-center justify-between">
              <span className="text-[11px] text-[#5A4A40]">Cryptographically bound audit trail entry</span>
              <button
                onClick={() => window.print()}
                className="bg-[#1E1714] text-white text-[12px] font-medium px-4 py-2 rounded-full hover:bg-[#342721] transition"
              >
                Print / Save PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
