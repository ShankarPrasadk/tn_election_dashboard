import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  Legend, CartesianGrid, AreaChart, Area, LabelList, ReferenceLine,
  RadialBarChart, RadialBar
} from 'recharts';
import { Users, AlertTriangle, Banknote, GraduationCap, Vote, TrendingUp, Clock, ArrowRight, BarChart3 } from 'lucide-react';
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
        {/* Party Seats — modern horizontal bars with inline values */}
        <div className="relative bg-gradient-to-br from-slate-800/80 via-slate-900/60 to-slate-800/80 border border-slate-700/20 rounded-2xl p-6 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">{is2026 ? 'Constituencies Announced' : 'Seats Won'}</h2>
          </div>
          <div className="space-y-2.5">
            {partyData.slice(0, 10).map((entry, i) => {
              const maxSeats = partyData[0]?.seats || 1;
              const pct = (entry.seats / maxSeats) * 100;
              const color = PARTY_COLORS[entry.party] || PARTY_COLORS.Others;
              return (
                <div key={entry.party} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-300 tracking-wide">{entry.party}</span>
                    <span className="text-xs font-bold tabular-nums" style={{ color }}>{entry.seats}</span>
                  </div>
                  <div className="relative h-7 bg-slate-800/80 rounded-lg overflow-hidden border border-slate-700/30">
                    <div
                      className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                        background: `linear-gradient(90deg, ${color}20, ${color}90)`,
                        boxShadow: `inset 0 1px 0 ${color}30, 0 0 12px ${color}15`,
                      }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded-lg opacity-50"
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                        background: `linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 60%)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {partyData.length > 10 && (
            <p className="text-[10px] text-slate-600 mt-3">+ {partyData.length - 10} more parties</p>
          )}
        </div>

        {/* Seat Distribution — modern donut with center text */}
        <div className="relative bg-gradient-to-br from-slate-800/80 via-slate-900/60 to-slate-800/80 border border-slate-700/20 rounded-2xl p-6 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          <div className="flex items-center gap-2 mb-5">
            <Vote className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">{is2026 ? 'Contest Coverage' : 'Seat Distribution'}</h2>
          </div>
          <div className="relative">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <defs>
                  {pieData.map(entry => {
                    const c = PARTY_COLORS[entry.party] || PARTY_COLORS.Others;
                    return (
                      <linearGradient key={`pg-${entry.party}`} id={`pieGrad-${entry.party}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={c} stopOpacity={0.85} />
                        <stop offset="100%" stopColor={c} stopOpacity={1} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <Pie
                  data={pieData}
                  dataKey="seats"
                  nameKey="party"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={110}
                  paddingAngle={3}
                  cornerRadius={4}
                  animationDuration={1400}
                  animationBegin={200}
                  stroke="none"
                >
                  {pieData.map(entry => (
                    <Cell
                      key={entry.party}
                      fill={`url(#pieGrad-${entry.party})`}
                      style={{ filter: `drop-shadow(0 0 6px ${(PARTY_COLORS[entry.party] || PARTY_COLORS.Others)}50)` }}
                    />
                  ))}
                </Pie>
                <Tooltip content={CUSTOM_TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-10px' }}>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{summary.totalConstituencies}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Seats</p>
              </div>
            </div>
          </div>
          {/* Legend grid */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 mt-2">
            {pieData.slice(0, 9).map(entry => {
              const c = PARTY_COLORS[entry.party] || PARTY_COLORS.Others;
              return (
                <div key={entry.party} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c, boxShadow: `0 0 4px ${c}60` }} />
                  <span className="text-[10px] text-slate-400 truncate">{entry.party}</span>
                  <span className="text-[10px] font-semibold text-slate-300 ml-auto tabular-nums">{entry.seats}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ad Banner */}
      <AdBanner variant="in-feed" />

      {/* Charts Row 2 — Education & Age */}
      {(EDUCATION_DATA[year] || liveEducation) && (AGE_DATA[year] || liveAge) && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Education — horizontal bars with inline progress */}
        <div className="relative bg-gradient-to-br from-slate-800/80 via-slate-900/60 to-slate-800/80 border border-slate-700/20 rounded-2xl p-6 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
          <div className="flex items-center gap-2 mb-5">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">{is2026 ? 'Education of Candidates' : 'Education of MLAs'}</h2>
          </div>
          {(() => {
            const eduData = is2026 ? liveEducation : EDUCATION_DATA[year];
            const maxCount = eduData ? Math.max(...eduData.map(d => d.count)) : 1;
            const total = eduData ? eduData.reduce((s, d) => s + d.count, 0) : 1;
            const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899'];
            return (
              <div className="space-y-3">
                {eduData?.map((d, i) => {
                  const pct = (d.count / maxCount) * 100;
                  const sharePct = ((d.count / total) * 100).toFixed(1);
                  const color = colors[i % colors.length];
                  return (
                    <div key={d.level}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">{d.level}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">{sharePct}%</span>
                          <span className="text-xs font-bold tabular-nums" style={{ color }}>{d.count}</span>
                        </div>
                      </div>
                      <div className="relative h-5 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/30">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.max(pct, 3)}%`,
                            background: `linear-gradient(90deg, ${color}25, ${color}85)`,
                            boxShadow: `0 0 10px ${color}20`,
                          }}
                        />
                        <div
                          className="absolute inset-y-0 left-0 rounded-full opacity-40"
                          style={{
                            width: `${Math.max(pct, 3)}%`,
                            background: `linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%)`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Age Demographics — modern vertical bars with labels */}
        <div className="relative bg-gradient-to-br from-slate-800/80 via-slate-900/60 to-slate-800/80 border border-slate-700/20 rounded-2xl p-6 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          <div className="flex items-center gap-2 mb-5">
            <Users className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">{is2026 ? 'Age of Candidates' : 'Age of MLAs'}</h2>
          </div>
          {(() => {
            const ageData = is2026 ? liveAge : AGE_DATA[year];
            const maxCount = ageData ? Math.max(...ageData.map(d => d.count)) : 1;
            return (
              <div className="flex items-end gap-3 h-[240px] pt-6">
                {ageData?.map((d, i) => {
                  const heightPct = (d.count / maxCount) * 100;
                  const blueShades = ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'];
                  const color = blueShades[i % blueShades.length];
                  return (
                    <div key={d.group} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-xs font-bold tabular-nums" style={{ color }}>{d.count}</span>
                      <div className="w-full relative rounded-t-lg overflow-hidden" style={{ height: `${Math.max(heightPct, 5)}%` }}>
                        <div
                          className="absolute inset-0 rounded-t-lg"
                          style={{
                            background: `linear-gradient(180deg, ${color} 0%, ${color}50 100%)`,
                            boxShadow: `0 -4px 16px ${color}25, inset 0 1px 0 rgba(255,255,255,0.15)`,
                          }}
                        />
                        <div className="absolute inset-0 rounded-t-lg opacity-30" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 40%)' }} />
                      </div>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">{d.group}</span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
      )}

      {/* Historical Trends — modern area chart */}
      <div className="relative bg-gradient-to-br from-slate-800/80 via-slate-900/60 to-slate-800/80 border border-slate-700/20 rounded-2xl p-6 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-400" />
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Vote Share Trend</h2>
              <p className="text-[11px] text-slate-500">1952–2021 • 74 years of electoral history</p>
            </div>
          </div>
          <Link to="/trends" className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg transition-all hover:bg-amber-500/15 hover:border-amber-500/30">
            <TrendingUp className="w-3.5 h-3.5" /> Full Trends <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={HISTORICAL_VOTE_SHARE} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="dashGradDMK" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PARTY_COLORS.DMK} stopOpacity={0.4} />
                <stop offset="50%" stopColor={PARTY_COLORS.DMK} stopOpacity={0.08} />
                <stop offset="100%" stopColor={PARTY_COLORS.DMK} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dashGradAIADMK" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PARTY_COLORS.AIADMK} stopOpacity={0.4} />
                <stop offset="50%" stopColor={PARTY_COLORS.AIADMK} stopOpacity={0.08} />
                <stop offset="100%" stopColor={PARTY_COLORS.AIADMK} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dashGradINC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PARTY_COLORS.INC} stopOpacity={0.25} />
                <stop offset="50%" stopColor={PARTY_COLORS.INC} stopOpacity={0.05} />
                <stop offset="100%" stopColor={PARTY_COLORS.INC} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" strokeOpacity={0.8} />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#334155' }} tickLine={false} />
            <YAxis unit="%" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
            <Tooltip content={CUSTOM_TOOLTIP} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
            <Area type="monotone" dataKey="INC" stroke={PARTY_COLORS.INC} fill="url(#dashGradINC)" strokeWidth={2} name="Congress" dot={false} activeDot={{ r: 5, strokeWidth: 2, fill: '#1e293b' }} />
            <Area type="monotone" dataKey="DMK" stroke={PARTY_COLORS.DMK} fill="url(#dashGradDMK)" strokeWidth={2.5} name="DMK" dot={false} activeDot={{ r: 6, strokeWidth: 2, fill: '#1e293b' }} />
            <Area type="monotone" dataKey="AIADMK" stroke={PARTY_COLORS.AIADMK} fill="url(#dashGradAIADMK)" strokeWidth={2.5} name="AIADMK" dot={false} activeDot={{ r: 6, strokeWidth: 2, fill: '#1e293b' }} />
            <Area type="monotone" dataKey="BJP" stroke={PARTY_COLORS.BJP} fill="none" strokeWidth={1.5} name="BJP" dot={false} activeDot={{ r: 4, strokeWidth: 2, fill: '#1e293b' }} strokeDasharray="6 3" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-2">
          <span className="text-[10px] text-slate-600">Congress era 1952–62</span>
          <span className="text-[10px] text-slate-600">→</span>
          <span className="text-[10px] text-slate-600">DMK rises 1967</span>
          <span className="text-[10px] text-slate-600">→</span>
          <span className="text-[10px] text-slate-600">AIADMK emerges 1977</span>
          <span className="text-[10px] text-slate-600">→</span>
          <span className="text-[10px] text-slate-600">Dravidian duopoly</span>
        </div>
      </div>

      {/* Alliance Results — modern cards */}
      <div className="relative bg-gradient-to-br from-slate-800/80 via-slate-900/60 to-slate-800/80 border border-slate-700/20 rounded-2xl p-6 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <div className="flex items-center gap-2 mb-5">
          <Users className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">{is2026 ? `Alliance Seat-Sharing – ${year}` : `Alliance Results – ${year}`}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Object.entries(summary.allianceResults).map(([alliance, data], idx) => {
            const accentColors = ['#e11d48', '#16a34a', '#f59e0b', '#3b82f6'];
            const accent = accentColors[idx % accentColors.length];
            return (
              <div key={alliance} className="relative bg-slate-900/60 rounded-xl p-5 border border-slate-700/20 overflow-hidden group hover:border-slate-600/40 transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}40, transparent)` }} />
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5" style={{ background: accent, filter: 'blur(30px)' }} />
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{alliance}</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold tabular-nums" style={{ color: accent }}>{data.seats}</span>
                  <span className="text-sm text-slate-500">seats</span>
                </div>
                {/* Seat bar */}
                <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${(data.seats / 234) * 100}%`,
                      background: `linear-gradient(90deg, ${accent}60, ${accent})`,
                      boxShadow: `0 0 8px ${accent}30`,
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {data.parties.map(p => <PartyBadge key={p} party={p} />)}
                </div>
              </div>
            );
          })}
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
