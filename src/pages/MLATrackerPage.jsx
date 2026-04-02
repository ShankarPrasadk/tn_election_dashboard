import { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Award, AlertTriangle, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { PARTY_COLORS } from '../data/electionData';
import { loadCandidateDirectory } from '../data/candidateDirectory';
import ShareBar from '../components/ShareBar';
import ExploreCTA from '../components/ExploreCTA';
import { useI18n } from '../i18n';
import PartyFlag from '../components/PartyFlag';

const PAGE_SIZE = 30;

function normalizeConstituency(name) {
  return (name || '').toLowerCase().replace(/[^a-z]/g, '');
}

function MarginBadge({ marginPercent }) {
  if (!marginPercent) return null;
  const isClose = marginPercent < 3;
  const isComfortable = marginPercent > 10;
  const color = isClose ? 'text-red-400 bg-red-500/10' : isComfortable ? 'text-green-400 bg-green-500/10' : 'text-amber-400 bg-amber-500/10';
  const label = isClose ? 'Close Win' : isComfortable ? 'Comfortable' : 'Moderate';
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${color}`}>
      {label} ({marginPercent.toFixed(1)}%)
    </span>
  );
}

export default function MLATrackerPage() {
  const [search, setSearch] = useState('');
  const [partyFilter, setPartyFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [sortBy, setSortBy] = useState('constituency');
  const [expandedMLA, setExpandedMLA] = useState(null);
  const [page, setPage] = useState(1);
  const [mlas, setMlas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [electionResp, directory] = await Promise.all([
          fetch('/data/elections-2021.json').then(r => r.json()),
          loadCandidateDirectory(),
        ]);

        const dirWinners = (directory.entries || []).filter(e => e.year === 2021 && e.status === 'Won');

        const winners = [];
        for (const [cid, c] of Object.entries(electionResp.constituencies)) {
          const winner = c.candidates.find(x => x.winner);
          if (!winner) continue;

          const constNorm = normalizeConstituency(c.name);
          const dirMatch = dirWinners.find(d => normalizeConstituency(d.constituency) === constNorm);

          winners.push({
            cid: Number(cid),
            name: winner.name,
            party: winner.party,
            constituency: c.name,
            district: c.district,
            type: c.type,
            votes: winner.votes,
            voteShare: winner.vote_share,
            margin: winner.margin,
            marginPercent: winner.margin_percent,
            totalVotes: c.total_votes,
            turnout: c.turnout_percent,
            electors: c.electors,
            numCandidates: c.num_candidates || c.candidates.length,
            age: winner.age,
            sex: winner.sex,
            education: winner.myneta_education || dirMatch?.education || '',
            incumbent: winner.incumbent,
            terms: winner.terms || 1,
            criminalCases: dirMatch?.criminalCases || 0,
            assetsCrores: dirMatch?.assetsCrores || 0,
            liabilitiesCrores: dirMatch?.liabilitiesCrores || 0,
            selfProfession: dirMatch?.selfProfession || '',
            source: dirMatch?.source || null,
          });
        }

        if (active) {
          setMlas(winners.sort((a, b) => a.cid - b.cid));
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => { active = false; };
  }, []);

  const stats = useMemo(() => {
    if (!mlas.length) return null;
    const withCases = mlas.filter(m => m.criminalCases > 0);
    const withAssets = mlas.filter(m => m.assetsCrores > 0);
    const avgAssets = withAssets.length > 0 ? (withAssets.reduce((s, m) => s + m.assetsCrores, 0) / withAssets.length) : 0;
    const incumbents = mlas.filter(m => m.incumbent);
    const female = mlas.filter(m => m.sex === 'F');
    const avgMargin = mlas.reduce((s, m) => s + (m.marginPercent || 0), 0) / mlas.length;

    const partySeats = {};
    mlas.forEach(m => { partySeats[m.party] = (partySeats[m.party] || 0) + 1; });
    const partyBreakdown = Object.entries(partySeats)
      .map(([party, seats]) => ({ party, seats, color: PARTY_COLORS[party] || PARTY_COLORS[party === 'ADMK' ? 'AIADMK' : party] || '#6b7280' }))
      .sort((a, b) => b.seats - a.seats);

    const eduMap = {};
    mlas.forEach(m => {
      const edu = (m.education || 'Unknown').replace(/\s+/g, ' ').trim();
      eduMap[edu] = (eduMap[edu] || 0) + 1;
    });
    const eduBreakdown = Object.entries(eduMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

    return {
      total: mlas.length,
      withCases: withCases.length,
      avgAssets: avgAssets.toFixed(1),
      incumbents: incumbents.length,
      female: female.length,
      avgMargin: avgMargin.toFixed(1),
      partyBreakdown,
      eduBreakdown,
    };
  }, [mlas]);

  const districts = useMemo(() => {
    const d = new Set(mlas.map(m => m.district));
    return ['All', ...Array.from(d).sort()];
  }, [mlas]);

  const parties = useMemo(() => {
    const p = new Set(mlas.map(m => m.party));
    return ['All', ...Array.from(p).sort()];
  }, [mlas]);

  const filtered = useMemo(() => {
    let list = mlas;
    if (partyFilter !== 'All') list = list.filter(m => m.party === partyFilter);
    if (districtFilter !== 'All') list = list.filter(m => m.district === districtFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.constituency.toLowerCase().includes(q) ||
        m.district.toLowerCase().includes(q) ||
        m.party.toLowerCase().includes(q)
      );
    }
    list = [...list];
    if (sortBy === 'constituency') list.sort((a, b) => a.cid - b.cid);
    else if (sortBy === 'margin') list.sort((a, b) => (a.marginPercent || 0) - (b.marginPercent || 0));
    else if (sortBy === 'assets') list.sort((a, b) => b.assetsCrores - a.assetsCrores);
    else if (sortBy === 'criminal') list.sort((a, b) => b.criminalCases - a.criminalCases);
    else if (sortBy === 'votes') list.sort((a, b) => b.votes - a.votes);
    else if (sortBy === 'voteShare') list.sort((a, b) => b.voteShare - a.voteShare);
    return list;
  }, [mlas, partyFilter, districtFilter, search, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, partyFilter, districtFilter, sortBy]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Award className="text-amber-400" /> {t('mla.title')}
          </h1>
          <p className="text-sm text-slate-400 mt-1">{t('mla.subtitle')}</p>
        </div>
        <div className="text-center py-16 text-slate-400">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Award className="text-amber-400" /> {t('mla.title')}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          All 234 MLAs elected in the 2021 Tamil Nadu Legislative Assembly Election — party, margin, assets, criminal records
        </p>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xl font-bold text-white">{stats.total}</p>
            <p className="text-[10px] text-slate-400">MLAs Elected</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xl font-bold text-red-400">{stats.withCases}</p>
            <p className="text-[10px] text-slate-400">With Criminal Cases</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xl font-bold text-amber-400">₹{stats.avgAssets} Cr</p>
            <p className="text-[10px] text-slate-400">Avg Assets</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xl font-bold text-blue-400">{stats.incumbents}</p>
            <p className="text-[10px] text-slate-400">Re-elected</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xl font-bold text-purple-400">{stats.female}</p>
            <p className="text-[10px] text-slate-400">Women MLAs</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xl font-bold text-green-400">{stats.avgMargin}%</p>
            <p className="text-[10px] text-slate-400">Avg Victory Margin</p>
          </div>
        </div>
      )}

      {/* Charts Row */}
      {stats && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <h3 className="text-sm font-semibold text-white mb-3">Seats Won by Party — 2021</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.partyBreakdown} layout="vertical">
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis type="category" dataKey="party" tick={{ fill: '#94a3b8', fontSize: 10 }} width={50} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="seats" radius={[0, 4, 4, 0]}>
                  {stats.partyBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <h3 className="text-sm font-semibold text-white mb-3">MLA Education Profile</h3>
            <div className="space-y-2">
              {stats.eduBreakdown.map(([edu, count]) => (
                <div key={edu} className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 truncate flex-1 mr-2">{edu || 'Unknown'}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-28 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500/70 rounded-full" style={{ width: `${(count / 234) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-500 w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
          <input
            type="text"
            placeholder={t('mla.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <select value={partyFilter} onChange={(e) => setPartyFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none">
          {parties.map(p => <option key={p} value={p}>{p === 'All' ? 'All Parties' : p}</option>)}
        </select>
        <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none">
          {districts.map(d => <option key={d} value={d}>{d === 'All' ? 'All Districts' : d}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none">
          <option value="constituency">Sort: Constituency #</option>
          <option value="margin">Sort: Closest Margin</option>
          <option value="votes">Sort: Most Votes</option>
          <option value="voteShare">Sort: Vote Share</option>
          <option value="assets">Sort: Highest Assets</option>
          <option value="criminal">Sort: Criminal Cases</option>
        </select>
      </div>

      <p className="text-xs text-slate-500">
        Showing {paginated.length} of {filtered.length} MLAs
        {partyFilter !== 'All' && ` · ${partyFilter}`}
        {districtFilter !== 'All' && ` · ${districtFilter}`}
      </p>

      {/* MLA Cards */}
      <div className="space-y-2">
        {paginated.map((mla) => (
          <div key={mla.cid} className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-colors">
            <button
              onClick={() => setExpandedMLA(expandedMLA === mla.cid ? null : mla.cid)}
              className="w-full p-3 sm:p-4 text-left"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-[10px] text-slate-500 font-mono w-6 text-right flex-shrink-0">#{mla.cid}</div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: PARTY_COLORS[mla.party] || PARTY_COLORS[mla.party === 'ADMK' ? 'AIADMK' : mla.party] || '#6b7280' }}>
                    <PartyFlag party={mla.party === 'ADMK' ? 'AIADMK' : mla.party} size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{mla.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {mla.party === 'ADMK' ? 'AIADMK' : mla.party} · {mla.constituency}
                      {mla.type !== 'GEN' && <span className="ml-1 px-1 py-0 bg-blue-500/20 text-blue-400 rounded text-[8px]">{mla.type}</span>}
                      {' · '}{mla.district}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                  <MarginBadge marginPercent={mla.marginPercent} />
                  {mla.criminalCases > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-red-400 bg-red-500/10">
                      {mla.criminalCases} cases
                    </span>
                  )}
                  {mla.assetsCrores > 0 && (
                    <span className="text-[10px] text-slate-400">₹{mla.assetsCrores} Cr</span>
                  )}
                </div>
                {expandedMLA === mla.cid ? <ChevronUp size={16} className="text-slate-500 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-500 flex-shrink-0" />}
              </div>
            </button>

            {expandedMLA === mla.cid && (
              <div className="px-4 pb-4 border-t border-slate-700/30 pt-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div className="bg-slate-700/20 rounded-lg p-2.5">
                    <p className="text-[10px] text-slate-500 mb-0.5">Votes Won</p>
                    <p className="text-sm font-bold text-white">{mla.votes?.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500">{mla.voteShare}% vote share</p>
                  </div>
                  <div className="bg-slate-700/20 rounded-lg p-2.5">
                    <p className="text-[10px] text-slate-500 mb-0.5">Victory Margin</p>
                    <p className="text-sm font-bold text-white">{mla.margin?.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500">{mla.marginPercent?.toFixed(1)}% margin</p>
                  </div>
                  <div className="bg-slate-700/20 rounded-lg p-2.5">
                    <p className="text-[10px] text-slate-500 mb-0.5">Criminal Cases</p>
                    <p className={`text-sm font-bold ${mla.criminalCases > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {mla.criminalCases > 0 ? mla.criminalCases : 'None'}
                    </p>
                    <p className="text-[10px] text-slate-500">from affidavit</p>
                  </div>
                  <div className="bg-slate-700/20 rounded-lg p-2.5">
                    <p className="text-[10px] text-slate-500 mb-0.5">Declared Assets</p>
                    <p className="text-sm font-bold text-amber-400">
                      {mla.assetsCrores > 0 ? `₹${mla.assetsCrores} Cr` : '—'}
                    </p>
                    {mla.liabilitiesCrores > 0 && (
                      <p className="text-[10px] text-slate-500">Liabilities: ₹{mla.liabilitiesCrores} Cr</p>
                    )}
                  </div>
                  <div className="bg-slate-700/20 rounded-lg p-2.5">
                    <p className="text-[10px] text-slate-500 mb-0.5">Profile</p>
                    <p className="text-[11px] text-slate-300">{mla.education || '—'}</p>
                    <p className="text-[10px] text-slate-500">
                      Age: {mla.age || '—'} · {mla.sex === 'F' ? 'Female' : 'Male'}
                      {mla.incumbent && ' · Re-elected'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-slate-500">
                  <span>Turnout: <strong className="text-slate-400">{mla.turnout}%</strong></span>
                  <span>Total votes: <strong className="text-slate-400">{mla.totalVotes?.toLocaleString()}</strong></span>
                  <span>Electors: <strong className="text-slate-400">{mla.electors?.toLocaleString()}</strong></span>
                  <span>Candidates: <strong className="text-slate-400">{mla.numCandidates}</strong></span>
                  {mla.terms > 1 && <span>Terms: <strong className="text-slate-400">{mla.terms}</strong></span>}
                  {mla.selfProfession && <span>Profession: <strong className="text-slate-400">{mla.selfProfession}</strong></span>}
                </div>
                {mla.source?.detailUrl && (
                  <a href={mla.source.detailUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-block mt-2 text-[10px] text-amber-400 hover:text-amber-300 underline">
                    View full affidavit on myneta.info →
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">{t('mla.noResults')}</div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
            className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs disabled:opacity-30 hover:bg-slate-700">Previous</button>
          <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs disabled:opacity-30 hover:bg-slate-700">Next</button>
        </div>
      )}

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
        <p className="text-xs text-slate-400">
          <AlertTriangle size={12} className="inline text-amber-400 mr-1" />
          All MLA data is from the 2021 Tamil Nadu Legislative Assembly Election results (ECI) and candidate affidavits filed with the Election Commission (via myneta.info/ADR).
          Criminal cases are self-declared pending allegations — not proven convictions. Asset figures are declared values from election affidavits. Every person is presumed innocent until proven guilty.
        </p>
      </div>

      <ShareBar title="MLA Tracker — All 234 Tamil Nadu MLAs (2021)" />
      <ExploreCTA exclude={['/mla-tracker']} maxItems={4} title="More Election Data" />
    </div>
  );
}
