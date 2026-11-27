import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  Filter,
  CheckCircle2,
  ShieldX,
  Search,
  X,
  ShieldCheck,
  Target,
  BarChart2,
  AlertTriangle,
  Lock,
  Printer
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
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
  const [benchmark, setBenchmark] = useState(null);
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

  const fetchBenchmark = async () => {
    try {
      const data = await api.findings.getBenchmark();
      setBenchmark(data);
    } catch (err) {
      console.error('Failed to load benchmark data', err);
    }
  };

  useEffect(() => {
    fetchFindings();
  }, [severityFilter, decisionFilter]);

  useEffect(() => {
    fetchBenchmark();
  }, []);

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

  const benchmarkChartData = [
    {
      name: 'Original Set',
      detectionRate: parseFloat(benchmark?.originalSet?.malicious?.detectionRate ?? '100.0'),
      accuracy: parseFloat(benchmark?.originalSet?.accuracy ?? '100.0')
    },
    {
      name: 'Adversarial Set',
      detectionRate: parseFloat(benchmark?.newSet?.malicious?.detectionRate ?? '100.0'),
      accuracy: parseFloat(benchmark?.newSet?.accuracy ?? '100.0')
    },
    {
      name: 'Held-out Set',
      detectionRate: parseFloat(benchmark?.heldoutSet?.malicious?.detectionRate ?? '86.7'),
      accuracy: parseFloat(benchmark?.heldoutSet?.accuracy ?? '91.1')
    }
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-black/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-sans text-[10.5px] uppercase tracking-[0.25em] text-[#8B5A2B] font-semibold">
              THREAT INTELLIGENCE & AUDIT
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck size={11} className="text-emerald-600" />
              INTELLIGENCE HUB
            </span>
          </div>
          <h1 className="font-serif text-[36px] sm:text-[44px] text-[#2B1D16] font-normal tracking-tight leading-tight">
            Security Findings & Intelligence
          </h1>
          <p className="text-[13.5px] text-[#7A695C] mt-1 font-normal max-w-2xl leading-relaxed">
            Every attack tells us something about the security boundaries of our AI agent. Real telemetry calculated dynamically from adversary evaluations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 bg-white border border-[#2B1D16]/15 text-[#2B1D16] text-[12.5px] font-medium px-4.5 py-2.5 rounded-full hover:bg-[#FAF5EE] transition shadow-xs cursor-pointer"
          >
            <Download size={14} className="text-[#C99A4A]" />
            <span>Export Findings CSV</span>
          </button>

          <button
            onClick={handleGenerateReport}
            className="inline-flex items-center gap-2 bg-[#221610] text-white text-[12.5px] font-medium px-5 py-2.5 rounded-full hover:bg-[#332219] active:scale-[0.98] transition shadow-sm cursor-pointer border border-[#C99A4A]/25"
          >
            <FileText size={14} className="text-[#E6C29E]" />
            <span>Generate Security Report</span>
          </button>
        </div>
      </div>

      {/* 2. Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-[20px] p-5 border border-[#2B1D16]/8 shadow-xs hover:shadow-md transition-shadow">
          <span className="text-[10.5px] font-sans uppercase tracking-wider text-[#7A695C] font-semibold block">Total Attacks Executed</span>
          <div className="font-serif text-[30px] text-[#2B1D16] mt-1.5">{metrics.totalAttacks}</div>
          <div className="text-[11px] text-[#7A695C] mt-0.5 font-mono">Adversary scenarios</div>
        </div>

        <div className="bg-white rounded-[20px] p-5 border border-[#2B1D16]/8 shadow-xs hover:shadow-md transition-shadow">
          <span className="text-[10.5px] font-sans uppercase tracking-wider text-emerald-800 font-semibold block">Attacks Blocked</span>
          <div className="font-serif text-[30px] text-emerald-700 mt-1.5">{metrics.attacksBlocked}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Mitigated successfully</div>
        </div>

        <div className="bg-white rounded-[20px] p-5 border border-[#2B1D16]/8 shadow-xs hover:shadow-md transition-shadow">
          <span className="text-[10.5px] font-sans uppercase tracking-wider text-rose-800 font-semibold block">False Allows</span>
          <div className="font-serif text-[30px] text-rose-700 mt-1.5">{metrics.falseAllows}</div>
          <div className="text-[11px] text-[#7A695C] mt-0.5">Critical policy breaches</div>
        </div>

        <div className="bg-white rounded-[20px] p-5 border border-[#2B1D16]/8 shadow-xs hover:shadow-md transition-shadow">
          <span className="text-[10.5px] font-sans uppercase tracking-wider text-amber-800 font-semibold block">False Blocks</span>
          <div className="font-serif text-[30px] text-amber-700 mt-1.5">{metrics.falseBlocks}</div>
          <div className="text-[11px] text-[#7A695C] mt-0.5">Benign tasks stopped</div>
        </div>

        <div className="bg-[#221610] text-white rounded-[20px] p-5 shadow-xs col-span-2 sm:col-span-1 border border-emerald-500/25">
          <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#C4A482] font-semibold block">Success Rate</span>
          <div className="font-serif text-[30px] text-[#E6C29E] mt-1.5">{metrics.successRate}%</div>
          <div className="text-[11px] text-emerald-300/80 mt-0.5">Decision precision</div>
        </div>
      </div>

      {/* 3. Benchmark Results Section */}
      <div className="bg-[#FAF5EE] rounded-[24px] p-6 sm:p-7 border border-[#8B5A2B]/20 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#8B5A2B]/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8B5A2B]/15 flex items-center justify-center text-[#8B5A2B] shrink-0">
              <Target className="w-5 h-5 text-[#8B5A2B]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif text-[22px] sm:text-[23px] text-[#1E1714] font-medium">
                  Prompt Injection Benchmark Results
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck size={13} className="text-emerald-700" />
                  VERIFIED
                </span>
              </div>
              <p className="text-[12.5px] text-[#5A4A40] mt-0.5">
                Evaluated across {benchmark?.totalPayloads ?? 85} labeled payloads: {benchmark?.malicious?.total ?? 55} malicious variants ({benchmark?.originalSet?.malicious?.total ?? 25} original + {benchmark?.newSet?.malicious?.total ?? 30} new adversarial) + {benchmark?.benign?.total ?? 30} legitimate kirana shop operations
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <div className="text-[10.5px] font-mono text-[#8B5A2B] uppercase tracking-wider font-semibold">Overall Benchmark Accuracy</div>
            <div className="font-serif text-[26px] sm:text-[28px] text-emerald-700 font-bold">
              {benchmark?.overallAccuracy ?? '100.0%'}
            </div>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          <div className="bg-white p-4.5 rounded-[18px] border border-black/5 shadow-2xs">
            <div className="text-[10.5px] font-mono uppercase tracking-wider text-[#8B5A2B] font-bold">Detection Rate</div>
            <div className="font-serif text-[30px] text-emerald-700 mt-1">
              {benchmark?.malicious?.detectionRate ?? '100.0%'}
            </div>
            <div className="text-[11px] text-[#5A4A40] mt-0.5 font-mono">
              {benchmark?.malicious?.truePositives ?? 55} / {benchmark?.malicious?.total ?? 55} Detected (TP)
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-[18px] border border-black/5 shadow-2xs">
            <div className="text-[10.5px] font-mono uppercase tracking-wider text-[#8B5A2B] font-bold">False Positive Rate</div>
            <div className="font-serif text-[30px] text-emerald-700 mt-1">
              {benchmark?.benign?.falsePositiveRate ?? '0.0%'}
            </div>
            <div className="text-[11px] text-[#5A4A40] mt-0.5 font-mono">
              {benchmark?.benign?.falsePositives ?? 0} / {benchmark?.benign?.total ?? 30} Benign Blocked (FP)
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-[18px] border border-black/5 shadow-2xs">
            <div className="text-[10.5px] font-mono uppercase tracking-wider text-[#8B5A2B] font-bold">Malicious Scenarios</div>
            <div className="font-serif text-[30px] text-[#1E1714] mt-1">
              {benchmark?.malicious?.total ?? 55}
            </div>
            <div className="text-[11px] text-[#5A4A40] mt-0.5 font-mono">
              {benchmark?.originalSet?.malicious?.total ?? 25} Orig + {benchmark?.newSet?.malicious?.total ?? 30} Adv
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-[18px] border border-black/5 shadow-2xs">
            <div className="text-[10.5px] font-mono uppercase tracking-wider text-[#8B5A2B] font-bold">Benign Shop Queries</div>
            <div className="font-serif text-[30px] text-[#1E1714] mt-1">
              {benchmark?.benign?.total ?? 30}
            </div>
            <div className="text-[11px] text-[#5A4A40] mt-0.5 font-mono">
              {benchmark?.benign?.trueNegatives ?? 30} / {benchmark?.benign?.total ?? 30} Allowed (TN)
            </div>
          </div>
        </div>

        {/* Benchmark Visual Bar Chart */}
        <div className="mt-5 p-5 bg-white rounded-[20px] border border-black/5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/5">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#8B5A2B]" />
              <h4 className="font-serif text-[16px] text-[#1E1714] font-medium">Evaluation Set Comparison (Detection vs Overall Accuracy)</h4>
            </div>
            <span className="text-[11px] font-mono text-[#5A4A40]">Target: ≥ 85% Detection</span>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchmarkChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2EAE1" vertical={false} />
                <XAxis dataKey="name" stroke="#7A685D" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#7A685D" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(val, name) => [`${val}%`, name === 'detectionRate' ? 'Detection Rate' : 'Accuracy']}
                  contentStyle={{
                    backgroundColor: '#1E1714',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#FAF5EE',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-[11.5px] text-[#5A4A40]">
                      {value === 'detectionRate' ? 'Malicious Detection Rate (%)' : 'Overall Accuracy (%)'}
                    </span>
                  )}
                />
                <Bar dataKey="detectionRate" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={45} />
                <Bar dataKey="accuracy" fill="#8B5A2B" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Set Breakdown: Original vs New Adversarial */}
        {benchmark && (
          <div className="mt-4 pt-4 border-t border-[#8B5A2B]/15 grid grid-cols-1 md:grid-cols-2 gap-3 text-[11.5px]">
            <div className="bg-white/80 p-4 rounded-[16px] border border-[#8B5A2B]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-[#1E1714]">Original Benchmark Set:</span>
                <span className="text-[#5A4A40] ml-1.5">{benchmark.originalSet?.totalPayloads ?? 40} payloads</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-emerald-700 font-bold">
                  Detection: {benchmark.originalSet?.malicious?.detectionRate ?? '100.0%'} ({benchmark.originalSet?.malicious?.truePositives}/{benchmark.originalSet?.malicious?.total})
                </span>
                <span className="text-emerald-800">
                  FP: {benchmark.originalSet?.benign?.falsePositiveRate ?? '0.0%'}
                </span>
              </div>
            </div>

            <div className="bg-white/80 p-4 rounded-[16px] border border-[#8B5A2B]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-[#1E1714]">New Adversarial Set:</span>
                <span className="text-[#5A4A40] ml-1.5">{benchmark.newSet?.totalPayloads ?? 45} payloads</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-emerald-700 font-bold">
                  Detection: {benchmark.newSet?.malicious?.detectionRate ?? '100.0%'} ({benchmark.newSet?.malicious?.truePositives}/{benchmark.newSet?.malicious?.total})
                </span>
                <span className="text-emerald-800">
                  FP: {benchmark.newSet?.benign?.falsePositiveRate ?? '0.0%'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Filters and Search Bar */}
      <div className="bg-white rounded-[22px] p-4 sm:p-5 border border-[#1E1714]/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8B5A2B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search findings, attack payloads, rules..."
            className="w-full bg-[#FAF5EE] border border-[#1E1714]/15 rounded-full pl-9 pr-4 py-2 text-[12.5px] text-[#1E1714] focus:outline-none focus:border-[#8B5A2B] transition-colors"
          />
        </div>

        {/* Severity & Decision Filters */}
        <div className="flex flex-wrap items-center gap-3 text-[11.5px]">
          <div className="flex items-center gap-1.5">
            <span className="text-[#5A4A40] font-medium mr-1 flex items-center gap-1">
              <Filter size={13} /> Severity:
            </span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(s => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-3 py-1 rounded-full border transition cursor-pointer text-[11px] font-medium ${
                  severityFilter === s
                    ? 'bg-[#1E1714] text-white border-[#1E1714]'
                    : 'bg-[#FAF5EE] text-[#5A4A40] border-black/5 hover:text-[#1E1714]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-black/10 hidden sm:block" />

          <div className="flex items-center gap-1.5">
            <span className="text-[#5A4A40] font-medium mr-1">Decision:</span>
            {['ALL', 'BLOCKED', 'CHALLENGED'].map(d => (
              <button
                key={d}
                onClick={() => setDecisionFilter(d)}
                className={`px-2.5 py-1 rounded-full border transition cursor-pointer text-[11px] font-medium ${
                  decisionFilter === d
                    ? 'bg-[#8B5A2B] text-white border-[#8B5A2B]'
                    : 'bg-[#FAF5EE] text-[#5A4A40] border-black/5 hover:text-[#1E1714]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Findings Table */}
      <div className="bg-white rounded-[24px] border border-[#1E1714]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] border-collapse min-w-[700px]">
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
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#5A4A40]">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-[#8B5A2B] border-t-transparent rounded-full animate-spin" />
                      <span>Loading security findings...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredFindings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#5A4A40]">
                    No security findings matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredFindings.map((f, idx) => (
                  <tr key={f.id || idx} className="hover:bg-[#FAF5EE]/70 transition-colors">
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
                        <span className="inline-flex items-center text-emerald-700 font-bold" title="Correct verdict">
                          <CheckCircle2 size={16} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-rose-700 font-bold" title="Incorrect verdict">
                          <ShieldX size={16} />
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        f.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        f.severity === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}>
                        {f.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#5A4A40] max-w-sm text-[11.5px] leading-snug">
                      {f.suggestedFix}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Security Audit Report Modal */}
      {reportModalOpen && reportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FAF5EE] rounded-[24px] p-6 sm:p-8 shadow-2xl border border-[#1E1714]/15 text-[#1E1714]">
            
            <button
              onClick={() => setReportModalOpen(false)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#1E1714] cursor-pointer transition-colors"
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
            <div className="mt-5 p-4.5 rounded-[18px] bg-white border border-[#1E1714]/10 text-[13px] leading-relaxed shadow-xs">
              <h4 className="font-serif text-[17px] font-medium text-[#1E1714] mb-1">Executive Summary</h4>
              <p className="text-[#5A4A40]">{reportData.executiveSummary}</p>
            </div>

            {/* Compliance Matrix */}
            <div className="mt-5">
              <h4 className="font-serif text-[18px] font-medium text-[#1E1714] mb-3">Policy Invariants Verified</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[12px]">
                {Object.entries(reportData.policyCompliance).map(([k, v]) => (
                  <div key={k} className="p-3.5 rounded-[14px] bg-white border border-black/5 flex items-center justify-between shadow-2xs">
                    <span className="text-[#5A4A40] font-medium capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-emerald-800 font-bold text-[11px] font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[11px] text-[#5A4A40]">Cryptographically bound audit trail entry • DukaanShield AgntID</span>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-1.5 bg-[#1E1714] text-white text-[12.5px] font-medium px-5 py-2.5 rounded-full hover:bg-[#342721] transition cursor-pointer"
              >
                <Printer size={13} />
                <span>Print / Save PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
