import { useState, useEffect, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Search, X } from 'lucide-react';
import { PartyBadge } from '../components/UIComponents';
import { KEY_CANDIDATES, PARTY_COLORS } from '../data/electionData';
import { loadCandidateDirectory } from '../data/candidateDirectory';
import PartySymbolIcon from '../components/PartySymbolIcon';

/* ---- Searchable Candidate Picker ---- */
function CandidatePicker({ label, value, onChange, exclude, candidates }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return candidates
      .filter((c) => c.id !== exclude)
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.party?.toLowerCase().includes(q) || c.constituency?.toLowerCase().includes(q))
      .slice(0, 60);
  }, [query, candidates, exclude]);

  const selected = candidates.find((c) => c.id === value);

  return (
    <div className="flex-1 relative" ref={ref}>
      <label className="text-xs text-slate-400 block mb-1">{label}</label>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 truncate"
      >
        {selected ? `${selected.name} (${selected.party})` : 'Select candidate...'}
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-72 overflow-auto">
          <div className="sticky top-0 p-2 bg-slate-800 border-b border-slate-700/50">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, party, constituency…"
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded pl-8 pr-7 py-1.5 focus:outline-none focus:border-amber-500/50"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => { onChange(c.id); setOpen(false); setQuery(''); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700/50 flex items-center justify-between ${c.id === value ? 'bg-amber-500/10 text-amber-400' : 'text-white'}`}
            >
              <span className="truncate">{c.name}</span>
              <span className="ml-2 flex-shrink-0"><PartyBadge party={c.party} /></span>
            </button>
          ))}
          {filtered.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No results</p>}
        </div>
      )}
    </div>
  );
}

/* ---- Normalize a directory entry to a comparable shape ---- */
function toComparable(entry) {
  // For KEY_CANDIDATES (rich data) – pass through
  if (entry.elections) return entry;

  // For directory entries – extract what we can
  const totalCases = parseInt(entry.criminal_cases_total, 10) || 0;
  const seriousCases = parseInt(entry.criminal_cases_serious, 10) || 0;
  const assetVal = parseFloat(entry.total_assets_cr) || 0;

  return {
    id: entry.id,
    name: entry.candidate_name || entry.name,
    party: entry.party,
    constituency: entry.constituency,
    education: entry.education || 'N/A',
    year: entry.year,
    criminalCases: { total: totalCases, serious: seriousCases },
    assets: entry.year ? { [entry.year]: assetVal } : {},
    elections: {},
    goodDeeds: [],
    badDeeds: [],
    corruption: [],
    development: [],
    _isDirectory: true,
  };
}

export default function ComparisonPage() {
  const [allCandidates, setAllCandidates] = useState([]);
  const [candidate1Id, setCandidate1Id] = useState(null);
  const [candidate2Id, setCandidate2Id] = useState(null);

  useEffect(() => {
    // Merge KEY_CANDIDATES + directory entries (prefer KEY_CANDIDATES for richer data)
    loadCandidateDirectory().then((dir) => {
      const keyMap = new Map(KEY_CANDIDATES.map((k) => [k.id, k]));
      const merged = [...KEY_CANDIDATES];

      (dir?.entries || []).forEach((e) => {
        if (!keyMap.has(e.id)) {
          merged.push({ id: e.id, name: e.candidate_name || e.name, party: e.party, constituency: e.constituency, ...e });
        }
      });

      setAllCandidates(merged);
      if (!candidate1Id && merged.length > 0) setCandidate1Id(merged[0].id);
      if (!candidate2Id && merged.length > 1) setCandidate2Id(merged[1].id);
    }).catch(() => {
      setAllCandidates(KEY_CANDIDATES);
      setCandidate1Id(KEY_CANDIDATES[0]?.id);
      setCandidate2Id(KEY_CANDIDATES[1]?.id);
    });
  }, []);

  const raw1 = allCandidates.find((c) => c.id === candidate1Id);
  const raw2 = allCandidates.find((c) => c.id === candidate2Id);
  const c1 = raw1 ? toComparable(raw1) : null;
  const c2 = raw2 ? toComparable(raw2) : null;

  const bothRich = c1 && c2 && !c1._isDirectory && !c2._isDirectory;

  const commonYears = c1 && c2
    ? Object.keys(c1.assets).filter((yr) => yr in c2.assets)
    : [];

  const assetComparison = c1 && c2 ? commonYears.map((yr) => ({
    year: yr,
    [c1.name]: c1.assets[yr],
    [c2.name]: c2.assets[yr],
  })) : [];

  // Radar comparison (only for rich KEY_CANDIDATES profiles)
  const radarData = bothRich ? (() => {
    const getMax = (fn) => Math.max(...KEY_CANDIDATES.map(fn)) || 1;
    return [
      { subject: 'Wins', [c1.name]: (Object.values(c1.elections).filter((e) => e.won).length / getMax((c) => Object.values(c.elections).filter((e) => e.won).length)) * 100, [c2.name]: (Object.values(c2.elections).filter((e) => e.won).length / getMax((c) => Object.values(c.elections).filter((e) => e.won).length)) * 100 },
      { subject: 'Clean Record', [c1.name]: Math.max(0, 100 - (c1.criminalCases.total / getMax((c) => c.criminalCases.total)) * 100), [c2.name]: Math.max(0, 100 - (c2.criminalCases.total / getMax((c) => c.criminalCases.total)) * 100) },
      { subject: 'Development', [c1.name]: (c1.development.length / getMax((c) => c.development.length)) * 100, [c2.name]: (c2.development.length / getMax((c) => c.development.length)) * 100 },
      { subject: 'Good Deeds', [c1.name]: (c1.goodDeeds.length / 6) * 100, [c2.name]: (c2.goodDeeds.length / 6) * 100 },
      { subject: 'Experience', [c1.name]: (Object.keys(c1.elections).length / getMax((c) => Object.keys(c.elections).length)) * 100, [c2.name]: (Object.keys(c2.elections).length / getMax((c) => Object.keys(c.elections).length)) * 100 },
    ];
  })() : [];

  const CompareRow = ({ label, v1, v2, highlight }) => {
    const better = highlight === 'lower' ? (v1 < v2 ? 1 : v1 > v2 ? 2 : 0) :
                   highlight === 'higher' ? (v1 > v2 ? 1 : v1 < v2 ? 2 : 0) : 0;
    return (
      <div className="grid grid-cols-3 items-center py-3 border-b border-slate-700/30">
        <p className={`text-sm font-medium ${better === 1 ? 'text-green-400' : 'text-slate-300'}`}>{v1}</p>
        <p className="text-xs text-slate-400 text-center">{label}</p>
        <p className={`text-sm font-medium text-right ${better === 2 ? 'text-green-400' : 'text-slate-300'}`}>{v2}</p>
      </div>
    );
  };

  if (!c1 || !c2) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Candidate Comparison</h1>
          <p className="text-slate-400 mt-1">Loading candidates…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Candidate Comparison</h1>
        <p className="text-slate-400 mt-1">Compare any two candidates head-to-head &middot; {allCandidates.length.toLocaleString()} candidates available</p>
      </div>

      {/* Searchable Selectors */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <CandidatePicker label="Candidate 1" value={candidate1Id} onChange={setCandidate1Id} exclude={candidate2Id} candidates={allCandidates} />
        <span className="text-2xl text-slate-500 font-bold pb-2">VS</span>
        <CandidatePicker label="Candidate 2" value={candidate2Id} onChange={setCandidate2Id} exclude={candidate1Id} candidates={allCandidates} />
      </div>

      {/* Head to Head Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[c1, c2].map((c) => (
          <div key={c.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${PARTY_COLORS[c.party] || '#64748b'}20` }}
              >
                <PartySymbolIcon party={c.party} size={28} color={PARTY_COLORS[c.party] || '#64748b'} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{c.name}</h3>
                <PartyBadge party={c.party} />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-slate-400">Constituency: <span className="text-white">{c.constituency}</span></p>
              <p className="text-slate-400">Education: <span className="text-white">{c.education}</span></p>
              {c.year && <p className="text-slate-400">Year: <span className="text-white">{c.year}</span></p>}
              {Object.keys(c.elections).length > 0 && (
                <>
                  <p className="text-slate-400">Elections Contested: <span className="text-white">{Object.keys(c.elections).length}</span></p>
                  <p className="text-slate-400">Elections Won: <span className="text-green-400 font-bold">{Object.values(c.elections).filter((e) => e.won).length}</span></p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Head-to-Head Comparison</h3>
        <CompareRow label="Total Criminal Cases" v1={c1.criminalCases.total} v2={c2.criminalCases.total} highlight="lower" />
        <CompareRow label="Serious Cases" v1={c1.criminalCases.serious} v2={c2.criminalCases.serious} highlight="lower" />
        <CompareRow
          label="Latest Assets (₹ Cr)"
          v1={`₹${Object.keys(c1.assets).length ? c1.assets[Math.max(...Object.keys(c1.assets).map(Number))] : 'N/A'}`}
          v2={`₹${Object.keys(c2.assets).length ? c2.assets[Math.max(...Object.keys(c2.assets).map(Number))] : 'N/A'}`}
        />
        {bothRich && (
          <>
            <CompareRow label="Good Deeds Count" v1={c1.goodDeeds.length} v2={c2.goodDeeds.length} highlight="higher" />
            <CompareRow label="Development Activities" v1={c1.development.length} v2={c2.development.length} highlight="higher" />
            <CompareRow label="Corruption Cases" v1={c1.corruption.length} v2={c2.corruption.length} highlight="lower" />
            <CompareRow label="Controversies" v1={c1.badDeeds.length} v2={c2.badDeeds.length} highlight="lower" />
          </>
        )}
      </div>

      {/* Radar Chart – only for KEY_CANDIDATES profiles */}
      {radarData.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Performance Radar</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar name={c1.name} dataKey={c1.name} stroke={PARTY_COLORS[c1.party]} fill={`${PARTY_COLORS[c1.party]}40`} fillOpacity={0.5} />
              <Radar name={c2.name} dataKey={c2.name} stroke={PARTY_COLORS[c2.party]} fill={`${PARTY_COLORS[c2.party]}40`} fillOpacity={0.5} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Assets Comparison Chart */}
      {assetComparison.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Asset Growth Comparison (₹ Cr)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={assetComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Bar dataKey={c1.name} fill={PARTY_COLORS[c1.party]} radius={[4, 4, 0, 0]} />
              <Bar dataKey={c2.name} fill={PARTY_COLORS[c2.party]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Side by Side: Good vs Bad – only for KEY_CANDIDATES */}
      {bothRich && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[c1, c2].map((c) => (
            <div key={c.id} className="space-y-4">
              <h3 className="text-lg font-bold text-white">{c.name}</h3>
              <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-green-400 mb-2">Good Deeds</h4>
                <ul className="space-y-1">
                  {c.goodDeeds.map((d, i) => (
                    <li key={i} className="text-sm text-slate-300">&bull; {d}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-red-400 mb-2">Controversies</h4>
                <ul className="space-y-1">
                  {c.badDeeds.map((d, i) => (
                    <li key={i} className="text-sm text-slate-300">&bull; {d}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
