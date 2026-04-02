import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Radio, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { PARTY_COLORS } from '../data/electionData';
import { CANDIDATES_2026 } from '../data/candidates2026';
import ShareBar from '../components/ShareBar';
import { useI18n } from '../i18n';

// Simulated results data (pre-counting day — shows "Counting not yet started")
const COUNTING_DATE = new Date('2026-05-04T08:00:00+05:30');

function generateSimulatedResults() {
  // Before counting day, show placeholder data
  const now = new Date();
  if (now < COUNTING_DATE) return null;

  // On counting day, this would be replaced with live API data
  return null;
}

function CountdownToResults() {
  const [diff, setDiff] = useState({});

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const ms = COUNTING_DATE - now;
      if (ms <= 0) { setDiff({ done: true }); return; }
      const d = Math.floor(ms / 86400000);
      const h = Math.floor((ms % 86400000) / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setDiff({ d, h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (diff.done) return null;

  return (
    <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
      {[['d', 'Days'], ['h', 'Hours'], ['m', 'Minutes'], ['s', 'Seconds']].map(([k, label]) => (
        <div key={k} className="bg-slate-700/50 rounded-xl p-3 text-center">
          <p className="text-3xl font-bold text-amber-400">{diff[k] ?? 0}</p>
          <p className="text-[10px] text-slate-400 uppercase">{label}</p>
        </div>
      ))}
    </div>
  );
}

export default function LiveResultsPage() {
  const results = useMemo(() => generateSimulatedResults(), []);
  const isPreCounting = !results;
  const { t } = useI18n();

  // Constituency summary
  const totalConstituencies = 234;
  const partiesContesting = useMemo(() => {
    const parties = new Set();
    CANDIDATES_2026.forEach((c) => Object.keys(c.candidates).forEach((p) => parties.add(p)));
    return parties.size;
  }, []);

  if (isPreCounting) {
    return (
      <div className="space-y-4 max-w-5xl">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Radio className="text-red-400 animate-pulse" /> {t('results.title')}
          </h1>
          <p className="text-sm text-slate-400 mt-1">{t('results.countingDate')}</p>
        </div>

        {/* Status Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 to-slate-800/40 rounded-xl p-8 border border-amber-500/20 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="text-amber-400" size={24} />
            <h2 className="text-xl font-bold text-white">{t('results.notStarted')}</h2>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            Polling: April 23, 2026 · Counting: May 4, 2026
          </p>
          <CountdownToResults />
          <p className="text-xs text-slate-500 mt-6">
            Live results will appear here on May 4, 2026 with round-wise updates
          </p>
        </div>

        {/* What to expect */}
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h3 className="text-sm font-semibold text-white mb-4">{t('results.whatToExpect')}</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <CheckCircle2 className="text-green-400 mb-2" size={20} />
              <p className="text-xs font-medium text-white mb-1">Round-wise Results</p>
              <p className="text-[10px] text-slate-400">Live seat tallies updated every round as counting progresses across 234 constituencies</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <RefreshCw className="text-blue-400 mb-2" size={20} />
              <p className="text-xs font-medium text-white mb-1">Auto-refresh</p>
              <p className="text-[10px] text-slate-400">Results auto-update every 60 seconds. Party-wise seat count, lead/trail status, victory margins</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <AlertCircle className="text-amber-400 mb-2" size={20} />
              <p className="text-xs font-medium text-white mb-1">Key Contests</p>
              <p className="text-[10px] text-slate-400">Track star candidates — Stalin, EPS, Vijay, Seeman, Tamilisai — and close fights in real-time</p>
            </div>
          </div>
        </div>

        {/* Pre-counting Overview */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 text-center">
            <p className="text-3xl font-bold text-white">{totalConstituencies}</p>
            <p className="text-xs text-slate-400">{t('common.constituencies')}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 text-center">
            <p className="text-3xl font-bold text-white">{partiesContesting}+</p>
            <p className="text-xs text-slate-400">{t('results.partiesContesting')}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 text-center">
            <p className="text-3xl font-bold text-amber-400">118</p>
            <p className="text-xs text-slate-400">{t('results.seatsForMajority')}</p>
          </div>
        </div>

        {/* Key Alliances */}
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h3 className="text-sm font-semibold text-white mb-3">{t('results.keyAlliances')}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
              <h4 className="font-bold text-red-400 mb-2">SPA (DMK Alliance)</h4>
              <p className="text-xs text-slate-400">DMK + INC + DMDK + VCK + CPI + CPI(M) + MDMK + IUML</p>
              <p className="text-[10px] text-slate-500 mt-1">CM Candidate: M.K. Stalin</p>
            </div>
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
              <h4 className="font-bold text-green-400 mb-2">NDA (AIADMK Alliance)</h4>
              <p className="text-xs text-slate-400">AIADMK + BJP + PMK + AMMK + TMC(M)</p>
              <p className="text-[10px] text-slate-500 mt-1">CM Candidate: Edappadi K. Palaniswami</p>
            </div>
          </div>
        </div>

        <ShareBar title="TN 2026 Election — Live Results Dashboard" />
      </div>
    );
  }

  // Post-counting UI would go here with real-time data
  return null;
}
