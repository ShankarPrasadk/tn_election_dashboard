import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  Legend, CartesianGrid, AreaChart, Area
} from 'recharts';
import { Users, AlertTriangle, Banknote, GraduationCap, Vote, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard, YearSelector, SectionHeader, PartyBadge } from '../components/UIComponents';
import AdBanner from '../components/AdBanner';
import {
  ELECTION_SUMMARY, PARTY_COLORS, CRIMINAL_STATS, ASSET_STATS,
  EDUCATION_DATA, AGE_DATA
} from '../data/electionData';
import { HISTORICAL_VOTE_SHARE, HISTORICAL_SEATS, HISTORICAL_TURNOUT } from '../data/historicalElections';
import { CANDIDATES_2026, ELECTION_SCHEDULE_2026, VOTER_STATS_2026, OPINION_POLLS_2026 } from '../data/candidates2026';
import { CANDIDATE_PROFILES } from '../data/candidateProfiles';
import { loadCandidateDirectory } from '../data/candidateDirectory';
import { computeLiveStats } from '../data/liveStats';

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date('2026-04-23T07:00:00+05:30');
    const update = () => {
      const diff = target - new Date();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const blocks = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3">
      {blocks.map(b => (
        <div key={b.label} className="text-center">
          <div className="bg-slate-800/80 border border-amber-500/20 rounded-lg w-16 h-16 flex items-center justify-center">
            <span className="text-2xl font-bold text-amber-400 tabular-nums">{String(b.value).padStart(2, '0')}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{b.label}</p>
        </div>
      ))}
    </div>
  );
}

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="backdrop-blur-xl bg-slate-900/90 border border-slate-600/50 rounded-xl p-4 shadow-2xl shadow-black/50">
      <p className="text-sm font-semibold text-white mb-2 border-b border-slate-700/50 pb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color, boxShadow: `0 0 6px ${p.color}60` }} />
          <span className="text-xs text-slate-400">{p.name}:</span>
          <span className="text-xs font-medium text-white">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [year, setYear] = useState(2026);
  const [liveStats, setLiveStats] = useState(null);
  const summary = ELECTION_SUMMARY[year];
  const is2026 = year === 2026;

  useEffect(() => {
    loadCandidateDirectory()
      .then(dir => setLiveStats(computeLiveStats(dir.entries)))
      .catch(() => {});
  }, []);

  const criminal = is2026 ? liveStats?.criminal : CRIMINAL_STATS[year];
  const assets = is2026 ? liveStats?.assets : ASSET_STATS[year];
  const liveEducation = is2026 ? liveStats?.education : null;
  const liveAge = is2026 ? liveStats?.age : null;

  // Compute trend vs previous election for criminal records
  const prevYearMap = { 2011: 2006, 2016: 2011, 2021: 2016 };
  const prevCriminal = prevYearMap[year] ? CRIMINAL_STATS[prevYearMap[year]] : null;
  const criminalTrend = (!is2026 && criminal && prevCriminal)
    ? parseFloat(((criminal.percentWinnersWithCases || criminal.percentWithCases) - (prevCriminal.percentWinnersWithCases || prevCriminal.percentWithCases)).toFixed(1))
    : undefined;

  const partyData = Object.entries(summary.results)
    .map(([party, data]) => ({ party, seats: data.seats, voteShare: data.voteShare }))
    .filter(d => d.seats > 0)
    .sort((a, b) => b.seats - a.seats);

  const pieData = partyData.filter(d => d.seats > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Tamil Nadu Elections <span className="text-amber-400">{year}</span>
            {is2026 && <span className="text-sm ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">Upcoming • April 23</span>}
          </h1>
          <p className="text-slate-400 mt-1">
            {summary.totalConstituencies} constituencies • {(summary.totalVoters / 1000000).toFixed(1)}M voters
            {summary.turnoutPercent ? ` • ${summary.turnoutPercent}% turnout` : ' • Polling on April 23, 2026'}
          </p>
          {is2026 && (
            <p className="text-sm text-sky-300 mt-2">
              Pre-election public tracker only. This dashboard does not declare a winner, chief minister, or final two-way race before voting and counting are completed.
            </p>
          )}
        </div>
        <YearSelector selectedYear={year} onChange={setYear} />
      </div>

      {/* Countdown + Featured Candidates (2026 only) */}
      {is2026 && (
        <div className="bg-gradient-to-r from-slate-800/80 via-slate-800/60 to-slate-800/80 border border-amber-500/10 rounded-xl p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">Countdown to Election Day</h2>
              </div>
              <p className="text-slate-400 text-sm mb-3">April 23, 2026 — Tamil Nadu Legislative Assembly Election</p>
              <CountdownTimer />
            </div>
            <div className="flex-1 max-w-xl">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Major Leaders And Parties</p>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {CANDIDATE_PROFILES.slice(0, 5).map(c => (
                  <Link key={c.id} to={`/candidate/${c.id}`} className="flex items-center gap-2 bg-slate-900/60 border border-slate-700/40 rounded-lg px-3 py-2 hover:border-amber-500/30 transition-colors min-w-fit">
                    <img src={c.photo} alt={c.name} className="w-8 h-8 rounded-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                    <div>
                      <p className="text-sm font-medium text-white whitespace-nowrap">{c.name}</p>
                      <p className="text-[10px] text-slate-500">{c.party}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/candidates" className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 mt-2">
                View all candidates <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={is2026 ? 'Election Status' : 'CM Elect'}
          value={is2026 ? 'Multi-cornered contest' : summary.chiefMinister}
          subtitle={is2026 ? 'SPA, NDA, TVK, NTK and other parties are in the field' : summary.cmParty}
          icon={Users}
          color="amber"
        />
        <StatCard
          title={is2026 ? 'Criminal Records' : 'Winners with Cases'}
          value={criminal
            ? (is2026
              ? (criminal.isPartial ? `${criminal.withCriminalCases} declared` : `${criminal.percentWithCases}%`)
              : `${criminal.percentWinnersWithCases || criminal.percentWithCases}%`)
            : 'Loading…'}
          subtitle={criminal
            ? (is2026
              ? (criminal.isPartial
                ? `${criminal.affidavitsSynced} of ${criminal.totalCandidatesAnalyzed} affidavits synced`
                : `${criminal.withCriminalCases} of ${criminal.totalCandidatesAnalyzed} candidates`)
              : `${criminal.winnersWithCases || criminal.withCriminalCases} of ${criminal.winnersAnalyzed || criminal.totalCandidatesAnalyzed} elected MLAs`)
            : 'Fetching affidavit data…'}
          icon={AlertTriangle}
          color="red"
          trend={criminalTrend}
        />
        <StatCard
          title={is2026 ? 'Avg Assets' : 'Avg Assets (Winners)'}
          value={is2026 ? (assets ? `₹${assets.avgAssets} Cr` : (liveStats ? 'Awaiting sync' : 'Loading…')) : (assets ? `₹${assets.avgAssets} Cr` : 'TBD')}
          subtitle={is2026 ? (assets ? `Richest: ₹${assets.richest} Cr • Median: ₹${assets.medianAssets} Cr` : (liveStats ? `${liveStats.totalCandidates} candidates, affidavit asset data pending` : 'Fetching affidavit data…')) : (assets ? `Richest: ₹${assets.richest} Cr` : '')}
          icon={Banknote}
          color="green"
        />
        <StatCard
          title="Total Candidates"
          value={is2026 ? (liveStats ? liveStats.totalCandidates.toLocaleString() : 'Loading…') : (summary.totalCandidates ? summary.totalCandidates.toLocaleString() : '4500+')}
          subtitle={is2026 ? `From ECI affidavit portal • ${VOTER_STATS_2026.totalVoters ? (VOTER_STATS_2026.totalVoters / 10000000).toFixed(2) + ' Cr voters' : ''}` : `${summary.turnoutPercent}% voter turnout`}
          icon={Vote}
          color="blue"
        />
      </div>

      {/* Pre-Poll Surveys (2026 only) */}
      {is2026 && (
        <div className="relative bg-gradient-to-br from-slate-800/70 via-slate-800/50 to-slate-900/70 border border-slate-700/30 rounded-2xl p-6 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.03] to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Pre-Poll Surveys</h2>
              <p className="text-xs text-slate-500">Latest surveys from multiple agencies. Projected seats out of 234. Majority mark: 118.</p>
            </div>
            <span className="text-[10px] px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full uppercase tracking-wider">Opinion Polls</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-slate-900">
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left p-2">Agency</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-center p-2">SPA</th>
                  <th className="text-center p-2">AIADMK+</th>
                  <th className="text-center p-2">TVK</th>
                  <th className="text-center p-2">Others</th>
                  <th className="text-center p-2">Sample</th>
                </tr>
              </thead>
              <tbody>
                {OPINION_POLLS_2026.map((poll, index) => (
                  <tr key={index} className={`border-b border-slate-700/50 hover:bg-slate-800/80 ${index === 0 ? 'bg-amber-500/5' : ''}`}>
                    <td className="p-2">
                      <span className="text-white font-medium">{poll.agency}</span>
                      {index === 0 && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">New</span>}
                    </td>
                    <td className="p-2 text-slate-400">{new Date(poll.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td className="p-2 text-center"><span className="text-red-400 font-medium">{poll.seats.SPA}</span></td>
                    <td className="p-2 text-center"><span className="text-green-400 font-medium">{poll.seats['AIADMK+']}</span></td>
                    <td className="p-2 text-center"><span className="text-sky-400 font-medium">{poll.seats.TVK}</span></td>
                    <td className="p-2 text-center"><span className="text-slate-500">{poll.seats.Others}</span></td>
                    <td className="p-2 text-center text-slate-400">{poll.sampleSize.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700/50">
            <h4 className="text-xs font-semibold text-purple-400 uppercase mb-2">Vote Share Estimates</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-700/30">
                    <th className="text-left p-1.5">Agency</th>
                    <th className="text-center p-1.5">SPA</th>
                    <th className="text-center p-1.5">AIADMK+</th>
                    <th className="text-center p-1.5">TVK</th>
                    <th className="text-center p-1.5">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {OPINION_POLLS_2026.map((poll, index) => (
                    <tr key={index} className="border-b border-slate-700/20">
                      <td className="p-1.5 text-slate-400">{poll.agency}</td>
                      <td className="p-1.5 text-center text-red-400">{poll.voteShare.SPA}</td>
                      <td className="p-1.5 text-center text-green-400">{poll.voteShare['AIADMK+']}</td>
                      <td className="p-1.5 text-center text-sky-400">{poll.voteShare.TVK}</td>
                      <td className="p-1.5 text-center text-slate-500">{poll.voteShare.Others}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[10px] text-slate-600 mt-2">Sources: Lok Poll via Oneindia, O&R-CVoter, News18-Vote Vibe, Agni News, IANS-Matrize. Seat projections are pre-poll estimates only.</p>
        </div>
      )}

      {/* Ad Banner */}
      <AdBanner variant="banner" />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Party Seats */}
        <div className="relative bg-gradient-to-br from-slate-800/70 via-slate-800/50 to-slate-900/70 border border-slate-700/30 rounded-2xl p-6 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent pointer-events-none" />
          <SectionHeader title={is2026 ? 'Constituencies Announced By Party' : 'Seats Won by Party'} />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={partyData} layout="vertical" margin={{ left: 10 }}>
              <defs>
                {partyData.map(entry => (
                  <linearGradient key={`grad-${entry.party}`} id={`barGrad-${entry.party}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={PARTY_COLORS[entry.party] || PARTY_COLORS.Others} stopOpacity={0.7} />
                    <stop offset="100%" stopColor={PARTY_COLORS[entry.party] || PARTY_COLORS.Others} stopOpacity={1} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.4} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#475569' }} />
              <YAxis type="category" dataKey="party" width={70} tick={{ fontSize: 11, fill: '#e2e8f0' }} axisLine={false} tickLine={false} />
              <Tooltip content={CUSTOM_TOOLTIP} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
              <Bar dataKey="seats" radius={[0, 6, 6, 0]} animationDuration={1200}>
                {partyData.map((entry) => (
                  <Cell key={entry.party} fill={`url(#barGrad-${entry.party})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Seat Distribution Pie */}
        <div className="relative bg-gradient-to-br from-slate-800/70 via-slate-800/50 to-slate-900/70 border border-slate-700/30 rounded-2xl p-6 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tl from-purple-500/[0.03] to-transparent pointer-events-none" />
          <SectionHeader title={is2026 ? 'Contest Coverage Snapshot' : 'Seat Distribution'} />
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <defs>
                {pieData.map(entry => (
                  <filter key={`glow-${entry.party}`} id={`pieGlow-${entry.party}`}>
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={PARTY_COLORS[entry.party] || PARTY_COLORS.Others} floodOpacity="0.4" />
                  </filter>
                ))}
              </defs>
              <Pie
                data={pieData}
                dataKey="seats"
                nameKey="party"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={105}
                paddingAngle={2}
                label={({ party, seats }) => `${party} (${seats})`}
                labelLine={{ stroke: '#64748b', strokeWidth: 1 }}
                animationDuration={1200}
                strokeWidth={0}
              >
                {pieData.map((entry) => (
                  <Cell
                    key={entry.party}
                    fill={PARTY_COLORS[entry.party] || PARTY_COLORS.Others}
                    style={{ filter: `drop-shadow(0 0 4px ${(PARTY_COLORS[entry.party] || PARTY_COLORS.Others)}40)` }}
                  />
                ))}
              </Pie>
              <Tooltip content={CUSTOM_TOOLTIP} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ad Banner */}
      <AdBanner variant="in-feed" />

      {/* Charts Row 2 */}
      {(EDUCATION_DATA[year] || liveEducation) && (AGE_DATA[year] || liveAge) && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Education */}
        <div className="relative bg-gradient-to-br from-slate-800/70 via-slate-800/50 to-slate-900/70 border border-slate-700/30 rounded-2xl p-6 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] to-transparent pointer-events-none" />
          <SectionHeader title={is2026 ? 'Education of Candidates' : 'Education of Elected MLAs'} />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={is2026 ? liveEducation : EDUCATION_DATA[year]} margin={{ bottom: 5 }}>
              <defs>
                <linearGradient id="eduBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                  <stop offset="100%" stopColor="#d97706" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.4} />
              <XAxis dataKey="level" tick={{ fontSize: 9, fill: '#94a3b8' }} angle={-35} textAnchor="end" height={60} axisLine={{ stroke: '#475569' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={CUSTOM_TOOLTIP} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
              <Bar dataKey="count" fill="url(#eduBarGrad)" radius={[6, 6, 0, 0]} name={is2026 ? 'Candidates' : 'MLAs'} animationDuration={1200}>
                {(is2026 ? liveEducation : EDUCATION_DATA[year])?.map((_, i) => (
                  <Cell key={i} style={{ filter: 'drop-shadow(0 -2px 4px rgba(245,158,11,0.2))' }} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Age Demographics */}
        <div className="relative bg-gradient-to-br from-slate-800/70 via-slate-800/50 to-slate-900/70 border border-slate-700/30 rounded-2xl p-6 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tl from-blue-500/[0.02] to-transparent pointer-events-none" />
          <SectionHeader title={is2026 ? 'Age Demographics of Candidates' : 'Age Demographics of MLAs'} />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={is2026 ? liveAge : AGE_DATA[year]}>
              <defs>
                <linearGradient id="ageBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.4} />
              <XAxis dataKey="group" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#475569' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={CUSTOM_TOOLTIP} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
              <Bar dataKey="count" fill="url(#ageBarGrad)" radius={[6, 6, 0, 0]} name={is2026 ? 'Candidates' : 'MLAs'} animationDuration={1200}>
                {(is2026 ? liveAge : AGE_DATA[year])?.map((_, i) => (
                  <Cell key={i} style={{ filter: 'drop-shadow(0 -2px 4px rgba(59,130,246,0.2))' }} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}

      {/* Historical Trends Quick Glance — full 1952–2021 */}
      <div className="relative bg-gradient-to-br from-slate-800/70 via-slate-800/50 to-slate-900/70 border border-slate-700/30 rounded-2xl p-6 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/[0.02] via-transparent to-green-500/[0.02] pointer-events-none" />
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Vote Share Trend (1952–2021)" subtitle="74 years of electoral history" />
          <Link to="/trends" className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg transition-all hover:bg-amber-500/20">
            <TrendingUp className="w-3 h-3" /> Full Trends <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={HISTORICAL_VOTE_SHARE}>
            <defs>
              <linearGradient id="dashGradDMK" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={PARTY_COLORS.DMK} stopOpacity={0.35} />
                <stop offset="95%" stopColor={PARTY_COLORS.DMK} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dashGradAIADMK" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={PARTY_COLORS.AIADMK} stopOpacity={0.35} />
                <stop offset="95%" stopColor={PARTY_COLORS.AIADMK} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dashGradINC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={PARTY_COLORS.INC} stopOpacity={0.25} />
                <stop offset="95%" stopColor={PARTY_COLORS.INC} stopOpacity={0} />
              </linearGradient>
              <filter id="glowDMK"><feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={PARTY_COLORS.DMK} floodOpacity="0.5" /></filter>
              <filter id="glowAIADMK"><feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={PARTY_COLORS.AIADMK} floodOpacity="0.5" /></filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.4} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#475569' }} />
            <YAxis unit="%" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={CUSTOM_TOOLTIP} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="INC" stroke={PARTY_COLORS.INC} fill="url(#dashGradINC)" strokeWidth={2} name="Congress" dot={{ r: 3, strokeWidth: 1 }} activeDot={{ r: 5, strokeWidth: 2 }} />
            <Area type="monotone" dataKey="DMK" stroke={PARTY_COLORS.DMK} fill="url(#dashGradDMK)" strokeWidth={2.5} name="DMK" dot={{ r: 3, strokeWidth: 1 }} activeDot={{ r: 6, strokeWidth: 2, filter: 'url(#glowDMK)' }} />
            <Area type="monotone" dataKey="AIADMK" stroke={PARTY_COLORS.AIADMK} fill="url(#dashGradAIADMK)" strokeWidth={2.5} name="AIADMK" dot={{ r: 3, strokeWidth: 1 }} activeDot={{ r: 6, strokeWidth: 2, filter: 'url(#glowAIADMK)' }} />
            <Area type="monotone" dataKey="BJP" stroke={PARTY_COLORS.BJP} fill="none" strokeWidth={1.5} name="BJP" dot={{ r: 2 }} strokeDasharray="5 3" />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-[10px] text-slate-500 text-center mt-2">Congress dominant 1952–1962 → DMK wins 1967 → AIADMK emerges 1977 → Two-party Dravidian era begins</p>
      </div>

      {/* Alliance Results */}
      <div className="relative bg-gradient-to-br from-slate-800/70 via-slate-800/50 to-slate-900/70 border border-slate-700/30 rounded-2xl p-6 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] to-transparent pointer-events-none" />
        <SectionHeader title={is2026 ? `Alliance Seat-Sharing Snapshot – ${year}` : `Alliance Results – ${year}`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(summary.allianceResults).map(([alliance, data]) => (
            <div key={alliance} className="bg-gradient-to-br from-slate-900/70 to-slate-800/50 rounded-xl p-5 border border-slate-700/30 hover:border-amber-500/20 transition-all duration-300">
              <h3 className="text-lg font-semibold text-white mb-2">{alliance}</h3>
              <p className="text-3xl font-bold text-amber-400 mb-3">{data.seats} <span className="text-base font-normal text-slate-500">seats</span></p>
              <div className="flex flex-wrap gap-2">
                {data.parties.map(p => <PartyBadge key={p} party={p} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Data Source Disclaimer */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          <strong className="text-slate-400">Data Sources:</strong> Election results & voter data from{' '}
          <a href="https://www.eci.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-500/70 hover:text-amber-400">Election Commission of India</a> &{' '}
          <a href="https://tnsec.tn.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-500/70 hover:text-amber-400">TNSEC</a>.
          Criminal records & asset data from candidate self-sworn affidavits via{' '}
          <a href="https://myneta.info" target="_blank" rel="noopener noreferrer" className="text-amber-500/70 hover:text-amber-400">myneta.info</a>{' '}
          (<a href="https://adrindia.org" target="_blank" rel="noopener noreferrer" className="text-amber-500/70 hover:text-amber-400">ADR</a>).
          Affidavit source: <a href="https://affidavitarchive.nic.in" target="_blank" rel="noopener noreferrer" className="text-amber-500/70 hover:text-amber-400">affidavitarchive.nic.in</a>.
          This platform does not independently verify candidate declarations. For authoritative data, refer to ECI/TNSEC publications.
        </p>
      </div>    </div>
  );
}
