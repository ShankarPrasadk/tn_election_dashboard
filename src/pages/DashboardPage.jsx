import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  Legend, CartesianGrid, AreaChart, Area, LabelList, ReferenceLine,
  RadialBarChart, RadialBar
} from 'recharts';
import { Users, AlertTriangle, Banknote, GraduationCap, Vote, TrendingUp, Clock, ArrowRight, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard, YearSelector, SectionHeader, PartyBadge, PartyIdentity } from '../components/UIComponents';
import PartyFlag from '../components/PartyFlag';
import PartySymbolIcon from '../components/PartySymbolIcon';
import AdBanner from '../components/AdBanner';
import {
  ELECTION_SUMMARY, PARTY_COLORS, CRIMINAL_STATS, ASSET_STATS,
  EDUCATION_DATA, AGE_DATA
} from '../data/electionData';
import { HISTORICAL_VOTE_SHARE, HISTORICAL_SEATS, HISTORICAL_TURNOUT } from '../data/historicalElections';
import { CANDIDATES_2026, ELECTION_SCHEDULE_2026, VOTER_STATS_2026, OPINION_POLLS_2026 } from '../data/candidates2026';
import { CANDIDATE_PROFILES } from '../data/candidateProfiles';
import { loadCandidateDirectory } from '../data/candidateDirectory';
import CommunityPoll from '../components/CommunityPoll';
import ElectionQuiz from '../components/ElectionQuiz';
import ShareBar from '../components/ShareBar';
import { computeLiveStats } from '../data/liveStats';
import { useI18n } from '../i18n';
import { useElectionState } from '../context/StateContext';
import {
  PY_ELECTION_SUMMARY, PY_PARTY_COLORS, PY_CRIMINAL_STATS, PY_ASSET_STATS,
  PY_EDUCATION_DATA, PY_AGE_DATA, PY_CANDIDATES_2026, PY_VOTER_STATS_2026,
  PY_OPINION_POLLS_2026, PY_HISTORICAL_VOTE_SHARE, PY_KEY_CANDIDATES
} from '../data/pyElectionData';

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
    <div className="flex gap-2.5">
      {blocks.map(b => (
        <div key={b.label} className="text-center">
          <div className="glass-card rounded-xl w-14 h-14 flex items-center justify-center border border-amber-500/[0.08] glow-amber">
            <span className="text-xl font-bold text-amber-400 tabular-nums font-mono">{String(b.value).padStart(2, '0')}</span>
          </div>
          <p className="text-[9px] text-slate-600 mt-1 uppercase tracking-widest font-medium">{b.label}</p>
        </div>
      ))}
    </div>
  );
}

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card rounded-xl p-3 shadow-2xl shadow-black/60">
      <p className="text-xs font-semibold text-white mb-1.5 border-b border-white/[0.06] pb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color, boxShadow: `0 0 8px ${p.color}80` }} />
          <span className="text-[11px] text-slate-500">{p.name}:</span>
          <span className="text-[11px] font-semibold text-white">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [year, setYear] = useState(2026);
  const [liveStats, setLiveStats] = useState(null);
  const { t } = useI18n();
  const { stateCode, config } = useElectionState();
  const isPY = stateCode === 'PY';

  const electionSummary = isPY ? PY_ELECTION_SUMMARY : ELECTION_SUMMARY;
  const partyColors = isPY ? PY_PARTY_COLORS : PARTY_COLORS;
  const criminalStats = isPY ? PY_CRIMINAL_STATS : CRIMINAL_STATS;
  const assetStats = isPY ? PY_ASSET_STATS : ASSET_STATS;
  const educationData = isPY ? PY_EDUCATION_DATA : EDUCATION_DATA;
  const ageDataMap = isPY ? PY_AGE_DATA : AGE_DATA;
  const voterStats = isPY ? PY_VOTER_STATS_2026 : VOTER_STATS_2026;
  const opinionPolls = isPY ? PY_OPINION_POLLS_2026 : OPINION_POLLS_2026;
  const historicalVoteShare = isPY ? PY_HISTORICAL_VOTE_SHARE : HISTORICAL_VOTE_SHARE;
  const availableYears = isPY ? [2006, 2011, 2016, 2021, 2026] : [2006, 2011, 2016, 2021, 2026];

  const summary = electionSummary[year];
  const is2026 = year === 2026;

  useEffect(() => {
    if (isPY) return; // PY doesn't have live candidate directory yet
    loadCandidateDirectory()
      .then(dir => setLiveStats(computeLiveStats(dir.entries)))
      .catch(() => {});
  }, [isPY]);

  const criminal = is2026 ? (isPY ? null : liveStats?.criminal) : criminalStats[year];
  const assets = is2026 ? (isPY ? null : liveStats?.assets) : assetStats[year];
  const liveEducation = is2026 ? (isPY ? null : liveStats?.education) : null;
  const liveAge = is2026 ? (isPY ? null : liveStats?.age) : null;

  // Compute trend vs previous election for criminal records
  const prevYearMap = { 2011: 2006, 2016: 2011, 2021: 2016 };
  const prevCriminal = prevYearMap[year] ? criminalStats[prevYearMap[year]] : null;
  const criminalTrend = (!is2026 && criminal && prevCriminal)
    ? parseFloat(((criminal.percentWinnersWithCases || criminal.percentWithCases) - (prevCriminal.percentWinnersWithCases || prevCriminal.percentWithCases)).toFixed(1))
    : undefined;

  const partyData = Object.entries(summary.results)
    .map(([party, data]) => ({ party, seats: data.seats, voteShare: data.voteShare }))
    .filter(d => d.seats > 0)
    .sort((a, b) => b.seats - a.seats);

  const pieData = partyData.filter(d => d.seats > 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {t('dashboard.title')} <span className="text-amber-400">{year}</span>
            {is2026 && <span className="text-[10px] ml-2 px-2.5 py-1 bg-amber-500/[0.08] text-amber-400 rounded-full font-semibold border border-amber-500/[0.12] uppercase tracking-wider">{t('dashboard.upcoming')}</span>}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {summary.totalConstituencies} constituencies • {(summary.totalVoters / 1000000).toFixed(1)}M voters
            {summary.turnoutPercent ? ` • ${summary.turnoutPercent}% turnout` : ' • Polling on April 23, 2026'}
          </p>
          {is2026 && (
            <p className="text-xs text-sky-400/70 mt-1.5">
              {t('dashboard.preElectionNote')}
            </p>
          )}
        </div>
        <YearSelector selectedYear={year} onChange={setYear} years={availableYears} />
      </div>

      {/* Countdown + Featured Candidates (2026 only) */}
      {is2026 && (
        <div className="glass-card gradient-border rounded-2xl p-4 grid-bg">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-amber-500/[0.08] rounded-lg p-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <h2 className="text-base font-bold text-white tracking-tight">{t('dashboard.countdown')}</h2>
              </div>
              <p className="text-slate-500 text-xs mb-3">{t('dashboard.countdownSubtitle')}</p>
              <CountdownTimer />
            </div>
            <div className="flex-1 max-w-xl space-y-3">
              {/* Major Leaders */}
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold mb-2">{t('dashboard.majorLeaders')}</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {isPY ? (
                    PY_KEY_CANDIDATES.map(c => (
                      <div key={c.id} className="flex items-center gap-2 glass rounded-xl px-3 py-2 min-w-fit">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: `${partyColors[c.party] || '#64748b'}25`, color: partyColors[c.party] || '#94a3b8' }}>
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white whitespace-nowrap">{c.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <PartyFlag party={c.party} size={8} />
                            <PartySymbolIcon party={c.party} size={10} color={partyColors[c.party]} />
                            <span className="text-[9px] text-slate-600">{c.party} • {c.role}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    CANDIDATE_PROFILES.slice(0, 5).map(c => (
                      <Link key={c.id} to={`/candidate/${c.id}`} className="flex items-center gap-2 glass rounded-xl px-3 py-2 hover:bg-white/[0.04] transition-all duration-200 min-w-fit group">
                        <img src={c.photo} alt={c.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-white/[0.06]" onError={e => { e.target.style.display = 'none'; }} />
                        <div>
                          <p className="text-xs font-semibold text-white whitespace-nowrap group-hover:text-amber-400 transition-colors">{c.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <PartyFlag party={c.party} size={8} />
                            <PartySymbolIcon party={c.party} size={10} color={partyColors[c.party]} />
                            <span className="text-[9px] text-slate-600">{c.party}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
              {/* Key Constituencies */}
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold mb-2">Key Constituencies</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {(isPY ? PY_CANDIDATES_2026 : CANDIDATES_2026.filter(c => ['Kolathur', 'Chepauk-Thiruvallikeni', 'Coimbatore South', 'Thousand Lights', 'Mylapore'].includes(c.constituency))).slice(0, 5).map(c => (
                    <div key={c.no} className="glass rounded-xl px-3 py-2 min-w-fit">
                      <p className="text-xs font-semibold text-white whitespace-nowrap">{c.constituency}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{c.district} • #{c.no}</p>
                    </div>
                  ))}
                </div>
              </div>
              <Link to="/candidates" className="inline-flex items-center gap-1 text-[11px] text-amber-400/80 hover:text-amber-300 font-medium">
                {t('dashboard.viewAllCandidates')} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title={is2026 ? t('dashboard.electionStatus') : 'CM Elect'}
          value={is2026 ? t('dashboard.multiCornered') : summary.chiefMinister}
          subtitle={is2026 ? (isPY ? 'NDA (AINRC+BJP), INDIA (DMK+INC) and others contesting' : 'SPA, NDA, TVK, NTK and other parties are in the field') : summary.cmParty}
          icon={Users}
          color="amber"
        />
        <StatCard
          title={is2026 ? t('dashboard.criminalRecords') : t('dashboard.winnersWithCases')}
          value={criminal
            ? (is2026
              ? (criminal.isPartial ? `${criminal.withCriminalCases} declared` : `${criminal.percentWithCases}%`)
              : `${criminal.percentWinnersWithCases || criminal.percentWithCases}%`)
            : (is2026 ? 'Coming soon' : 'N/A')}
          subtitle={criminal
            ? (is2026
              ? (criminal.isPartial
                ? `${criminal.affidavitsSynced} of ${criminal.totalCandidatesAnalyzed} affidavits synced`
                : `${criminal.withCriminalCases} of ${criminal.totalCandidatesAnalyzed} candidates`)
              : `${criminal.winnersWithCases || criminal.withCriminalCases} of ${criminal.winnersAnalyzed || criminal.totalCandidatesAnalyzed} elected MLAs`)
            : (is2026 ? 'Affidavit data pending' : `${config.name} data`)}
          icon={AlertTriangle}
          color="red"
          trend={criminalTrend}
        />
        <StatCard
          title={is2026 ? 'Avg Assets' : 'Avg Assets (Winners)'}
          value={is2026 ? (assets ? `₹${assets.avgAssets} Cr` : (isPY ? 'Coming soon' : (liveStats ? 'Awaiting sync' : 'Loading…'))) : (assets ? `₹${assets.avgAssets} Cr` : 'TBD')}
          subtitle={is2026 ? (assets ? `Richest: ₹${assets.richest} Cr • Median: ₹${assets.medianAssets} Cr` : (isPY ? `${config.name} affidavit data pending` : (liveStats ? `${liveStats.totalCandidates} candidates, affidavit asset data pending` : 'Fetching affidavit data…'))) : (assets ? `Richest: ₹${assets.richest} Cr` : '')}
          icon={Banknote}
          color="green"
        />
        <StatCard
          title="Total Candidates"
          value={is2026 ? (isPY ? (PY_CANDIDATES_2026.length * 4 + '+ expected') : (liveStats ? liveStats.totalCandidates.toLocaleString() : 'Loading…')) : (summary.totalCandidates ? summary.totalCandidates.toLocaleString() : '—')}
          subtitle={is2026 ? `From ECI affidavit portal • ${voterStats.totalVoters ? (voterStats.totalVoters >= 10000000 ? (voterStats.totalVoters / 10000000).toFixed(2) + ' Cr voters' : (voterStats.totalVoters / 100000).toFixed(1) + ' L voters') : ''}` : `${summary.turnoutPercent}% voter turnout`}
          icon={Vote}
          color="blue"
        />
      </div>

      {/* Pre-Poll Surveys (2026 only) */}
      {is2026 && !isPY && (
        <div className="glass-card rounded-2xl p-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Pre-Poll Surveys</h2>
              <p className="text-[11px] text-slate-500">Latest surveys from multiple agencies. Projected seats out of {config.totalSeats}. Majority mark: {config.majorityMark}.</p>
            </div>
            <span className="text-[9px] px-2.5 py-1 bg-purple-500/[0.08] text-purple-400 rounded-full uppercase tracking-widest font-semibold border border-purple-500/[0.12]">Opinion Polls</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-slate-900">
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left p-2">Agency</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-center p-2"><span className="inline-flex items-center gap-1"><PartyFlag party="DMK" size={8} /><PartySymbolIcon party="DMK" size={10} color={partyColors.DMK} />SPA</span></th>
                  <th className="text-center p-2"><span className="inline-flex items-center gap-1"><PartyFlag party="AIADMK" size={8} /><PartySymbolIcon party="AIADMK" size={10} color={partyColors.AIADMK} />AIADMK+</span></th>
                  <th className="text-center p-2"><span className="inline-flex items-center gap-1"><PartyFlag party="TVK" size={8} /><PartySymbolIcon party="TVK" size={10} color={partyColors.TVK} />TVK</span></th>
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

      {/* PY Pre-Poll Surveys (2026 only) */}
      {is2026 && isPY && (
        <div className="glass-card rounded-2xl p-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Pre-Poll Surveys – Puducherry</h2>
              <p className="text-[11px] text-slate-500">Projected seats out of {config.totalSeats}. Majority mark: {config.majorityMark}.</p>
            </div>
            <span className="text-[9px] px-2.5 py-1 bg-purple-500/[0.08] text-purple-400 rounded-full uppercase tracking-widest font-semibold border border-purple-500/[0.12]">Opinion Polls</span>
          </div>
          <div className="space-y-3">
            {PY_OPINION_POLLS_2026.map((poll, index) => (
              <div key={index} className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-white">{poll.source}</span>
                  <span className="text-[10px] text-slate-500">{poll.date}</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(poll.projections).map(([alliance, data]) => (
                    <div key={alliance}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">{alliance}</span>
                        <span className="text-xs font-bold tabular-nums" style={{ color: data.color }}>{data.min}–{data.max} seats</span>
                      </div>
                      <div className="relative h-5 bg-slate-800/80 rounded-full overflow-hidden">
                        <div className="absolute inset-y-0 rounded-full" style={{
                          left: `${(data.min / config.totalSeats) * 100}%`,
                          width: `${((data.max - data.min) / config.totalSeats) * 100}%`,
                          background: `linear-gradient(90deg, ${data.color}40, ${data.color}90)`,
                          boxShadow: `0 0 8px ${data.color}30`,
                        }} />
                        <div className="absolute top-0 bottom-0 w-px" style={{ left: `${(config.majorityMark / config.totalSeats) * 100}%`, background: '#f59e0b80' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 mt-2">Pre-poll projections are estimates only and not indicative of final results.</p>
        </div>
      )}

      {/* Ad Banner */}
      <AdBanner variant="banner" />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Party Seats — modern horizontal bars with inline values */}
        <div className="glass-card rounded-2xl p-4 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">{is2026 ? 'Constituencies Announced' : 'Seats Won'}</h2>
          </div>
          <div className="space-y-2.5">
            {partyData.slice(0, 10).map((entry, i) => {
              const maxSeats = partyData[0]?.seats || 1;
              const pct = (entry.seats / maxSeats) * 100;
              const color = partyColors[entry.party] || partyColors.Others;
              return (
                <div key={entry.party} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-300 tracking-wide inline-flex items-center gap-1.5">
                      <PartyFlag party={entry.party} size={10} />
                      <PartySymbolIcon party={entry.party} size={12} color={color} />
                      {entry.party}
                    </span>
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
        <div className="glass-card rounded-2xl p-4 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          <div className="flex items-center gap-2 mb-3">
            <Vote className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">{is2026 ? 'Contest Coverage' : 'Seat Distribution'}</h2>
          </div>
          <div className="relative">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <defs>
                  {pieData.map(entry => {
                    const c = partyColors[entry.party] || partyColors.Others;
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
                      style={{ filter: `drop-shadow(0 0 6px ${(partyColors[entry.party] || partyColors.Others)}50)` }}
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
              const c = partyColors[entry.party] || partyColors.Others;
              return (
                <div key={entry.party} className="flex items-center gap-1.5">
                  <PartyFlag party={entry.party} size={8} />
                  <PartySymbolIcon party={entry.party} size={10} color={c} />
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
      {(educationData[year] || liveEducation) && (ageDataMap[year] || liveAge) && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Education — horizontal bars with inline progress */}
        <div className="glass-card rounded-2xl p-4 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">{is2026 ? 'Education of Candidates' : 'Education of MLAs'}</h2>
          </div>
          {(() => {
            const eduData = is2026 ? liveEducation : educationData[year];
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
        <div className="glass-card rounded-2xl p-4 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">{is2026 ? 'Age of Candidates' : 'Age of MLAs'}</h2>
          </div>
          {(() => {
            const ageData = is2026 ? liveAge : ageDataMap[year];
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
      <div className="glass-card rounded-2xl p-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-400" />
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Vote Share Trend</h2>
              <p className="text-[11px] text-slate-500">{isPY ? '1964–2021 • 60 years of electoral history' : '1952–2021 • 74 years of electoral history'}</p>
            </div>
          </div>
          <Link to="/trends" className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg transition-all hover:bg-amber-500/15 hover:border-amber-500/30">
            <TrendingUp className="w-3.5 h-3.5" /> Full Trends <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={historicalVoteShare} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="dashGradDMK" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={partyColors.DMK} stopOpacity={0.4} />
                <stop offset="50%" stopColor={partyColors.DMK} stopOpacity={0.08} />
                <stop offset="100%" stopColor={partyColors.DMK} stopOpacity={0} />
              </linearGradient>
              <linearGradient id={isPY ? 'dashGradAINRC' : 'dashGradAIADMK'} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPY ? (partyColors.AINRC || '#059669') : partyColors.AIADMK} stopOpacity={0.4} />
                <stop offset="50%" stopColor={isPY ? (partyColors.AINRC || '#059669') : partyColors.AIADMK} stopOpacity={0.08} />
                <stop offset="100%" stopColor={isPY ? (partyColors.AINRC || '#059669') : partyColors.AIADMK} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dashGradINC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={partyColors.INC} stopOpacity={0.25} />
                <stop offset="50%" stopColor={partyColors.INC} stopOpacity={0.05} />
                <stop offset="100%" stopColor={partyColors.INC} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" strokeOpacity={0.8} />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#334155' }} tickLine={false} />
            <YAxis unit="%" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
            <Tooltip content={CUSTOM_TOOLTIP} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
            <Area type="monotone" dataKey="INC" stroke={partyColors.INC} fill="url(#dashGradINC)" strokeWidth={2} name="Congress" dot={false} activeDot={{ r: 5, strokeWidth: 2, fill: '#1e293b' }} />
            <Area type="monotone" dataKey="DMK" stroke={partyColors.DMK} fill="url(#dashGradDMK)" strokeWidth={2.5} name="DMK" dot={false} activeDot={{ r: 6, strokeWidth: 2, fill: '#1e293b' }} />
            {isPY ? (
              <Area type="monotone" dataKey="AINRC" stroke={partyColors.AINRC || '#059669'} fill={`url(#dashGradAINRC)`} strokeWidth={2.5} name="AINRC" dot={false} activeDot={{ r: 6, strokeWidth: 2, fill: '#1e293b' }} />
            ) : (
              <Area type="monotone" dataKey="AIADMK" stroke={partyColors.AIADMK} fill="url(#dashGradAIADMK)" strokeWidth={2.5} name="AIADMK" dot={false} activeDot={{ r: 6, strokeWidth: 2, fill: '#1e293b' }} />
            )}
            <Area type="monotone" dataKey="BJP" stroke={partyColors.BJP || '#f97316'} fill="none" strokeWidth={1.5} name="BJP" dot={false} activeDot={{ r: 4, strokeWidth: 2, fill: '#1e293b' }} strokeDasharray="6 3" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-2">
          {isPY ? (
            <>
              <span className="text-[10px] text-slate-600">Post-French era 1964</span>
              <span className="text-[10px] text-slate-600">→</span>
              <span className="text-[10px] text-slate-600">Congress dominance</span>
              <span className="text-[10px] text-slate-600">→</span>
              <span className="text-[10px] text-slate-600">AINRC emerges 2011</span>
              <span className="text-[10px] text-slate-600">→</span>
              <span className="text-[10px] text-slate-600">Multi-party competition</span>
            </>
          ) : (
            <>
              <span className="text-[10px] text-slate-600">Congress era 1952–62</span>
              <span className="text-[10px] text-slate-600">→</span>
              <span className="text-[10px] text-slate-600">DMK rises 1967</span>
              <span className="text-[10px] text-slate-600">→</span>
              <span className="text-[10px] text-slate-600">AIADMK emerges 1977</span>
              <span className="text-[10px] text-slate-600">→</span>
              <span className="text-[10px] text-slate-600">Dravidian duopoly</span>
            </>
          )}
        </div>
      </div>

      {/* Alliance Results — modern cards */}
      <div className="glass-card rounded-2xl p-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">{is2026 ? `Alliance Seat-Sharing – ${year}` : `Alliance Results – ${year}`}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(summary.allianceResults).map(([alliance, data], idx) => {
            const accentColors = ['#e11d48', '#16a34a', '#f59e0b', '#3b82f6'];
            const accent = accentColors[idx % accentColors.length];
            return (
              <div key={alliance} className="relative glass rounded-xl p-5 overflow-hidden group hover:border-white/[0.08] transition-all duration-300">
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
                      width: `${(data.seats / config.totalSeats) * 100}%`,
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
      {/* Engagement Section */}
      <div className="grid md:grid-cols-2 gap-4">
        <CommunityPoll />
        <ElectionQuiz />
      </div>

      <ShareBar title={`${config.name} Election Dashboard — India's most comprehensive ${config.name} election analytics`} />

      {/* Data Source Disclaimer */}
      <div className="glass rounded-xl p-4">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          <strong className="text-slate-400">Data Sources:</strong> Election results & voter data from{' '}
          <a href="https://www.eci.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-500/70 hover:text-amber-400">Election Commission of India</a> &{' '}
          <a href={config.electionCommissionURL} target="_blank" rel="noopener noreferrer" className="text-amber-500/70 hover:text-amber-400">{config.electionCommissionName}</a>.
          Criminal records & asset data from candidate self-sworn affidavits via{' '}
          <a href="https://myneta.info" target="_blank" rel="noopener noreferrer" className="text-amber-500/70 hover:text-amber-400">myneta.info</a>{' '}
          (<a href="https://adrindia.org" target="_blank" rel="noopener noreferrer" className="text-amber-500/70 hover:text-amber-400">ADR</a>).
          Affidavit source: <a href="https://affidavitarchive.nic.in" target="_blank" rel="noopener noreferrer" className="text-amber-500/70 hover:text-amber-400">affidavitarchive.nic.in</a>.
          This platform does not independently verify, investigate, or allege anything — all data is from candidates' own self-declarations. Not affiliated with any political party or government body.
          See our <a href="/terms" className="text-amber-500/70 hover:text-amber-400">Terms of Service</a> for full legal disclaimers.
        </p>
      </div>    </div>
  );
}
