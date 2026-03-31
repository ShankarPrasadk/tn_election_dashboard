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
import { CANDIDATES_2026, ELECTION_SCHEDULE_2026, VOTER_STATS_2026 } from '../data/candidates2026';
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
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
      <p className="text-sm font-medium text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
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
  const totalCandidates2026 = liveStats?.totalCandidates || 0;
  const announcedCandidates2026 = is2026 ? totalCandidates2026 : CANDIDATES_2026.reduce((count, seat) => count + Object.values(seat.candidates).filter((name) => name && name !== 'TBD').length, 0);

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
          title={is2026 ? 'Criminal Records' : 'Criminal Records'}
          value={criminal ? `${criminal.percentWithCases}%` : 'Loading…'}
          subtitle={criminal ? `${criminal.withCriminalCases} of ${criminal.totalCandidatesAnalyzed} candidates` : 'Fetching affidavit data…'}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title={is2026 ? 'Avg Assets' : 'Avg Assets (Winners)'}
          value={assets ? `₹${assets.avgAssets} Cr` : is2026 ? 'Loading…' : 'TBD'}
          subtitle={is2026 ? (assets ? `Richest: ₹${assets.richest} Cr • ${assets.medianAssets} Cr median` : 'Fetching affidavit data…') : (assets ? `Richest: ₹${assets.richest} Cr` : '')}
          icon={Banknote}
          color="green"
        />
        <StatCard
          title={is2026 ? 'Total Candidates' : 'Total Candidates'}
          value={is2026 ? announcedCandidates2026.toLocaleString() : summary.totalCandidates ? summary.totalCandidates.toLocaleString() : '4500+'}
          subtitle={is2026 ? `From ECI affidavit portal • ${VOTER_STATS_2026.totalVoters ? (VOTER_STATS_2026.totalVoters / 10000000).toFixed(2) + ' Cr voters' : ''}` : `${summary.turnoutPercent}% voter turnout`}
          icon={Vote}
          color="blue"
        />
      </div>

      {/* Ad Banner */}
      <AdBanner variant="banner" />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Party Seats */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <SectionHeader title={is2026 ? 'Constituencies Announced By Party' : 'Seats Won by Party'} />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={partyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="party" width={70} tick={{ fontSize: 11 }} />
              <Tooltip content={CUSTOM_TOOLTIP} />
              <Bar dataKey="seats" radius={[0, 4, 4, 0]}>
                {partyData.map((entry) => (
                  <Cell key={entry.party} fill={PARTY_COLORS[entry.party] || PARTY_COLORS.Others} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Seat Distribution Pie */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <SectionHeader title={is2026 ? 'Contest Coverage Snapshot' : 'Seat Distribution'} />
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="seats"
                nameKey="party"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ party, seats }) => `${party} (${seats})`}
                labelLine={true}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.party} fill={PARTY_COLORS[entry.party] || PARTY_COLORS.Others} />
                ))}
              </Pie>
              <Tooltip />
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
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <SectionHeader title={is2026 ? 'Education of Candidates' : 'Education of Elected MLAs'} />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={is2026 ? liveEducation : EDUCATION_DATA[year]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip content={CUSTOM_TOOLTIP} />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name={is2026 ? 'Candidates' : 'MLAs'} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Age Demographics */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <SectionHeader title={is2026 ? 'Age Demographics of Candidates' : 'Age Demographics of MLAs'} />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={is2026 ? liveAge : AGE_DATA[year]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" />
              <YAxis />
              <Tooltip content={CUSTOM_TOOLTIP} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name={is2026 ? 'Candidates' : 'MLAs'} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}

      {/* Historical Trends Quick Glance — full 1952–2021 */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Vote Share Trend (1952–2021)" subtitle="74 years of electoral history" />
          <Link to="/trends" className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <TrendingUp className="w-3 h-3" /> Full Trends <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={HISTORICAL_VOTE_SHARE}>
            <defs>
              <linearGradient id="dashGradDMK" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={PARTY_COLORS.DMK} stopOpacity={0.3} />
                <stop offset="95%" stopColor={PARTY_COLORS.DMK} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dashGradAIADMK" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={PARTY_COLORS.AIADMK} stopOpacity={0.3} />
                <stop offset="95%" stopColor={PARTY_COLORS.AIADMK} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dashGradINC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={PARTY_COLORS.INC} stopOpacity={0.3} />
                <stop offset="95%" stopColor={PARTY_COLORS.INC} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis unit="%" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <Tooltip content={CUSTOM_TOOLTIP} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="INC" stroke={PARTY_COLORS.INC} fill="url(#dashGradINC)" strokeWidth={2} name="Congress" dot={{ r: 3 }} />
            <Area type="monotone" dataKey="DMK" stroke={PARTY_COLORS.DMK} fill="url(#dashGradDMK)" strokeWidth={2.5} name="DMK" dot={{ r: 3 }} />
            <Area type="monotone" dataKey="AIADMK" stroke={PARTY_COLORS.AIADMK} fill="url(#dashGradAIADMK)" strokeWidth={2.5} name="AIADMK" dot={{ r: 3 }} />
            <Area type="monotone" dataKey="BJP" stroke={PARTY_COLORS.BJP} fill="none" strokeWidth={1.5} name="BJP" dot={{ r: 2 }} strokeDasharray="5 3" />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-[10px] text-slate-500 text-center mt-2">Congress dominant 1952–1962 → DMK wins 1967 → AIADMK emerges 1977 → Two-party Dravidian era begins</p>
      </div>

      {/* Alliance Results */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <SectionHeader title={is2026 ? `Alliance Seat-Sharing Snapshot – ${year}` : `Alliance Results – ${year}`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(summary.allianceResults).map(([alliance, data]) => (
            <div key={alliance} className="bg-slate-900/50 rounded-lg p-5 border border-slate-700/30">
              <h3 className="text-lg font-semibold text-white mb-2">{alliance}</h3>
              <p className="text-3xl font-bold text-amber-400 mb-3">{data.seats} seats</p>
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
