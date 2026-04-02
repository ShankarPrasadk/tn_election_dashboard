import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Award, ThumbsUp, ThumbsDown, AlertTriangle, TrendingUp, Search } from 'lucide-react';
import { KEY_CANDIDATES } from '../data/electionData';
import { PARTY_COLORS } from '../data/electionData';
import ShareBar from '../components/ShareBar';
import ExploreCTA from '../components/ExploreCTA';
import { useI18n } from '../i18n';

// Derive MLA data from KEY_CANDIDATES (those who won in 2021)
function deriveMLAData() {
  return KEY_CANDIDATES.filter((c) => c.elections?.['2021']?.won || c.elections?.['2016']?.won).map((c) => {
    const latestYear = c.elections?.['2021']?.won ? 2021 : 2016;
    const assets = c.assets || {};
    const assetYears = Object.keys(assets).map(Number).sort();
    const latestAsset = assets[assetYears[assetYears.length - 1]] || 0;
    const prevAsset = assets[assetYears[assetYears.length - 2]] || latestAsset;
    const assetGrowth = prevAsset > 0 ? Math.round(((latestAsset - prevAsset) / prevAsset) * 100) : 0;

    const crimes = c.criminalCases?.total || 0;
    const goodCount = (c.goodDeeds || []).length;
    const badCount = (c.badDeeds || []).length;
    const devCount = (c.development || []).length;
    const corruptCount = (c.corruption || []).length;

    // Score out of 100
    const performanceScore = Math.min(100, Math.max(0,
      50 + (goodCount * 8) + (devCount * 6) - (badCount * 10) - (crimes * 12) - (corruptCount * 15)
    ));

    return {
      id: c.id,
      name: c.name,
      party: c.party,
      constituency: c.constituency,
      winYear: latestYear,
      assets: latestAsset,
      assetGrowth,
      criminalCases: crimes,
      goodDeeds: c.goodDeeds || [],
      badDeeds: c.badDeeds || [],
      development: c.development || [],
      corruption: c.corruption || [],
      education: c.education,
      performanceScore,
      elections: c.elections,
    };
  });
}

function ScoreBadge({ score }) {
  const color = score >= 70 ? 'text-green-400' : score >= 40 ? 'text-amber-400' : 'text-red-400';
  const bg = score >= 70 ? 'bg-green-500/10' : score >= 40 ? 'bg-amber-500/10' : 'bg-red-500/10';
  const label = score >= 70 ? 'Good' : score >= 40 ? 'Average' : 'Poor';
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${color} ${bg}`}>
      {score}/100 · {label}
    </span>
  );
}

export default function MLATrackerPage() {
  const [search, setSearch] = useState('');
  const [partyFilter, setPartyFilter] = useState('All');
  const [sortBy, setSortBy] = useState('score');
  const [selectedMLA, setSelectedMLA] = useState(null);
  const { t } = useI18n();

  const mlas = useMemo(() => deriveMLAData(), []);

  const parties = useMemo(() => ['All', ...new Set(mlas.map((m) => m.party))], [mlas]);

  const filtered = useMemo(() => {
    let list = mlas;
    if (partyFilter !== 'All') list = list.filter((m) => m.party === partyFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((m) =>
        m.name.toLowerCase().includes(q) || m.constituency?.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'score') list = [...list].sort((a, b) => b.performanceScore - a.performanceScore);
    else if (sortBy === 'assets') list = [...list].sort((a, b) => b.assets - a.assets);
    else if (sortBy === 'criminal') list = [...list].sort((a, b) => b.criminalCases - a.criminalCases);
    return list;
  }, [mlas, partyFilter, search, sortBy]);

  const avgScore = mlas.length ? Math.round(mlas.reduce((s, m) => s + m.performanceScore, 0) / mlas.length) : 0;
  const withCases = mlas.filter((m) => m.criminalCases > 0).length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Award className="text-amber-400" /> {t('mla.title')}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {t('mla.subtitle')}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <p className="text-2xl font-bold text-white">{mlas.length}</p>
          <p className="text-[10px] text-slate-400">{t('mla.tracked')}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <p className="text-2xl font-bold text-amber-400">{avgScore}/100</p>
          <p className="text-[10px] text-slate-400">{t('mla.avgPerformance')}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <p className="text-2xl font-bold text-red-400">{withCases}</p>
          <p className="text-[10px] text-slate-400">With Criminal Cases</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <p className="text-2xl font-bold text-green-400">{mlas.filter((m) => m.performanceScore >= 70).length}</p>
          <p className="text-[10px] text-slate-400">Rated "Good"</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search MLA or constituency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <select value={partyFilter} onChange={(e) => setPartyFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none">
          {parties.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none">
          <option value="score">Sort: Performance</option>
          <option value="assets">Sort: Assets</option>
          <option value="criminal">Sort: Criminal Cases</option>
        </select>
      </div>

      {/* MLA Cards */}
      <div className="space-y-3">
        {filtered.map((mla) => (
          <div key={mla.id} className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
            <button
              onClick={() => setSelectedMLA(selectedMLA === mla.id ? null : mla.id)}
              className="w-full p-4 text-left hover:bg-slate-700/20 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: PARTY_COLORS[mla.party] || '#6b7280' }}>
                    {mla.party.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{mla.name}</p>
                    <p className="text-[10px] text-slate-400">{mla.party} · {mla.constituency} · Won {mla.winYear}</p>
                  </div>
                </div>
                <ScoreBadge score={mla.performanceScore} />
              </div>
            </button>

            {selectedMLA === mla.id && (
              <div className="px-4 pb-4 border-t border-slate-700/30 pt-3">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Good Deeds */}
                  {mla.goodDeeds.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-1"><ThumbsUp size={12} /> Achievements</h4>
                      <ul className="space-y-1">
                        {mla.goodDeeds.map((d, i) => (
                          <li key={i} className="text-[10px] text-slate-400 flex items-start gap-1">
                            <span className="text-green-400 mt-0.5">✓</span> {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Concerns */}
                  {(mla.badDeeds.length > 0 || mla.corruption.length > 0) && (
                    <div>
                      <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1"><ThumbsDown size={12} /> Concerns</h4>
                      <ul className="space-y-1">
                        {mla.badDeeds.map((d, i) => (
                          <li key={i} className="text-[10px] text-slate-400 flex items-start gap-1">
                            <span className="text-red-400 mt-0.5">✗</span> {d}
                          </li>
                        ))}
                        {mla.corruption.map((c, i) => (
                          <li key={`c-${i}`} className="text-[10px] text-slate-400 flex items-start gap-1">
                            <span className="text-red-400 mt-0.5">✗</span> {c.title} ({c.amount})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {/* Development */}
                {mla.development.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-1"><TrendingUp size={12} /> Development Initiatives</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {mla.development.map((d, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded-full">{d}</span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Stats row */}
                <div className="flex gap-4 mt-3 text-[10px]">
                  <span className="text-slate-400">Assets: <strong className="text-white">₹{mla.assets} Cr</strong></span>
                  {mla.assetGrowth !== 0 && (
                    <span className={mla.assetGrowth > 50 ? 'text-red-400' : 'text-slate-400'}>
                      Growth: <strong>{mla.assetGrowth > 0 ? '+' : ''}{mla.assetGrowth}%</strong>
                    </span>
                  )}
                  <span className="text-slate-400">Criminal Cases: <strong className={mla.criminalCases > 0 ? 'text-red-400' : 'text-green-400'}>{mla.criminalCases}</strong></span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">No MLAs found matching your criteria</div>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
        <p className="text-xs text-slate-400">
          <AlertTriangle size={12} className="inline text-amber-400 mr-1" />
          Performance scores are computed from publicly available data (development initiatives, criminal cases, corruption allegations, asset growth).
          Scores are indicative and should not be treated as definitive assessments. All data is sourced from official affidavits and public records.
        </p>
      </div>

      <ShareBar title="MLA Performance Tracker — TN Election Dashboard" />
      <ExploreCTA exclude={['/mla-tracker']} maxItems={4} title="More Election Data" />
    </div>
  );
}
