import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  CartesianGrid,
} from 'recharts';
import { Users, Search, ChevronDown, ArrowUpDown, MapPin, Filter } from 'lucide-react';
import { useElectionState } from '../context/StateContext';
import { useI18n } from '../i18n';

const SORT_OPTIONS = [
  { value: 'voters-desc', label: 'Most Voters' },
  { value: 'voters-asc', label: 'Fewest Voters' },
  { value: 'female-desc', label: 'Highest Female %' },
  { value: 'female-asc', label: 'Lowest Female %' },
  { value: 'name-asc', label: 'Name A→Z' },
  { value: 'no-asc', label: 'Constituency #' },
];

function formatCount(n) {
  if (n >= 10000000) return (n / 10000000).toFixed(2) + ' Cr';
  if (n >= 100000) return (n / 100000).toFixed(2) + ' L';
  return n.toLocaleString('en-IN');
}

function formatShort(n) {
  if (n >= 10000000) return (n / 10000000).toFixed(1) + 'Cr';
  if (n >= 100000) return (n / 100000).toFixed(1) + 'L';
  return n.toLocaleString('en-IN');
}

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card rounded-xl p-3 shadow-2xl shadow-black/60 text-sm">
      <p className="font-semibold text-white mb-1 border-b border-white/10 pb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-400 text-xs">{p.name}:</span>
          <span className="text-white text-xs font-medium">{typeof p.value === 'number' ? p.value.toLocaleString('en-IN') : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function VoterDataPage() {
  const { stateCode, config } = useElectionState();
  const { t } = useI18n();
  const isPY = stateCode === 'PY';

  const [voterData, setVoterData] = useState(null);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [sortBy, setSortBy] = useState('voters-desc');
  const [visibleCount, setVisibleCount] = useState(30);

  useEffect(() => {
    if (isPY) {
      // Placeholder PY voter data
      setVoterData({
        state: 'Puducherry',
        totalVoters: 944211,
        maleVoters: 443595,
        femaleVoters: 500477,
        thirdGender: 139,
        totalSeats: 30,
        constituencies: [],
      });
    } else {
      fetch('/data/tn-voter-roll-2026.json')
        .then(r => r.json())
        .then(setVoterData)
        .catch(() => {});
    }
  }, [stateCode]);

  const districts = useMemo(() => {
    if (!voterData?.constituencies?.length) return ['All'];
    return ['All', ...new Set(voterData.constituencies.map(c => c.district).filter(Boolean).sort())];
  }, [voterData]);

  const filtered = useMemo(() => {
    if (!voterData?.constituencies?.length) return [];
    const q = search.toLowerCase().trim();
    let items = voterData.constituencies.filter(c => {
      if (districtFilter !== 'All' && c.district !== districtFilter) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.district.toLowerCase().includes(q);
    });

    // Sort
    const [field, dir] = sortBy.split('-');
    items.sort((a, b) => {
      if (field === 'voters') return dir === 'desc' ? b.totalVoters - a.totalVoters : a.totalVoters - b.totalVoters;
      if (field === 'female') return dir === 'desc' ? b.femalePercent - a.femalePercent : a.femalePercent - b.femalePercent;
      if (field === 'name') return a.name.localeCompare(b.name);
      if (field === 'no') return a.no - b.no;
      return 0;
    });

    return items;
  }, [voterData, search, districtFilter, sortBy]);

  // Aggregate stats for current filter
  const stats = useMemo(() => {
    const items = filtered.length ? filtered : voterData?.constituencies || [];
    return {
      totalVoters: items.reduce((s, c) => s + c.totalVoters, 0),
      maleVoters: items.reduce((s, c) => s + c.maleVoters, 0),
      femaleVoters: items.reduce((s, c) => s + c.femaleVoters, 0),
      thirdGender: items.reduce((s, c) => s + c.thirdGender, 0),
      seats: items.length,
    };
  }, [filtered, voterData]);

  // Top 10 constituencies for bar chart
  const top10 = useMemo(() => {
    if (!voterData?.constituencies?.length) return [];
    return [...voterData.constituencies]
      .sort((a, b) => b.totalVoters - a.totalVoters)
      .slice(0, 10)
      .map(c => ({ name: c.name.replace(/ \(.*\)/, ''), voters: c.totalVoters, male: c.maleVoters, female: c.femaleVoters }));
  }, [voterData]);

  // Gender pie data
  const genderPie = useMemo(() => {
    if (!voterData) return [];
    return [
      { name: 'Male', value: voterData.maleVoters, color: '#3b82f6' },
      { name: 'Female', value: voterData.femaleVoters, color: '#ec4899' },
      { name: '3rd Gender', value: voterData.thirdGender, color: '#a855f7' },
    ];
  }, [voterData]);

  const stateAvg = voterData?.constituencies?.length
    ? Math.round(voterData.totalVoters / voterData.constituencies.length)
    : 0;

  if (!voterData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-400/30 border-t-amber-400" />
      </div>
    );
  }

  const femalePercent = ((voterData.femaleVoters / voterData.totalVoters) * 100).toFixed(1);
  const malePercent = ((voterData.maleVoters / voterData.totalVoters) * 100).toFixed(1);

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      {/* Header */}
      <div>
        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold mb-1">Statewide Summary</p>
        <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">{config.name} 2026</h1>
        <p className="text-slate-400 text-sm mt-1">Official Electoral Roll Summary</p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="col-span-2 glass-card gradient-border rounded-2xl p-5 glow-amber">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Total Voters</p>
          <p className="text-4xl font-black text-white mt-1 tabular-nums">{formatCount(voterData.totalVoters)}</p>
          <div className="flex items-center gap-2 mt-2">
            <Users size={14} className="text-amber-400" />
            <span className="text-xs text-slate-400">{config.totalSeats} Seats</span>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold">Male</p>
          <p className="text-2xl font-bold text-white mt-1 tabular-nums">{formatCount(voterData.maleVoters)}</p>
          <p className="text-xs text-slate-500 mt-1">{malePercent}% of total</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-[10px] text-pink-400 uppercase tracking-widest font-semibold">Female</p>
          <p className="text-2xl font-bold text-white mt-1 tabular-nums">{formatCount(voterData.femaleVoters)}</p>
          <p className="text-xs text-slate-500 mt-1">{femalePercent}% of total</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-[10px] text-purple-400 uppercase tracking-widest font-semibold">3rd Gender</p>
          <p className="text-2xl font-bold text-white mt-1 tabular-nums">{voterData.thirdGender.toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-500 mt-1">{config.totalSeats} Seats</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-semibold">Avg per Seat</p>
          <p className="text-2xl font-bold text-white mt-1 tabular-nums">{formatShort(stateAvg)}</p>
          <p className="text-xs text-slate-500 mt-1">State average</p>
        </div>
      </div>

      {/* Electoral Filters */}
      {voterData.constituencies.length > 0 && (
        <>
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={16} className="text-amber-400" />
              <h2 className="text-base font-bold text-white">Electoral Filters</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filter by district or search"
                  className="w-full bg-slate-800/60 border border-slate-700/50 text-white rounded-lg pl-9 pr-4 py-2.5 text-sm placeholder-slate-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/30"
                />
              </div>
              <div className="relative">
                <select
                  value={districtFilter}
                  onChange={e => setDistrictFilter(e.target.value)}
                  className="appearance-none bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-2.5 pr-8 text-white text-sm focus:ring-2 focus:ring-amber-500/50 w-full sm:w-48"
                >
                  {districts.map(d => <option key={d} value={d}>{d === 'All' ? 'All Districts' : d}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="appearance-none bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-2.5 pr-8 text-white text-sm focus:ring-2 focus:ring-amber-500/50 w-full sm:w-44"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ArrowUpDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Live aggregate stats for current filter */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              <div className="glass rounded-xl p-3">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">
                  {districtFilter === 'All' && !search ? '' : 'Filtered'} Total Voters
                </p>
                <p className="text-lg font-bold text-white tabular-nums mt-0.5">{formatCount(stats.totalVoters)}</p>
                <p className="text-[10px] text-slate-500">Current view total</p>
              </div>
              <div className="glass rounded-xl p-3">
                <p className="text-[9px] text-blue-400 uppercase tracking-widest">Male Voters</p>
                <p className="text-lg font-bold text-white tabular-nums mt-0.5">{formatCount(stats.maleVoters)}</p>
                <p className="text-[10px] text-slate-500">Total male voters</p>
              </div>
              <div className="glass rounded-xl p-3">
                <p className="text-[9px] text-pink-400 uppercase tracking-widest">Female Voters</p>
                <p className="text-lg font-bold text-white tabular-nums mt-0.5">{formatCount(stats.femaleVoters)}</p>
                <p className="text-[10px] text-slate-500">Total female voters</p>
              </div>
              <div className="glass rounded-xl p-3">
                <p className="text-[9px] text-slate-400 uppercase tracking-widest">{stats.seats} Seats</p>
                <p className="text-lg font-bold text-white tabular-nums mt-0.5">{stats.thirdGender.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-slate-500">Third gender voters</p>
              </div>
            </div>
          </div>

          {/* Constituency Breakdown */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Constituency Breakdown</h2>
                <p className="text-xs text-slate-500 mt-0.5">Detailed view of all {filtered.length} seats</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Sort: </span>
                <span className="text-amber-400 font-medium">{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
                {districtFilter !== 'All' && (
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full text-[10px]">
                    {districtFilter}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.slice(0, visibleCount).map(c => {
                const femalePct = c.femalePercent;
                return (
                  <div key={c.no} className="glass rounded-xl p-4 hover:border-white/[0.08] transition-all duration-200 group">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{c.name.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}</h3>
                        <p className="text-[10px] text-slate-500">
                          <span className="text-amber-400/70">#{c.no}</span>
                          <span className="mx-1">{c.district.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}</span>
                          {c.type !== 'GEN' && <span className="text-blue-400">({c.type})</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-600 uppercase tracking-wider">Gender Split</p>
                        <p className="text-[10px] font-semibold text-pink-400">{femalePct}% Female</p>
                      </div>
                    </div>

                    {/* Gender bar */}
                    <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ width: `${100 - femalePct}%`, background: 'linear-gradient(90deg, #3b82f640, #3b82f6)' }}
                      />
                      <div
                        className="absolute inset-y-0 right-0 rounded-full"
                        style={{ width: `${femalePct}%`, background: 'linear-gradient(90deg, #ec4899, #ec489940)' }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-blue-400 font-medium">Male</p>
                        <p className="text-white font-semibold tabular-nums">{c.maleVoters.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-pink-400 font-medium">Female</p>
                        <p className="text-white font-semibold tabular-nums">{c.femaleVoters.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-700/30">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total Voters</span>
                        <span className="text-sm font-bold text-white tabular-nums">{c.totalVoters.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filtered.length > visibleCount && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setVisibleCount(v => v + 30)}
                  className="px-6 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium transition-colors border border-amber-500/20"
                >
                  Show More ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Demographic Insights — Top constituencies bar chart */}
            <div className="glass-card rounded-2xl p-4 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
              <h2 className="text-base font-bold text-white mb-1">Demographic Insights</h2>
              <p className="text-[11px] text-slate-500 mb-3">Top constituencies by total voters in {config.name}</p>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={top10} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={v => formatShort(v)}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={CUSTOM_TOOLTIP} />
                  <Bar dataKey="voters" name="Total Voters" radius={[0, 4, 4, 0]} barSize={18}>
                    {top10.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? '#f59e0b' : '#334155'} fillOpacity={i === 0 ? 0.9 : 0.7} />
                    ))}
                  </Bar>
                  {stateAvg > 0 && (
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="#f59e0b40"
                      horizontalCoordinatesGenerator={() => []}
                      verticalCoordinatesGenerator={({ width, offset }) => {
                        const maxVal = top10[0]?.voters || 1;
                        const chartWidth = width - offset.left - offset.right;
                        return [offset.left + (stateAvg / maxVal) * chartWidth * 0.7];
                      }}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-amber-400/60 text-center mt-1">State Avg: {formatShort(stateAvg)}</p>
            </div>

            {/* Gender Composition — Donut */}
            <div className="glass-card rounded-2xl p-4 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
              <h2 className="text-base font-bold text-white mb-1">Gender Composition</h2>
              <p className="text-[11px] text-slate-500 mb-3">Overall breakdown across {districtFilter === 'All' ? 'all constituencies' : districtFilter}</p>
              <div className="relative">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <defs>
                      <linearGradient id="genderMale" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.85} />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                      <linearGradient id="genderFemale" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity={0.85} />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={genderPie.filter(g => g.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                      cornerRadius={4}
                      stroke="none"
                    >
                      {genderPie.filter(g => g.value > 0).map(g => (
                        <Cell key={g.name} fill={g.color} style={{ filter: `drop-shadow(0 0 6px ${g.color}40)` }} />
                      ))}
                    </Pie>
                    <Tooltip content={CUSTOM_TOOLTIP} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-10px' }}>
                  <div className="text-center">
                    <p className="text-sm text-pink-400 font-bold">{femalePercent}%</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">Female Share</p>
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div className="flex items-center justify-center gap-8 mt-2">
                <div className="text-center">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-3 h-3 rounded-sm bg-blue-500" />
                    <span className="text-xs text-slate-400">Male</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{malePercent}%</p>
                  <p className="text-[10px] text-slate-500">{formatCount(voterData.maleVoters)} voters</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-3 h-3 rounded-sm bg-pink-500" />
                    <span className="text-xs text-slate-400">Female</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{femalePercent}%</p>
                  <p className="text-[10px] text-slate-500">{formatCount(voterData.femaleVoters)} voters</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-400">Total</p>
                  <p className="text-xs text-white font-bold">{formatCount(voterData.totalVoters)}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Data Source */}
      <div className="glass rounded-xl p-4">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          <strong className="text-slate-400">Data Source:</strong>{' '}
          <a href="https://www.eci.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-500/70 hover:text-amber-400">Election Commission of India</a> · SIR 2026 Electoral Roll Summary.
          Gender breakdowns are derived from official electoral roll data. Per-constituency figures may have minor rounding adjustments.
          {' '}<a href={config.electionCommissionURL} target="_blank" rel="noopener noreferrer" className="text-amber-500/70 hover:text-amber-400">{config.electionCommissionName}</a>
        </p>
      </div>
    </div>
  );
}
