import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend, PieChart, Pie, Cell
} from 'recharts';
import { StatCard, YearSelector, SectionHeader, PartyBadge } from '../components/UIComponents';
import { AlertTriangle, ShieldAlert, TrendingUp, Scale } from 'lucide-react';
import { CRIMINAL_STATS, PARTY_COLORS, KEY_CANDIDATES } from '../data/electionData';
import PartySymbolIcon from '../components/PartySymbolIcon';
import { loadCandidateDirectory } from '../data/candidateDirectory';
import { computeLiveStats } from '../data/liveStats';
import ShareBar from '../components/ShareBar';
import ExploreCTA from '../components/ExploreCTA';
import { useI18n } from '../i18n';

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
      <p className="text-sm font-medium text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}%
        </p>
      ))}
    </div>
  );
};

export default function CriminalPage() {
  const [year, setYear] = useState(2026);
  const { t } = useI18n();
  const [liveStats, setLiveStats] = useState(null);

  useEffect(() => {
    loadCandidateDirectory()
      .then(dir => setLiveStats(computeLiveStats(dir.entries)))
      .catch(() => {});
  }, []);

  const is2026 = year === 2026;
  const data = is2026 ? liveStats?.criminal : CRIMINAL_STATS[year];

  const allStats = { ...CRIMINAL_STATS };
  if (liveStats?.criminal) allStats[2026] = liveStats.criminal;

  const trendData = Object.entries(allStats).map(([yr, d]) => ({
    year: Number(yr),
    'With Cases (%)': d.percentWithCases,
    'Serious Cases (%)': d.percentSerious,
    'Avg Cases': d.avgCases,
  }));

  if (!data) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white">{t('criminal.title')}</h1>
            <p className="text-slate-400 mt-1">{t('criminal.subtitle')}</p>
          </div>
          <YearSelector selectedYear={year} onChange={setYear} years={[2006, 2011, 2016, 2021, 2026]} />
        </div>
        <div className="text-center py-12 text-slate-400">{t('common.loading')}</div>
      </div>
    );
  }

  const pieData = [
    { name: 'Clean', value: 100 - data.percentWithCases, color: '#22c55e' },
    { name: 'Normal Cases', value: data.percentWithCases - data.percentSerious, color: '#f59e0b' },
    { name: 'Serious Cases', value: data.percentSerious, color: '#ef4444' },
  ];

  // Top candidates with most criminal cases
  const topCriminals = is2026
    ? (liveStats?.topCriminals || [])
    : [...KEY_CANDIDATES]
        .filter(c => c.criminalCases.total > 0)
        .sort((a, b) => b.criminalCases.total - a.criminalCases.total);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('criminal.title')}</h1>
          <p className="text-slate-400 mt-1">{t('criminal.subtitle')}</p>
        </div>
        <YearSelector selectedYear={year} onChange={setYear} years={[2006, 2011, 2016, 2021, 2026]} />
      </div>

      {/* Partial data notice */}
      {data.isPartial && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-sm text-amber-300">
            <strong>⚠️ Partial Data:</strong> Only {data.affidavitsSynced} of {data.totalCandidatesAnalyzed} affidavits have been processed so far. Stats below reflect the data available — percentages will update as more affidavits are synced from ECI.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="With Criminal Cases"
          value={data.isPartial ? `${data.withCriminalCases}` : `${data.percentWithCases}%`}
          subtitle={data.isPartial ? `of ${data.affidavitsSynced} affidavits synced` : `${data.withCriminalCases} candidates`}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Serious Cases"
          value={data.isPartial ? `${data.withSeriousCases}` : `${data.percentSerious}%`}
          subtitle={data.isPartial ? 'candidates with 2+ cases' : `${data.withSeriousCases} candidates`}
          icon={ShieldAlert}
          color="amber"
        />
        <StatCard
          title="Avg Cases Per Candidate"
          value={data.avgCases}
          icon={Scale}
          color="purple"
        />
        <StatCard
          title="Total Analyzed"
          value={data.totalCandidatesAnalyzed.toLocaleString()}
          subtitle="from affidavits"
          icon={TrendingUp}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Criminal Cases by Party */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <SectionHeader title={`Criminal Cases by Party (${year})`} />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topParties} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" unit="%" />
              <YAxis type="category" dataKey="party" width={60} />
              <Tooltip content={CUSTOM_TOOLTIP} />
              <Bar dataKey="percent" radius={[0, 4, 4, 0]} name="Candidates with Cases">
                {data.topParties.map((entry) => (
                  <Cell key={entry.party} fill={PARTY_COLORS[entry.party] || PARTY_COLORS.Others} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Case Distribution Pie */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <SectionHeader title="Case Distribution" />
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend Over Years */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <SectionHeader title="Criminal Cases Trend (2006–2021)" subtitle="Percentage of candidates with criminal records is increasing" />
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip content={CUSTOM_TOOLTIP} />
            <Legend />
            <Line type="monotone" dataKey="With Cases (%)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 5 }} />
            <Line type="monotone" dataKey="Serious Cases (%)" stroke="#ef4444" strokeWidth={2} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Candidates with Cases */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <SectionHeader title="Candidates with Most Criminal Cases" />
        <div className="space-y-3">
          {topCriminals.map((c, i) => (
            <div key={c.id} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-slate-500 w-8">#{i + 1}</span>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${PARTY_COLORS[c.party]}20` }}
                >
                  <PartySymbolIcon party={c.party} size={22} color={PARTY_COLORS[c.party]} />
                </div>
                <div>
                  <p className="text-white font-medium">{c.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <PartyBadge party={c.party} />
                    <span className="text-xs text-slate-400">{c.constituency}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-slate-400">Total</p>
                  <p className="text-xl font-bold text-amber-400">{c.criminalCases.total}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Serious</p>
                  <p className="text-xl font-bold text-red-400">{c.criminalCases.serious}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ShareBar title="Criminal Records of TN 2026 Election Candidates | TN Election Dashboard" />

      <ExploreCTA exclude={['/criminal']} maxItems={4} title="Explore More Data" />

      {/* Disclaimer */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-amber-400 mb-2">⚠️ Legal Notice — Criminal Case Data</h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          All criminal case data is sourced exclusively from candidates' own self-sworn affidavits filed with
          the Election Commission of India under Section 33A of the Representation of the People Act, 1951,
          and as compiled by myneta.info (Association for Democratic Reforms).
          This platform does not independently investigate, allege, or determine guilt of any candidate.
          All cases listed are <strong className="text-slate-300">pending allegations, not proven convictions</strong>.
          Every person is presumed innocent until proven guilty by a court of law.
          This data is presented in the public interest under the voters' fundamental right to know (PUCL v. Union of India, 2003).
          For data corrections, contact <a href="mailto:tnelectiondashboard@proton.me" className="text-amber-400 hover:text-amber-300">tnelectiondashboard@proton.me</a>.
        </p>
      </div>
    </div>
  );
}
