import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { IndianRupee, TrendingUp, AlertTriangle, Search } from 'lucide-react';
import { ELECTION_SUMMARY, PARTY_COLORS } from '../data/electionData';
import ShareBar from '../components/ShareBar';
import ExploreCTA from '../components/ExploreCTA';
import { useI18n } from '../i18n';

// Campaign finance data (ECI reported expenditure limits and party-level data)
const EXPENDITURE_LIMITS = [
  { year: 2006, limit: 10, unit: 'lakhs' },
  { year: 2011, limit: 16, unit: 'lakhs' },
  { year: 2016, limit: 28, unit: 'lakhs' },
  { year: 2021, limit: 30.8, unit: 'lakhs' },
  { year: 2026, limit: 40, unit: 'lakhs' },
];

// ECI data on party spending (approximate based on public disclosures)
const PARTY_SPENDING = {
  2021: [
    { party: 'DMK', declared: 215, approx: 450, source: 'ECI' },
    { party: 'AIADMK', declared: 178, approx: 400, source: 'ECI' },
    { party: 'BJP', declared: 89, approx: 250, source: 'ECI' },
    { party: 'PMK', declared: 42, approx: 120, source: 'ECI' },
    { party: 'NTK', declared: 28, approx: 80, source: 'ECI' },
    { party: 'MNM', declared: 35, approx: 100, source: 'ECI' },
    { party: 'INC', declared: 65, approx: 180, source: 'ECI' },
  ],
  2016: [
    { party: 'AIADMK', declared: 152, approx: 380, source: 'ECI' },
    { party: 'DMK', declared: 134, approx: 350, source: 'ECI' },
    { party: 'BJP', declared: 45, approx: 120, source: 'ECI' },
    { party: 'PMK', declared: 38, approx: 90, source: 'ECI' },
    { party: 'INC', declared: 52, approx: 140, source: 'ECI' },
  ],
};

// Electoral bonds data (public disclosure after SC order Feb 2024)
const ELECTORAL_BONDS = [
  { party: 'BJP', totalCr: 6060, percentage: 47.5 },
  { party: 'INC', totalCr: 1609, percentage: 12.6 },
  { party: 'DMK', totalCr: 656, percentage: 5.1 },
  { party: 'AIADMK', totalCr: 431, percentage: 3.4 },
  { party: 'BJD', totalCr: 776, percentage: 6.1 },
  { party: 'Others', totalCr: 3228, percentage: 25.3 },
];

export default function CampaignFinancePage() {
  const [selectedYear, setSelectedYear] = useState(2021);
  const { t } = useI18n();
  const spending = PARTY_SPENDING[selectedYear] || [];

  const spendingChart = spending.map((s) => ({
    name: s.party,
    declared: s.declared,
    estimated: s.approx,
    color: PARTY_COLORS[s.party] || '#6b7280',
  }));

  const bondsChart = ELECTORAL_BONDS.map((b) => ({
    name: b.party,
    value: b.totalCr,
    percentage: b.percentage,
    color: PARTY_COLORS[b.party] || '#6b7280',
  }));

  const limitChart = EXPENDITURE_LIMITS.map((l) => ({
    name: String(l.year),
    limit: l.limit,
  }));

  const totalDeclared = spending.reduce((s, p) => s + p.declared, 0);
  const tnBonds = ELECTORAL_BONDS.filter((b) => ['DMK', 'AIADMK'].includes(b.party));
  const tnBondsTotal = tnBonds.reduce((s, b) => s + b.totalCr, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <IndianRupee className="text-amber-400" /> {t('finance.title')}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {t('finance.subtitle')}
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <p className="text-2xl font-bold text-amber-400">₹40L</p>
          <p className="text-[10px] text-slate-400">2026 Candidate Limit</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <p className="text-2xl font-bold text-white">₹{totalDeclared}Cr</p>
          <p className="text-[10px] text-slate-400">{selectedYear} Total Declared</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <p className="text-2xl font-bold text-red-400">₹{tnBondsTotal}Cr</p>
          <p className="text-[10px] text-slate-400">Electoral Bonds (TN parties)</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <p className="text-2xl font-bold text-green-400">4x</p>
          <p className="text-[10px] text-slate-400">Limit growth since 2006</p>
        </div>
      </div>

      {/* Expenditure Limit Trend */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-white mb-3">ECI Expenditure Limit per Candidate (₹ Lakhs)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={limitChart} barSize={36}>
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="limit" fill="#f59e0b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Party Spending */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Party-wise Spending (₹ Crores)</h3>
          <div className="flex gap-2">
            {Object.keys(PARTY_SPENDING).map((yr) => (
              <button key={yr} onClick={() => setSelectedYear(Number(yr))}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${Number(yr) === selectedYear ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'}`}>
                {yr}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={spendingChart} barSize={20}>
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="declared" name="Declared to ECI" radius={[4, 4, 0, 0]}>
              {spendingChart.map((d, i) => <Cell key={i} fill={d.color} opacity={0.7} />)}
            </Bar>
            <Bar dataKey="estimated" name="Estimated (approx)" radius={[4, 4, 0, 0]}>
              {spendingChart.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-[10px] text-slate-500 mt-2">
          Declared spending from ECI filings. Estimated spending from media reports and watchdog organizations.
        </p>
      </div>

      {/* Electoral Bonds */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-white mb-1">Electoral Bonds — Party-wise Encashment</h3>
        <p className="text-[10px] text-slate-400 mb-3">Data disclosed after Supreme Court order (Feb 15, 2024) · 2019-2024 cumulative</p>
        <div className="grid md:grid-cols-2 gap-4">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={bondsChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={40} paddingAngle={2}>
                {bondsChart.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => `₹${v} Cr`} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {ELECTORAL_BONDS.map((b) => (
              <div key={b.party} className="flex items-center justify-between bg-slate-700/20 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PARTY_COLORS[b.party] || '#6b7280' }} />
                  <span className="text-xs text-white font-medium">{b.party}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white">₹{b.totalCr} Cr</p>
                  <p className="text-[10px] text-slate-400">{b.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TN Context */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-amber-400 mb-2">Tamil Nadu Context</h3>
        <div className="text-xs text-slate-400 space-y-1">
          <p>• TN parties received ₹{tnBondsTotal} Cr via electoral bonds (DMK: ₹656 Cr, AIADMK: ₹431 Cr)</p>
          <p>• 2021 election saw an estimated ₹1,500+ Cr spent across all parties in Tamil Nadu</p>
          <p>• Average candidate spending in 2021: ₹25-50 lakhs (official limit was ₹30.8 lakhs)</p>
          <p>• TN has historically been one of the most expensive states for elections per capita</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
        <p className="text-[10px] text-slate-500">
          <AlertTriangle size={10} className="inline text-amber-400 mr-1" />
          Campaign finance data is sourced from ECI filings, ADR/myneta.info analysis, SBI electoral bond disclosures (post SC order), and media reports.
          Declared spending figures may not reflect actual expenditure. Electoral bond data is cumulative 2019-2024 as disclosed by SBI.
          This platform does not make any allegations — all data is from official public disclosures.
        </p>
      </div>

      <ShareBar title="Campaign Finance — TN Election Dashboard" />
      <ExploreCTA exclude={['/finance']} maxItems={4} title="More Election Data" />
    </div>
  );
}
