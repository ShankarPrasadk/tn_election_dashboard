import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend, AreaChart, Area, ComposedChart, ReferenceLine
} from 'recharts';
import { SectionHeader } from '../components/UIComponents';
import { PARTY_COLORS, CRIMINAL_STATS, ASSET_STATS } from '../data/electionData';
import {
  HISTORICAL_ELECTIONS, HISTORICAL_SEATS, HISTORICAL_VOTE_SHARE,
  HISTORICAL_TURNOUT, CM_TIMELINE, ANTI_INCUMBENCY, PARTY_EVOLUTION
} from '../data/historicalElections';
import {
  PY_PARTY_COLORS, PY_CRIMINAL_STATS, PY_ASSET_STATS,
  PY_HISTORICAL_ELECTIONS, PY_HISTORICAL_SEATS,
  PY_HISTORICAL_VOTE_SHARE, PY_HISTORICAL_TURNOUT,
} from '../data/pyElectionData';
import { useElectionState } from '../context/StateContext';
import PartySymbolIcon from '../components/PartySymbolIcon';
import SwingAnalysis from '../components/SwingAnalysis';
import { ExportDropdown } from '../components/DataExport';
import { useI18n } from '../i18n';

// ─── Constants ────────────────────────────────────────────────

const ERA_COLORS = {
  'Congress Era': '#3b82f6',
  'Dravidian Era': '#f59e0b',
  'Modern Era': '#22c55e',
};

const CM_PARTY_COLORS = {
  INC: PARTY_COLORS.INC,
  DMK: PARTY_COLORS.DMK,
  AIADMK: PARTY_COLORS.AIADMK,
};

const CM_PHOTOS = {
  'C. Rajagopalachari': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/C._Rajagopalachari_1948.jpg/220px-C._Rajagopalachari_1948.jpg',
  'K. Kamaraj': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Kamaraj_portrait_%28cropped%29.jpg/220px-Kamaraj_portrait_%28cropped%29.jpg',
  'M. Bhaktavatsalam': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/M._Bhakthavatsalam.jpg/220px-M._Bhakthavatsalam.jpg',
  'C.N. Annadurai': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/CN_Annadurai.jpg/220px-CN_Annadurai.jpg',
  'M. Karunanidhi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Karunanidhi_in_the_1940s.jpg/220px-Karunanidhi_in_the_1940s.jpg',
  'M.G. Ramachandran': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/M.G._Ramachandran_%28headshot%29.jpg/220px-M.G._Ramachandran_%28headshot%29.jpg',
  'V.R. Janaki': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Janaki_amma.jpg/220px-Janaki_amma.jpg',
  'J. Jayalalithaa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/J_Jayalalithaa.jpg/220px-J_Jayalalithaa.jpg',
  'O. Panneerselvam': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/O._Panneerselvam.jpg/220px-O._Panneerselvam.jpg',
  'Edappadi K. Palaniswami': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Palanisamy.jpg/220px-Palanisamy.jpg',
  'M.K. Stalin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/The_Chief_Minister_of_Tamil_Nadu%2C_Thiru_MK_Stalin.jpg/220px-The_Chief_Minister_of_Tamil_Nadu%2C_Thiru_MK_Stalin.jpg',
};

// ─── Tooltip ──────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-slate-800/95 backdrop-blur border border-slate-600/50 rounded-lg p-3 shadow-2xl">
      <p className="text-sm font-semibold text-white mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-xs py-0.5">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color || p.stroke || p.fill }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-semibold text-white">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Era Badge ────────────────────────────────────────────────

function EraBadge({ era }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
      style={{ backgroundColor: `${ERA_COLORS[era] || '#64748b'}20`, color: ERA_COLORS[era] || '#94a3b8' }}>
      {era}
    </span>
  );
}

// ─── Section: Era Selector ────────────────────────────────────

function EraSelector({ era, setEra }) {
  const eras = ['All', 'Congress Era', 'Dravidian Era', 'Modern Era'];
  return (
    <div className="flex gap-2">
      {eras.map(e => (
        <button key={e} onClick={() => setEra(e)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
            era === e
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              : 'glass text-slate-400 hover:border-white/[0.08]'
          }`}>
          {e}
        </button>
      ))}
    </div>
  );
}

// ─── Section: Hero Stats ──────────────────────────────────────

function HeroStats() {
  const completed = HISTORICAL_ELECTIONS.filter(e => e.status !== 'upcoming');
  const stats = [
    { label: 'Elections', value: completed.length, suffix: '', color: '#f59e0b' },
    { label: 'Years of Democracy', value: 2026 - 1952, suffix: '', color: '#22c55e' },
    { label: 'Chief Ministers', value: 13, suffix: '', color: '#3b82f6' },
    { label: 'Highest Turnout', value: '78%', suffix: '(2011)', color: '#ef4444' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div key={i} className="glass rounded-xl p-5 text-center">
          <p className="text-3xl font-black tracking-tight" style={{ color: s.color }}>{s.value}</p>
          <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          {s.suffix && <p className="text-[10px] text-slate-500">{s.suffix}</p>}
        </div>
      ))}
    </div>
  );
}

// ─── Section: Election Timeline ───────────────────────────────

function ElectionTimeline({ elections }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="relative">
      {/* Central line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-amber-500 to-green-500" />

      <div className="space-y-1">
        {elections.map((e, i) => {
          const isExpanded = expanded === e.year;
          const isUpcoming = e.status === 'upcoming';
          const winnerParty = e.cmParty;
          const winnerColor = CM_PARTY_COLORS[winnerParty] || '#64748b';

          return (
            <div key={e.year} className="relative pl-16">
              {/* Timeline dot */}
              <div className="absolute left-4 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10"
                style={{
                  borderColor: winnerColor,
                  backgroundColor: isUpcoming ? 'transparent' : winnerColor,
                }}>
                {isUpcoming && <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
              </div>

              <button
                onClick={() => setExpanded(isExpanded ? null : e.year)}
                className={`w-full text-left rounded-xl p-4 transition-all border ${
                  isExpanded
                    ? 'bg-slate-800/80 border-amber-500/30'
                    : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/60 hover:border-slate-600/50'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl font-black text-white tabular-nums">{e.year}</span>
                    <EraBadge era={e.era} />
                    {!isUpcoming && (
                      <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: winnerColor }}>
                        <PartySymbolIcon party={winnerParty} size={16} color={winnerColor} />
                        {winnerParty}
                      </span>
                    )}
                    {isUpcoming && (
                      <span className="text-sm text-amber-400 font-medium animate-pulse">Upcoming — Apr 23</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {!isUpcoming && (
                      <>
                        <span className="text-xs text-slate-400 hidden sm:block">{e.chiefMinister}</span>
                        <span className="text-xs text-slate-500">{e.turnout}%</span>
                      </>
                    )}
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Milestone */}
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{e.milestone}</p>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="mt-2 bg-slate-800/60 border border-slate-700/30 rounded-xl p-5 space-y-4">
                  {/* Results bar */}
                  {!isUpcoming && Object.keys(e.results).length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Seats Won</h4>
                      <div className="flex rounded-lg overflow-hidden h-8">
                        {Object.entries(e.results)
                          .filter(([, v]) => v.seats > 0)
                          .sort((a, b) => b[1].seats - a[1].seats)
                          .map(([party, v]) => (
                            <div
                              key={party}
                              className="flex items-center justify-center text-[10px] font-bold text-white relative group"
                              style={{
                                width: `${(v.seats / (e.tnSeats || e.totalSeats)) * 100}%`,
                                backgroundColor: PARTY_COLORS[party] || '#64748b',
                                minWidth: v.seats > 0 ? '20px' : '0',
                              }}
                              title={`${party}: ${v.seats} seats`}
                            >
                              {v.seats >= 10 && <span>{party} {v.seats}</span>}
                            </div>
                          ))}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        {Object.entries(e.results)
                          .filter(([, v]) => v.seats > 0)
                          .sort((a, b) => b[1].seats - a[1].seats)
                          .map(([party, v]) => (
                            <span key={party} className="text-[11px] flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PARTY_COLORS[party] || '#64748b' }} />
                              <span className="text-slate-300">{party}</span>
                              <span className="font-semibold text-white">{v.seats}</span>
                              {v.voteShare > 0 && <span className="text-slate-500">({v.voteShare}%)</span>}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Key events */}
                  {e.keyEvents?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Key Events</h4>
                      <ul className="space-y-1">
                        {e.keyEvents.map((ev, j) => (
                          <li key={j} className="text-xs text-slate-400 flex gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            {ev}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Stats row */}
                  {!isUpcoming && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-700/30">
                      <div className="text-center flex flex-col items-center">
                        {CM_PHOTOS[e.chiefMinister] && (
                          <img src={CM_PHOTOS[e.chiefMinister]} alt={e.chiefMinister} className="w-8 h-8 rounded-full object-cover mb-1 ring-1 ring-slate-600" />
                        )}
                        <p className="text-lg font-bold text-white">{e.chiefMinister?.split(' ').pop()}</p>
                        <p className="text-[10px] text-slate-500">Chief Minister</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">{e.turnout}%</p>
                        <p className="text-[10px] text-slate-500">Turnout</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">{(e.registeredVoters / 1_000_000).toFixed(1)}M</p>
                        <p className="text-[10px] text-slate-500">Registered Voters</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">{e.totalCandidates?.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500">Candidates</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Section: CM Visual Timeline ──────────────────────────────

function CMVisualTimeline() {
  const [expandedIdx, setExpandedIdx] = useState(null);

  const cmGroups = useMemo(() => {
    const groups = [];
    let current = null;
    for (const cm of CM_TIMELINE) {
      if (!current || current.cm !== cm.cm) {
        if (current) groups.push(current);
        current = { ...cm, totalYears: cm.years };
      } else {
        current.totalYears += cm.years;
        current.period = `${current.period.split('–')[0]}–${cm.period.split('–')[1]}`;
        current.note = cm.note;
      }
    }
    if (current) groups.push(current);
    return groups.reverse(); // Most recent CM first
  }, []);

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
      {cmGroups.map((cm, i) => {
        const color = CM_PARTY_COLORS[cm.party] || '#64748b';
        const isExpanded = expandedIdx === i;
        return (
          <button
            key={i}
            type="button"
            onClick={() => setExpandedIdx(isExpanded ? null : i)}
            className="w-full text-left rounded-lg border transition-all duration-200"
            style={{
              borderColor: isExpanded ? color : `${color}40`,
              backgroundColor: isExpanded ? `${color}15` : `${color}08`,
            }}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              {/* CM Photo */}
              <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden ring-2" style={{ ringColor: color, boxShadow: `0 0 0 2px ${color}` }}>
                {CM_PHOTOS[cm.cm] ? (
                  <img
                    src={CM_PHOTOS[cm.cm]}
                    alt={cm.cm}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div className={`w-full h-full items-center justify-center text-sm font-bold text-white ${CM_PHOTOS[cm.cm] ? 'hidden' : 'flex'}`} style={{ backgroundColor: color }}>
                  {cm.cm.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
              </div>
              {/* Name & party */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{cm.cm}</p>
                <p className="text-xs mt-0.5" style={{ color }}>{cm.party}</p>
              </div>
              {/* Period & years */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-slate-400">{cm.period}</p>
                <p className="text-[11px] text-slate-500">{cm.totalYears} yr{cm.totalYears !== 1 ? 's' : ''}</p>
              </div>
              {/* Expand indicator */}
              <span className="text-slate-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
            </div>
            {/* Expanded details */}
            {isExpanded && (
              <div className="px-4 pb-3 pt-1 border-t" style={{ borderColor: `${color}30` }}>
                <p className="text-xs text-slate-300 leading-relaxed">{cm.note}</p>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Section: Anti-Incumbency Visualization ───────────────────

function AntiIncumbencyChart() {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 text-xs text-slate-400 mb-2">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/30 border border-red-500" /> Incumbent Lost</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500/30 border border-green-500" /> Incumbent Won</span>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-16 gap-2">
        {ANTI_INCUMBENCY.map((d) => {
          const isUnknown = d.result === '?';
          const lost = d.broke;
          const color = isUnknown ? '#f59e0b' : lost ? '#ef4444' : '#22c55e';
          const incColor = CM_PARTY_COLORS[d.incumbent] || '#64748b';

          return (
            <div key={d.year}
              className="rounded-lg p-2 text-center border transition-all hover:scale-105"
              style={{ borderColor: color, backgroundColor: `${color}10` }}
            >
              <p className="text-xs font-bold text-white">{d.year}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <PartySymbolIcon party={d.incumbent} size={12} color={incColor} />
                <span className="text-[10px] font-medium" style={{ color: incColor }}>{d.incumbent}</span>
              </div>
              <p className="text-[10px] mt-0.5" style={{ color }}>
                {isUnknown ? '?' : lost ? '✗ Lost' : '✓ Won'}
              </p>
              {d.toParty && (
                <p className="text-[9px] text-slate-500">→ {d.toParty}</p>
              )}
            </div>
          );
        })}
      </div>
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 mt-2">
        <p className="text-xs text-amber-400 font-medium">The Pattern:</p>
        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
          Between 1967–2026, the ruling party lost power in <strong className="text-white">10 out of 13</strong> elections.
          Only MGR (1980, 1984) and Jayalalithaa (2016) broke the anti-incumbency pattern.
          Will Stalin's DMK be the fourth to defy it in 2026?
        </p>
      </div>
    </div>
  );
}

// ─── Section: Party Family Tree ───────────────────────────────

function PartyFamilyTree() {
  return (
    <div className="relative">
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-700/50" />
      <div className="space-y-3">
        {PARTY_EVOLUTION.map((p, i) => {
          const color = PARTY_COLORS[p.party] || '#64748b';
          return (
            <div key={i} className="relative pl-10 flex items-center gap-3">
              <div className="absolute left-1.5 w-3 h-3 rounded-full border-2 bg-slate-900"
                style={{ borderColor: color }} />
              <span className="text-xs font-bold text-slate-300 tabular-nums w-10 flex-shrink-0">{p.year}</span>
              <div className="flex-1 rounded-lg px-3 py-2 border-l-2" style={{ borderColor: color, backgroundColor: `${color}08` }}>
                <span className="text-xs text-slate-300">{p.event}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────

export default function TrendsPage() {
  const { stateCode, config } = useElectionState();
  const isPY = stateCode === 'PY';
  const [era, setEra] = useState('All');
  const [activeTab, setActiveTab] = useState('overview');

  const partyColors = isPY ? { ...PARTY_COLORS, ...PY_PARTY_COLORS } : PARTY_COLORS;
  const historicalElections = isPY ? PY_HISTORICAL_ELECTIONS : HISTORICAL_ELECTIONS;
  const historicalSeats = isPY ? PY_HISTORICAL_SEATS : HISTORICAL_SEATS;
  const historicalVoteShare = isPY ? PY_HISTORICAL_VOTE_SHARE : HISTORICAL_VOTE_SHARE;
  const historicalTurnout = isPY ? PY_HISTORICAL_TURNOUT : HISTORICAL_TURNOUT;

  const filteredElections = useMemo(() =>
    historicalElections
      .filter(e => era === 'All' || e.era === era)
      .sort((a, b) => b.year - a.year),
    [era, historicalElections]
  );

  // Criminal and asset trend data (2006–2021 only)
  const criminalStats = isPY ? PY_CRIMINAL_STATS : CRIMINAL_STATS;
  const assetStats = isPY ? PY_ASSET_STATS : ASSET_STATS;
  const criminalTrend = Object.entries(criminalStats).map(([yr, d]) => ({
    year: Number(yr),
    'With Cases (%)': d.percentWithCases,
    'Serious Cases (%)': d.percentSerious,
  }));

  const assetTrend = Object.entries(assetStats).map(([yr, d]) => ({
    year: Number(yr),
    'Average (₹ Cr)': d.avgAssets,
    'Median (₹ Cr)': d.medianAssets,
    'Richest (₹ Cr)': d.richest,
  }));

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'seats', label: 'Seats & Vote Share' },
    { id: 'turnout', label: 'Turnout' },
    ...(!isPY ? [{ id: 'incumbency', label: 'Anti-Incumbency' }] : []),
    { id: 'timeline', label: 'Timeline' },
    ...(!isPY ? [{ id: 'evolution', label: 'Party Evolution' }] : []),
    { id: 'money', label: 'Money & Crime' },
  ];

  const { t } = useI18n();

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {t('trends.title')}
            </h1>
            <p className="text-slate-400 mt-1">
              Complete electoral history of {config.name} — {historicalElections.length} elections since {isPY ? 1964 : 1952}
            </p>
          </div>
          <ExportDropdown
            data={historicalElections}
            filename={`${stateCode.toLowerCase()}-historical-elections`}
            label="Export"
          />
        </div>
        <HeroStats />
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-700/50 overflow-x-auto pb-px">
        <div className="flex gap-1 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* CM Timeline Bar — TN only */}
          {!isPY && (
            <div className="glass rounded-xl p-4">
              <SectionHeader title="Chief Ministers of Tamil Nadu" subtitle="1952 to present — hover for details" />
              <CMVisualTimeline />
            </div>
          )}

          {/* Combined Seats Chart */}
          <div className="glass rounded-xl p-4">
            <SectionHeader title="Seats Won by Major Parties" subtitle={`All ${historicalElections.filter(e => e.status !== 'upcoming').length} completed elections`} />
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={historicalSeats} barGap={1}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={ChartTooltip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {!isPY && <ReferenceLine x={1967} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Dravidian Era →', position: 'top', fill: '#f59e0b', fontSize: 10 }} />}
                <Bar dataKey="INC" fill={partyColors.INC} name="Congress" radius={[2, 2, 0, 0]} />
                <Bar dataKey="DMK" fill={partyColors.DMK} name="DMK" radius={[2, 2, 0, 0]} />
                {isPY && <Bar dataKey="AINRC" fill={partyColors.AINRC || '#22c55e'} name="AINRC" radius={[2, 2, 0, 0]} />}
                <Bar dataKey="AIADMK" fill={partyColors.AIADMK} name="AIADMK" radius={[2, 2, 0, 0]} />
                <Bar dataKey="BJP" fill={partyColors.BJP || '#f97316'} name="BJP" radius={[2, 2, 0, 0]} />
                {!isPY && <Bar dataKey="Others" fill={partyColors.Others} name="Others" radius={[2, 2, 0, 0]} />}
                {isPY && <Bar dataKey="IND" fill="#64748b" name="Independents" radius={[2, 2, 0, 0]} />}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Observations */}
          {!isPY && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Congress → DMK in 1967',
                desc: 'The anti-Hindi agitation of 1965 triggered a seismic shift. Congress has never won power in Tamil Nadu since.',
                color: PARTY_COLORS.DMK,
                stat: '59 years',
                statLabel: 'since Congress last ruled',
              },
              {
                title: 'The Pendulum Effect',
                desc: 'Since 1967, power has alternated between DMK and AIADMK with remarkable regularity — broken only thrice.',
                color: '#f59e0b',
                stat: '10/13',
                statLabel: 'elections saw power change',
              },
              {
                title: 'Cinema to Politics',
                desc: 'MGR, Jayalalithaa, Vijayakanth, Kamal, and now Vijay — Tamil Nadu has a unique cinema-politics pipeline.',
                color: '#8b5cf6',
                stat: '5+',
                statLabel: 'film stars turned politicians',
              },
            ].map((obs, i) => (
              <div key={i} className="glass rounded-xl p-5 border-t-2"
                style={{ borderTopColor: obs.color }}>
                <p className="text-2xl font-black" style={{ color: obs.color }}>{obs.stat}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{obs.statLabel}</p>
                <h4 className="text-sm font-semibold text-white mt-3">{obs.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{obs.desc}</p>
              </div>
            ))}
          </div>          )}        </div>
      )}

      {/* ═══════════════ SEATS & VOTE SHARE TAB ═══════════════ */}
      {activeTab === 'seats' && (
        <div className="space-y-5">
          <div className="glass rounded-xl p-4">
            <SectionHeader title="Seats Won — Stacked View" subtitle={`Composition of ${config.name} legislature after each election`} />
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={historicalSeats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={ChartTooltip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {!isPY && <ReferenceLine x={1967} stroke="#f59e0b" strokeDasharray="4 4" />}
                <Bar dataKey="INC" stackId="seats" fill={partyColors.INC} name="Congress" />
                <Bar dataKey="DMK" stackId="seats" fill={partyColors.DMK} name="DMK" />
                {isPY && <Bar dataKey="AINRC" stackId="seats" fill={partyColors.AINRC || '#22c55e'} name="AINRC" />}
                <Bar dataKey="AIADMK" stackId="seats" fill={partyColors.AIADMK} name="AIADMK" />
                <Bar dataKey="BJP" stackId="seats" fill={partyColors.BJP || '#f97316'} name="BJP" />
                {!isPY && <Bar dataKey="Others" stackId="seats" fill={partyColors.Others} name="Others" radius={[2, 2, 0, 0]} />}
                {isPY && <Bar dataKey="IND" stackId="seats" fill="#64748b" name="Independents" radius={[2, 2, 0, 0]} />}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-xl p-4">
            <SectionHeader title="Vote Share Trend (%)" subtitle={`How party vote shares evolved in ${config.name}`} />
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={historicalVoteShare}>
                <defs>
                  <linearGradient id="gradDMK" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PARTY_COLORS.DMK} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PARTY_COLORS.DMK} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradAIADMK" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PARTY_COLORS.AIADMK} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PARTY_COLORS.AIADMK} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradINC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PARTY_COLORS.INC} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PARTY_COLORS.INC} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={ChartTooltip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {!isPY && <ReferenceLine x={1967} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '1967', fill: '#f59e0b', fontSize: 10 }} />}
                <Area type="monotone" dataKey="INC" stroke={partyColors.INC} fill="url(#gradINC)" strokeWidth={2} name="Congress" dot={{ r: 3 }} />
                <Area type="monotone" dataKey="DMK" stroke={partyColors.DMK} fill="url(#gradDMK)" strokeWidth={2.5} name="DMK" dot={{ r: 4 }} />
                {isPY && <Area type="monotone" dataKey="AINRC" stroke={partyColors.AINRC || '#22c55e'} fill="none" strokeWidth={2.5} name="AINRC" dot={{ r: 4 }} />}
                <Area type="monotone" dataKey="AIADMK" stroke={partyColors.AIADMK} fill="url(#gradAIADMK)" strokeWidth={2.5} name="AIADMK" dot={{ r: 4 }} />
                <Area type="monotone" dataKey="BJP" stroke={partyColors.BJP || '#f97316'} fill="none" strokeWidth={2} name="BJP" dot={{ r: 3 }} strokeDasharray="5 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* DMK vs AIADMK head-to-head — TN only */}
          {!isPY && (
          <div className="glass rounded-xl p-4">
            <SectionHeader title="DMK vs AIADMK — Head to Head" subtitle="Seats won in elections where both contested (1977–2021)" />
            <div className="space-y-3">
              {HISTORICAL_ELECTIONS
                .filter(e => e.results.DMK?.seats !== undefined && e.results.AIADMK?.seats !== undefined && e.status !== 'upcoming')
                .filter(e => e.year >= 1977)
                .sort((a, b) => a.year - b.year)
                .map(e => {
                  const dmkSeats = e.results.DMK?.seats || 0;
                  const aiadmkSeats = e.results.AIADMK?.seats || 0;
                  const total = e.tnSeats || e.totalSeats;
                  const dmkPct = (dmkSeats / total) * 100;
                  const aiadmkPct = (aiadmkSeats / total) * 100;
                  const winner = dmkSeats > aiadmkSeats ? 'DMK' : 'AIADMK';

                  return (
                    <div key={e.year} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-white w-10 text-right tabular-nums">{e.year}</span>
                      <div className="flex-1 flex h-6 rounded-lg overflow-hidden bg-slate-700/30">
                        <div className="flex items-center justify-end px-2"
                          style={{ width: `${dmkPct}%`, backgroundColor: PARTY_COLORS.DMK }}>
                          {dmkSeats >= 10 && <span className="text-[10px] font-bold text-white">{dmkSeats}</span>}
                        </div>
                        <div className="flex-1" />
                        <div className="flex items-center justify-start px-2"
                          style={{ width: `${aiadmkPct}%`, backgroundColor: PARTY_COLORS.AIADMK }}>
                          {aiadmkSeats >= 10 && <span className="text-[10px] font-bold text-white">{aiadmkSeats}</span>}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold w-14" style={{ color: CM_PARTY_COLORS[winner] }}>
                        {winner}
                      </span>
                    </div>
                  );
                })}
              <div className="flex items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-700/30">
                <span className="w-10" />
                <div className="flex-1 flex justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1 rounded" style={{ backgroundColor: PARTY_COLORS.DMK }} /> DMK
                  </span>
                  <span className="flex items-center gap-1.5">
                    AIADMK <span className="w-3 h-1 rounded" style={{ backgroundColor: PARTY_COLORS.AIADMK }} />
                  </span>
                </div>
                <span className="w-14" />
              </div>
            </div>
          </div>
          )}
        </div>
      )}

      {/* ═════════════ TURNOUT TAB ═════════════ */}
      {activeTab === 'turnout' && (
        <div className="space-y-5">
          <div className="glass rounded-xl p-4">
            <SectionHeader title={`Voter Turnout in ${config.name}`} subtitle={`Percentage of registered voters who voted`} />
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={historicalTurnout}>
                <defs>
                  <linearGradient id="gradTurnout" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis yAxisId="left" unit="%" domain={[50, 85]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis yAxisId="right" orientation="right" unit="M" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={ChartTooltip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="right" dataKey="votersInMillions" fill="#3b82f620" stroke="#3b82f6" name="Registered Voters (M)" radius={[4, 4, 0, 0]} />
                <Area yAxisId="left" type="monotone" dataKey="turnout" stroke="#f59e0b" fill="url(#gradTurnout)" strokeWidth={3} dot={{ r: 5, fill: '#f59e0b' }} name="Turnout (%)" />
                <ReferenceLine yAxisId="left" y={70} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: '70% avg', position: 'right', fill: '#94a3b8', fontSize: 10 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Turnout records */}
          {!isPY && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Highest Turnout', value: '78.0%', year: '2011', note: 'Anti-DMK wave over 2G scam', color: '#22c55e' },
              { label: 'Lowest Turnout', value: '58.0%', year: '1952', note: 'First election — voter awareness low', color: '#ef4444' },
              { label: 'Voter Growth', value: '2.3x', year: '1952→2021', note: '27.8M → 62.4M registered voters', color: '#3b82f6' },
            ].map((s, i) => (
              <div key={i} className="glass rounded-xl p-5 text-center">
                <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label} ({s.year})</p>
                <p className="text-[10px] text-slate-500 mt-1">{s.note}</p>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* ═════════════ ANTI-INCUMBENCY TAB (TN only) ═════════════ */}
      {activeTab === 'incumbency' && !isPY && (
        <div className="space-y-5">
          <div className="glass rounded-xl p-4">
            <SectionHeader title="The Anti-Incumbency Pattern" subtitle="Tamil Nadu's famous pattern of rejecting ruling parties" />
            <AntiIncumbencyChart />
          </div>
        </div>
      )}

      {/* ═══════════════ TIMELINE TAB ═══════════════ */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <SectionHeader title="Election-by-Election" subtitle="Click any election to see detailed results and key events" />
            <EraSelector era={era} setEra={setEra} />
          </div>
          <ElectionTimeline elections={filteredElections} />
        </div>
      )}

      {/* ═══════════════ PARTY EVOLUTION TAB (TN only) ═══════════════ */}
      {activeTab === 'evolution' && !isPY && (
        <div className="space-y-5">
          <div className="glass rounded-xl p-4">
            <SectionHeader title="Party Family Tree" subtitle="How Tamil Nadu's political parties were born — from DK to TVK" />
            <PartyFamilyTree />
          </div>

          {/* Three eras explanation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                era: 'Congress Era',
                period: '1952–1967',
                color: ERA_COLORS['Congress Era'],
                desc: 'Indian National Congress ruled Madras State. Rajaji was the first CM, followed by Kamaraj who transformed education. The Dravidian movement grew as opposition.',
              },
              {
                era: 'Dravidian Era',
                period: '1967–2006',
                color: ERA_COLORS['Dravidian Era'],
                desc: 'DMK and AIADMK alternated power. Annadurai, Karunanidhi, MGR, and Jayalalithaa defined this era. Alliance politics became essential.',
              },
              {
                era: 'Modern Era',
                period: '2006–present',
                color: ERA_COLORS['Modern Era'],
                desc: 'The Dravidian duopoly continues but faces challenges from NTK, TVK, and national parties. Generational shift as second-gen leaders take charge.',
              },
            ].map((e, i) => (
              <div key={i} className="glass border-t-2 rounded-xl p-5"
                style={{ borderTopColor: e.color }}>
                <p className="text-lg font-black" style={{ color: e.color }}>{e.era}</p>
                <p className="text-xs text-slate-500">{e.period}</p>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════ MONEY & CRIME TAB ═══════════════ */}
      {activeTab === 'money' && (
        <div className="space-y-5">
          <div className="glass rounded-xl p-4">
            <SectionHeader
              title="Criminalization of Politics"
              subtitle="Percentage of candidates with criminal records (2006–2021)"
            />
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={criminalTrend}>
                <defs>
                  <linearGradient id="gradCrime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradSerious" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={ChartTooltip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="With Cases (%)" stroke="#ef4444" fill="url(#gradCrime)" strokeWidth={2.5} dot={{ r: 5 }} />
                <Area type="monotone" dataKey="Serious Cases (%)" stroke="#f59e0b" fill="url(#gradSerious)" strokeWidth={2} dot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-xl p-4">
            <SectionHeader title="Wealth of Candidates" subtitle="Average, median, and peak assets of candidates" />
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={assetTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis unit=" Cr" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={ChartTooltip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Richest (₹ Cr)" fill="#22c55e20" stroke="#22c55e" name="Richest Candidate" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="Average (₹ Cr)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5, fill: '#f59e0b' }} />
                <Line type="monotone" dataKey="Median (₹ Cr)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Key observations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Rising Criminalization',
                desc: 'Candidates with criminal cases rose from 25.3% (2006) to 38.6% (2021) — a 52% increase over 15 years.',
                color: '#ef4444',
              },
              {
                title: 'Wealth Explosion',
                desc: 'Average candidate assets grew from ₹3.2 Cr (2006) to ₹12.2 Cr (2021) — a 4x increase, far outpacing inflation.',
                color: '#22c55e',
              },
            ].map((obs, i) => (
              <div key={i} className="rounded-xl p-5 border-l-4 glass"
                style={{ borderLeftColor: obs.color }}>
                <h4 className="text-sm font-semibold text-white">{obs.title}</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{obs.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Swing Analysis */}
      <SwingAnalysis />

      {/* Footer attribution & Legal Disclaimer */}
      <div className="glass rounded-xl p-4 space-y-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Data Sources & Disclaimer</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-400 leading-relaxed">
          <div>
            <p className="font-semibold text-slate-300 mb-1">Official Government Sources</p>
            <ul className="space-y-1">
              <li>\u2022 <strong>Seat results, vote share, turnout:</strong> <a href="https://www.eci.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Election Commission of India (eci.gov.in)</a> — Statistical Reports</li>
              <li>\u2022 <strong>Registered voters, polling dates:</strong> <a href="https://tnsec.tn.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Tamil Nadu State Election Commission (tnsec.tn.gov.in)</a></li>
              <li>\u2022 <strong>Criminal records, assets, education:</strong> <a href="https://myneta.info" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">myneta.info</a> (ADR) — from candidate self-sworn affidavits filed with ECI</li>
              <li>\u2022 <strong>Affidavit archive:</strong> <a href="https://affidavitarchive.nic.in" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">affidavitarchive.nic.in</a> (Government of India)</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-slate-300 mb-1">Legal Disclaimer</p>
            <p>All data presented is sourced from publicly available government records and candidate self-sworn affidavits filed with the Election Commission of India. Criminal records, asset declarations, and education data are as declared by candidates in their statutory affidavits — the platform does not independently verify these claims.</p>
            <p className="mt-2">Pre-1967 election statistics are approximate. In case of any discrepancy, data published by ECI/TNSEC should be treated as authoritative. This is an informational platform and does not endorse any political party or candidate.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
