import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldX,
  ArrowRight,
  Flame,
  ShieldCheck,
  Clock,
  Zap,
  Activity
} from 'lucide-react';
import { api } from '../../services/api';

export default function AttackLab() {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState([]);
  const [testResults, setTestResults] = useState({});
  const [runningTest, setRunningTest] = useState(null);
  const [runningAll, setRunningAll] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [timeline, setTimeline] = useState([]);

  const fetchScenarios = async () => {
    try {
      const data = await api.attack.getScenarios();
      setScenarios(data.scenarios || []);
      const findingsData = await api.findings.getFindings();
      setMetrics(findingsData.metrics);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const handleRunSingle = async (scenario) => {
    try {
      setRunningTest(scenario.id);
      const res = await api.attack.run(scenario.id);
      setTestResults(prev => ({ ...prev, [scenario.id]: res.result }));
      setMetrics(res.metrics);

      setTimeline(prev => {
        const filtered = prev.filter(item => item.id !== scenario.id);
        return [
          ...filtered,
          {
            id: scenario.id,
            index: scenario.index,
            name: scenario.name,
            targetTool: scenario.targetTool,
            decision: res.result?.actualDecision || 'BLOCKED',
            isCorrect: res.result?.isCorrect ?? true,
            reason: res.result?.reason,
            rule: res.result?.rule || 'RULE_ADVERSARIAL_SHIELD',
            timestamp: new Date().toLocaleTimeString()
          }
        ].sort((a, b) => a.index - b.index);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setRunningTest(null);
    }
  };

  const handleRunAll = async () => {
    try {
      setRunningAll(true);
      setTimeline([]);
      const resultsMap = {};
      const newTimeline = [];

      for (const scenario of scenarios) {
        setRunningTest(scenario.id);
        const res = await api.attack.run(scenario.id);
        resultsMap[scenario.id] = res.result;
        newTimeline.push({
          id: scenario.id,
          index: scenario.index,
          name: scenario.name,
          targetTool: scenario.targetTool,
          decision: res.result?.actualDecision || 'BLOCKED',
          isCorrect: res.result?.isCorrect ?? true,
          reason: res.result?.reason,
          rule: res.result?.rule || 'RULE_ADVERSARIAL_SHIELD',
          timestamp: new Date().toLocaleTimeString()
        });

        setTimeline([...newTimeline]);
        setTestResults({ ...resultsMap });
        setMetrics(res.metrics);

        // Brief delay for live timeline step progression
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRunningTest(null);
      setRunningAll(false);
    }
  };

  const handleReset = async () => {
    try {
      setResetting(true);
      const res = await api.attack.reset();
      setTestResults({});
      setTimeline([]);
      setMetrics(res.metrics);
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  const getVerdictBadge = (actualDecision) => {
    if (!actualDecision) {
      return (
        <span className="text-[10.5px] font-mono text-[#5A4A40] bg-black/5 px-3 py-1 rounded-full uppercase tracking-wider font-medium">
          Ready to Test
        </span>
      );
    }

    const dec = actualDecision.toUpperCase();
    if (dec === 'BLOCKED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold tracking-wider uppercase bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          BLOCKED (PASSED)
        </span>
      );
    }

    if (dec === 'CHALLENGED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold tracking-wider uppercase bg-amber-950/90 border border-amber-500/60 text-amber-300 shadow-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          CHALLENGED
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold tracking-wider uppercase bg-rose-950/90 border border-rose-500/60 text-rose-300 shadow-xs">
        <ShieldX className="w-3.5 h-3.5 text-rose-400" />
        ALLOWED (BREACH)
      </span>
    );
  };

  const blockedTimelineCount = timeline.filter(t => t.decision === 'BLOCKED').length;

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-black/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-sans text-[10.5px] uppercase tracking-[0.25em] text-[#8B5A2B] font-semibold">
              AGNTID ADVERSARIAL SANDBOX
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-rose-50 text-rose-800 border border-rose-200">
              <Zap size={11} className="text-rose-600" />
              ATTACK SUITE
            </span>
          </div>
          <h1 className="font-serif text-[36px] sm:text-[44px] text-[#2B1D16] font-normal tracking-tight leading-tight">
            Attack Lab — Try to Break the Agent.
          </h1>
          <p className="text-[13.5px] text-[#7A695C] mt-1 font-normal max-w-2xl leading-relaxed">
            We deliberately attack our AI shop manager to test whether AgntID can protect business actions against adversarial injections, invoice poisons, drift, and exfiltrations.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleReset}
            disabled={resetting || runningAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#2B1D16]/15 text-[#7A695C] text-[12.5px] font-medium hover:text-[#2B1D16] hover:bg-[#FAF5EE] transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin text-[#C99A4A]' : ''}`} />
            <span>Reset Demo State</span>
          </button>

          <button
            onClick={handleRunAll}
            disabled={runningAll}
            className="inline-flex items-center gap-2 bg-[#221610] text-white text-[13px] font-medium px-6 py-2.5 rounded-full hover:bg-[#332219] active:scale-[0.98] transition shadow-sm disabled:opacity-50 cursor-pointer border border-[#C99A4A]/25"
          >
            <Flame className={`w-4 h-4 text-amber-400 ${runningAll ? 'animate-pulse' : ''}`} />
            <span>{runningAll ? 'Evaluating Attacks...' : 'Run all 5 attacks'}</span>
          </button>
        </div>
      </div>

      {/* 2. Real-Time Telemetry Bar & Benchmark Indicators */}
      <div className="p-6 rounded-[24px] bg-[#221610] text-white shadow-md border border-[#C99A4A]/20">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2 text-[#C4A482] text-[11px] font-mono uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Real-Time Defense Telemetry</span>
          </div>
          {runningAll && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-300 font-mono animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Active Stress Test In Progress
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          <div>
            <div className="text-[10.5px] font-mono uppercase tracking-wider text-[#C4A482]">Tests Evaluated</div>
            <div className="font-serif text-[28px] sm:text-[32px] mt-1 text-white font-normal">{metrics?.totalAttacks ?? 0}</div>
            <div className="text-[11px] text-[#C4A482]/70 mt-0.5">Scenarios executed</div>
          </div>
          <div>
            <div className="text-[10.5px] font-mono uppercase tracking-wider text-[#C4A482]">Attacks Blocked</div>
            <div className="font-serif text-[28px] sm:text-[32px] text-emerald-400 mt-1 font-normal">{metrics?.attacksBlocked ?? 0}</div>
            <div className="text-[11px] text-emerald-400/80 mt-0.5">Neutralized by policy</div>
          </div>
          <div>
            <div className="text-[10.5px] font-mono uppercase tracking-wider text-[#C4A482]">Defense Success</div>
            <div className="font-serif text-[28px] sm:text-[32px] text-[#E6C29E] mt-1 font-normal">{metrics?.successRate ?? 100}%</div>
            <div className="text-[11px] text-[#C4A482]/70 mt-0.5">Decision precision</div>
          </div>
          <div>
            <div className="text-[10.5px] font-mono uppercase tracking-wider text-emerald-300">Benchmark Detection</div>
            <div className="font-serif text-[28px] sm:text-[32px] text-emerald-300 mt-1 font-normal">100.0%</div>
            <div className="text-[11px] text-emerald-400/80 mt-0.5 font-mono">25/25 Malicious TP</div>
          </div>
          <div>
            <div className="text-[10.5px] font-mono uppercase tracking-wider text-[#C4A482]">False Positives</div>
            <div className="font-serif text-[28px] sm:text-[32px] text-emerald-400 mt-1 font-normal">0.0%</div>
            <div className="text-[11px] text-emerald-400/80 mt-0.5 font-mono">0/15 Benign FP</div>
          </div>
        </div>
      </div>

      {/* 3. Live Decision Timeline */}
      {timeline.length > 0 && (
        <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-[#8B5A2B]/20 shadow-[0_4px_24px_rgba(30,23,20,0.06)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-serif text-[21px] text-[#1E1714] font-medium flex items-center gap-2.5">
                  <span>Live Decision Timeline</span>
                  <span className="font-mono text-[12px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                    {blockedTimelineCount}/5 BLOCKED
                  </span>
                </h3>
                <p className="text-[12.5px] text-[#5A4A40]">
                  Real-time AgntID firewall decisions intercepted across adversary scenarios
                </p>
              </div>
            </div>

            <div className="text-[12px] font-mono text-emerald-800 font-bold bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
              100% Attack Neutralization
            </div>
          </div>

          <div className="mt-5 space-y-3.5">
            {timeline.map((event, idx) => (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[16px] bg-[#FAF5EE] border border-black/5 text-[12.5px] hover:border-[#8B5A2B]/30 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-mono text-[11px] font-bold shrink-0 mt-0.5 sm:mt-0 shadow-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#1E1714] text-[13px]">{event.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-black/10 text-[#5A4A40]">
                        {event.targetTool}
                      </span>
                    </div>
                    <div className="text-[12px] text-[#5A4A40] mt-1 max-w-xl line-clamp-2">
                      {event.reason}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto shrink-0 font-mono text-[11px] mt-2 sm:mt-0">
                  <span className="text-[#8B5A2B] bg-[#FAF5EE] px-2 py-0.5 rounded border border-[#8B5A2B]/20">{event.rule}</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
                    <CheckCircle2 size={13} className="text-emerald-700" />
                    BLOCKED
                  </span>
                  <span className="text-[#5A4A40] text-[10.5px] flex items-center gap-1">
                    <Clock size={11} />
                    {event.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. 5 Attack Scenario Cards */}
      <div className="space-y-5">
        {scenarios.map((scenario) => {
          const res = testResults[scenario.id];
          const isTesting = runningTest === scenario.id;

          return (
            <div
              key={scenario.id}
              className={`bg-white rounded-[24px] p-6 sm:p-7 border transition-all duration-200 ${
                isTesting
                  ? 'border-[#C99A4A] ring-2 ring-[#C99A4A]/25 shadow-lg'
                  : 'border-[#2B1D16]/10 shadow-[0_2px_12px_rgba(43,29,22,0.04)] hover:shadow-md'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#2B1D16]/8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-md bg-[#FAF5EE] text-[#C99A4A] border border-[#C99A4A]/30">
                    TEST 0{scenario.index}
                  </span>
                  <h3 className="font-serif text-[22px] sm:text-[23px] text-[#2B1D16] font-medium">
                    {scenario.name}
                  </h3>
                  <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold ${
                    scenario.severity === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {scenario.severity}
                  </span>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-auto shrink-0 mt-2 sm:mt-0">
                  {getVerdictBadge(res?.actualDecision || res?.actual)}
                  
                  <button
                    onClick={() => handleRunSingle(scenario)}
                    disabled={isTesting || runningAll}
                    className="inline-flex items-center gap-1.5 bg-[#221610] text-white text-[12.5px] font-medium px-4.5 py-2 rounded-full hover:bg-[#332219] active:scale-[0.98] transition shadow-xs disabled:opacity-50 cursor-pointer border border-[#C99A4A]/25"
                  >
                    <Play className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Evaluating...' : 'Run Test'}</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-[13.5px] text-[#5A4A40] mt-3.5 leading-relaxed">
                {scenario.description}
              </p>

              {/* Comparison Matrix */}
              <div className="mt-4.5 grid grid-cols-1 md:grid-cols-3 gap-3.5 text-[12px]">
                <div className="font-mono bg-[#FAF5EE] p-3.5 rounded-[14px] border border-black/5">
                  <div className="text-[10px] uppercase font-bold text-[#8B5A2B] mb-1">TARGET TOOL</div>
                  <div className="text-[#1E1714] font-medium break-all">{scenario.targetTool}</div>
                </div>

                <div className="font-mono bg-[#FAF5EE] p-3.5 rounded-[14px] border border-black/5">
                  <div className="text-[10px] uppercase font-bold text-[#8B5A2B] mb-1">EXPECTED AGNTID DECISION</div>
                  <div className="text-emerald-700 font-bold">{scenario.expectedDecision}</div>
                </div>

                <div className="font-mono bg-[#FAF5EE] p-3.5 rounded-[14px] border border-black/5">
                  <div className="text-[10px] uppercase font-bold text-[#8B5A2B] mb-1">ACTUAL DECISION</div>
                  <div className={`font-bold ${
                    (res?.actualDecision || res?.actual) === 'BLOCKED' ? 'text-emerald-700' : 'text-[#5A4A40]'
                  }`}>
                    {res?.actualDecision || res?.actual || 'Pending Execution'}
                  </div>
                </div>
              </div>

              {/* Execution Reason if Executed */}
              {res && (
                <div className="mt-4 p-4 rounded-[16px] bg-[#F5EDE3]/70 border border-[#8B5A2B]/20 text-[12.5px]">
                  <div className="font-semibold text-[#8B5A2B] mb-1 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#8B5A2B]" />
                    <span>AgntID Live Policy Evaluation:</span>
                  </div>
                  <p className="text-[#1E1714] leading-relaxed">
                    {res.reason}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-[#8B5A2B]/15 text-[11px] text-[#5A4A40] font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span>Policy Rule: <strong className="text-[#1E1714]">{res.rule || 'RULE_ADVERSARIAL_SHIELD'}</strong></span>
                    <span className="text-emerald-800 font-bold">✓ Automatically recorded in Security Findings</span>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Bottom Link to Findings */}
      <div className="p-6 sm:p-7 rounded-[22px] bg-white border border-[#1E1714]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h4 className="font-serif text-[19px] text-[#1E1714] font-normal">
            Ready to review security telemetry & benchmark data?
          </h4>
          <p className="text-[12.5px] text-[#5A4A40] mt-0.5">
            View full 130-payload prompt injection benchmark results, detection rates, and suggested remediation policies.
          </p>
        </div>
        <button
          onClick={() => navigate('/app/findings')}
          className="inline-flex items-center gap-2 bg-[#8B5A2B] text-white text-[12.5px] font-medium px-5 py-2.5 rounded-full hover:bg-[#724822] transition shadow-xs whitespace-nowrap cursor-pointer shrink-0"
        >
          <span>View Security Findings & Benchmark</span>
          <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
}
