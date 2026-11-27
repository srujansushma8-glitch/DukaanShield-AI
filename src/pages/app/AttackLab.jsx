import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldX,
  FileCheck2,
  ShieldAlert,
  ArrowRight,
  Flame,
  Check,
  RefreshCw
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
    } catch (err) {
      console.error(err);
    } finally {
      setRunningTest(null);
    }
  };

  const handleRunAll = async () => {
    try {
      setRunningAll(true);
      const res = await api.attack.runAll();
      const resultsMap = {};
      res.results.forEach(r => {
        resultsMap[r.attackId] = r;
      });
      setTestResults(resultsMap);
      setMetrics(res.metrics);
    } catch (err) {
      console.error(err);
    } finally {
      setRunningAll(false);
    }
  };

  const handleReset = async () => {
    try {
      setResetting(true);
      const res = await api.attack.reset();
      setTestResults({});
      setMetrics(res.metrics);
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  const getVerdictBadge = (actualDecision, isCorrect) => {
    if (!actualDecision) {
      return (
        <span className="text-[10px] font-mono text-[#5A4A40] bg-black/5 px-2.5 py-1 rounded-full uppercase">
          Ready to Test
        </span>
      );
    }

    const dec = actualDecision.toUpperCase();
    if (dec === 'BLOCKED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          BLOCKED (PASSED)
        </span>
      );
    }

    if (dec === 'CHALLENGED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-950/80 border border-amber-500/50 text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          CHALLENGED
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-950/80 border border-rose-500/50 text-rose-300">
        <ShieldX className="w-3.5 h-3.5 text-rose-400" />
        ALLOWED (BREACH)
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <span className="font-sans text-[10.5px] uppercase tracking-[0.25em] text-[#8B5A2B] font-semibold block mb-1">
            AGNTID ADVERSARIAL SANDBOX
          </span>
          <h1 className="font-serif text-[38px] sm:text-[44px] text-[#1E1714] font-normal tracking-tight leading-tight">
            Attack Lab — Try to Break the Agent.
          </h1>
          <p className="text-[13.5px] text-[#5A4A40] mt-1 font-normal max-w-2xl">
            We deliberately attack our AI shop manager to test whether AgntID can protect business actions against adversarial injections, invoice poisons, drift, and exfiltrations.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            disabled={resetting}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-[#1E1714]/15 text-[#5A4A40] text-[12px] font-medium hover:text-[#1E1714] transition shadow-xs disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo State</span>
          </button>

          <button
            onClick={handleRunAll}
            disabled={runningAll}
            className="inline-flex items-center gap-2 bg-[#1E1714] text-white text-[13px] font-medium px-6 py-2.5 rounded-full hover:bg-[#342721] transition shadow-sm disabled:opacity-50"
          >
            <Flame className={`w-4 h-4 text-amber-400 ${runningAll ? 'animate-pulse' : ''}`} />
            <span>{runningAll ? 'Running Attack Suite...' : 'Run All Attack Tests'}</span>
          </button>
        </div>
      </div>

      {/* 2. Real-Time Telemetry Bar */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-[20px] bg-[#1E1714] text-white">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#C4A482]">Total Tests Run</div>
            <div className="font-serif text-[26px] mt-1">{metrics.totalAttacks}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#C4A482]">Attacks Blocked</div>
            <div className="font-serif text-[26px] text-emerald-400 mt-1">{metrics.attacksBlocked}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#C4A482]">False Allows</div>
            <div className="font-serif text-[26px] text-rose-400 mt-1">{metrics.falseAllows}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#C4A482]">Security Success Rate</div>
            <div className="font-serif text-[26px] text-[#E6C29E] mt-1">{metrics.successRate}%</div>
          </div>
        </div>
      )}

      {/* 3. 5 Attack Scenario Cards */}
      <div className="space-y-4">
        {scenarios.map((scenario) => {
          const res = testResults[scenario.id];
          const isTesting = runningTest === scenario.id;

          return (
            <div
              key={scenario.id}
              className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#1E1714]/10 shadow-[0_2px_12px_rgba(30,23,20,0.04)]"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#F5EDE3] text-[#8B5A2B] border border-[#8B5A2B]/20">
                    TEST 0{scenario.index}
                  </span>
                  <h3 className="font-serif text-[22px] text-[#1E1714] font-medium">
                    {scenario.name}
                  </h3>
                  <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
                    scenario.severity === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {scenario.severity}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  {getVerdictBadge(res?.actualDecision || res?.actual, res?.isCorrect)}
                  
                  <button
                    onClick={() => handleRunSingle(scenario)}
                    disabled={isTesting || runningAll}
                    className="inline-flex items-center gap-1.5 bg-[#1E1714] text-white text-[12px] font-medium px-4 py-2 rounded-full hover:bg-[#342721] transition shadow-xs disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Evaluating...' : 'Run Test'}</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-[13px] text-[#5A4A40] mt-3 leading-relaxed">
                {scenario.description}
              </p>

              {/* Comparison Matrix */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-[12px]">
                <div className="font-mono bg-[#FAF5EE] p-3 rounded-[12px] border border-black/5">
                  <div className="text-[10px] uppercase font-bold text-[#8B5A2B] mb-1">TARGET TOOL</div>
                  <div className="text-[#1E1714]">{scenario.targetTool}</div>
                </div>

                <div className="font-mono bg-[#FAF5EE] p-3 rounded-[12px] border border-black/5">
                  <div className="text-[10px] uppercase font-bold text-[#8B5A2B] mb-1">EXPECTED AGNTID DECISION</div>
                  <div className="text-emerald-700 font-bold">{scenario.expectedDecision}</div>
                </div>

                <div className="font-mono bg-[#FAF5EE] p-3 rounded-[12px] border border-black/5">
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
                <div className="mt-3.5 p-4 rounded-[14px] bg-[#F5EDE3]/60 border border-[#8B5A2B]/20 text-[12px]">
                  <div className="font-semibold text-[#8B5A2B] mb-1">
                    AgntID Live Policy Evaluation:
                  </div>
                  <p className="text-[#1E1714] leading-relaxed">
                    {res.reason}
                  </p>
                  <div className="mt-2 text-[11px] text-[#5A4A40] font-mono flex items-center justify-between">
                    <span>Policy Rule: {res.rule || 'RULE_ADVERSARIAL_SHIELD'}</span>
                    <span className="text-emerald-800 font-bold">✓ Automatically recorded in Security Findings</span>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Bottom Link to Findings */}
      <div className="p-6 rounded-[20px] bg-white border border-[#1E1714]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-serif text-[18px] text-[#1E1714] font-normal">
            Ready to review security telemetry?
          </h4>
          <p className="text-[12px] text-[#5A4A40] mt-0.5">
            Every attack test produces structured vulnerability intelligence and suggested policy remediation.
          </p>
        </div>
        <button
          onClick={() => navigate('/app/findings')}
          className="inline-flex items-center gap-2 bg-[#8B5A2B] text-white text-[12.5px] font-medium px-5 py-2.5 rounded-full hover:bg-[#724822] transition shadow-xs whitespace-nowrap"
        >
          <span>View Security Findings & Intelligence</span>
          <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
}
