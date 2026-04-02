import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import { StatCard, SectionHeader } from '../components/UIComponents';
import { Building2, Heart, AlertOctagon, Factory, School, Stethoscope, Info } from 'lucide-react';
import { DEVELOPMENT_DATA } from '../data/electionData';

const PERIODS = Object.keys(DEVELOPMENT_DATA);
const GOVT_COLORS = {
  '2006-2011': '#e11d48',
  '2011-2016': '#16a34a',
  '2016-2021': '#16a34a',
  '2021-2026': '#e11d48',
};

export default function DevelopmentPage() {
  const [period, setPeriod] = useState('2021-2026');
  const data = DEVELOPMENT_DATA[period];

  const comparisonMetrics = PERIODS.map(p => ({
    period: p,
    'GDP Growth (%)': DEVELOPMENT_DATA[p].gdpGrowthAvg,
    'Roads (100 km)': DEVELOPMENT_DATA[p].roadsBuiltKm / 100,
    'Hospitals': DEVELOPMENT_DATA[p].hospitalsBuild,
    'Schools': DEVELOPMENT_DATA[p].schoolsBuilt / 10,
    'Jobs (10k)': DEVELOPMENT_DATA[p].employmentGenerated / 10000,
  }));

  const radarCompare = [
    { subject: 'GDP Growth', ...Object.fromEntries(PERIODS.map(p => [p, (DEVELOPMENT_DATA[p].gdpGrowthAvg / 10) * 100])) },
    { subject: 'Roads', ...Object.fromEntries(PERIODS.map(p => [p, (DEVELOPMENT_DATA[p].roadsBuiltKm / 15000) * 100])) },
    { subject: 'Hospitals', ...Object.fromEntries(PERIODS.map(p => [p, (DEVELOPMENT_DATA[p].hospitalsBuild / 60) * 100])) },
    { subject: 'Schools', ...Object.fromEntries(PERIODS.map(p => [p, (DEVELOPMENT_DATA[p].schoolsBuilt / 600) * 100])) },
    { subject: 'Investment', ...Object.fromEntries(PERIODS.map(p => [p, (DEVELOPMENT_DATA[p].industrialInvestment / 400000) * 100])) },
    { subject: 'Employment', ...Object.fromEntries(PERIODS.map(p => [p, (DEVELOPMENT_DATA[p].employmentGenerated / 700000) * 100])) },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Development & Corruption Tracker</h1>
          <p className="text-slate-400 mt-1">Government performance, schemes, and corruption allegations</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                period === p
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Source Disclaimer */}
      <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl px-5 py-4">
        <Info size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-amber-300 font-medium">Data Source Disclaimer</p>
          <p className="text-xs text-slate-400 mt-1">
            Development metrics are compiled from published government announcements, press releases, and budget documents.
            These are estimated figures and may differ from final audited numbers.
            Corruption allegations are sourced from court filings and media reports &mdash; outcomes may vary.
          </p>
        </div>
      </div>

      {/* Government Info */}
      <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white">{data.government}</h2>
        <p className="text-slate-400 text-sm mt-1">Period: {data.period}</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="GDP Growth" value={`${data.gdpGrowthAvg}%`} subtitle="Annual average" icon={Factory} color="green" />
        <StatCard title="Roads Built" value={`${(data.roadsBuiltKm).toLocaleString()} km`} icon={Building2} color="blue" />
        <StatCard title="Hospitals" value={data.hospitalsBuild} subtitle="New/upgraded" icon={Stethoscope} color="purple" />
        <StatCard title="Schools" value={data.schoolsBuilt} subtitle="New/upgraded" icon={School} color="amber" />
        <StatCard title="Investment" value={`₹${(data.industrialInvestment / 1000).toFixed(0)}k Cr`} subtitle="Industrial" icon={Factory} color="green" />
        <StatCard title="Jobs Created" value={`${(data.employmentGenerated / 1000).toFixed(0)}k`} icon={Heart} color="blue" />
      </div>

      {/* Schemes */}
      <div className="glass rounded-xl p-6">
        <SectionHeader title="Key Government Schemes" subtitle={`Welfare and development schemes during ${data.period}`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.keySchemes.map((scheme, i) => (
            <div key={i} className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-400">{scheme.name}</h4>
              <div className="flex items-center gap-4 mt-2">
                {typeof scheme.beneficiaries === 'number' && scheme.beneficiaries > 0 && (
                  <p className="text-xs text-slate-400">
                    Beneficiaries: <span className="text-white font-medium">{(scheme.beneficiaries / 1000000).toFixed(1)}M</span>
                  </p>
                )}
                {typeof scheme.beneficiaries === 'string' && (
                  <p className="text-xs text-slate-400">
                    Beneficiaries: <span className="text-white font-medium">{scheme.beneficiaries}</span>
                  </p>
                )}
                {scheme.cost > 0 && (
                  <p className="text-xs text-slate-400">
                    Cost: <span className="text-amber-400 font-medium">₹{scheme.cost} Cr</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Corruption Allegations */}
      <div className="glass rounded-xl p-6">
        <SectionHeader title="Corruption Allegations" subtitle="Major scandals and allegations during this period" />
        {data.corruptionAllegations.length > 0 ? (
          <div className="space-y-3">
            {data.corruptionAllegations.map((c, i) => (
              <div key={i} className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertOctagon size={18} className="text-red-400" />
                    <h4 className="text-sm font-semibold text-red-400">{c.title}</h4>
                  </div>
                  <span className="text-xs text-slate-400">{c.year}</span>
                </div>
                <p className="text-sm text-amber-400 mt-2 ml-8">{c.amount}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No major allegations recorded for this period.</p>
        )}
      </div>

      {/* Comparison Across All Periods */}
      <div className="glass rounded-xl p-6">
        <SectionHeader title="Government Performance Comparison" subtitle="Key metrics across all government periods" />
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={comparisonMetrics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="GDP Growth (%)" fill="#22c55e" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Roads (100 km)" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Hospitals" fill="#a855f7" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Jobs (10k)" fill="#f59e0b" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Comparison */}
      <div className="glass rounded-xl p-6">
        <SectionHeader title="Performance Radar – All Periods" />
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarCompare}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            {PERIODS.map((p) => (
              <Radar key={p} name={p} dataKey={p} stroke={GOVT_COLORS[p]} fill={`${GOVT_COLORS[p]}30`} fillOpacity={0.3} />
            ))}
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Investment Trend */}
      <div className="glass rounded-xl p-6">
        <SectionHeader title="Infrastructure Spending (₹ Cr)" />
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={PERIODS.map(p => ({ period: p, spend: DEVELOPMENT_DATA[p].infrastructureSpend }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="spend" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Infrastructure Spend (₹ Cr)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
