import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { PartyBadge } from '../components/UIComponents';
import { KEY_CANDIDATES, PARTY_COLORS } from '../data/electionData';

export default function ComparisonPage() {
  const [candidate1Id, setCandidate1Id] = useState(KEY_CANDIDATES[0]?.id);
  const [candidate2Id, setCandidate2Id] = useState(KEY_CANDIDATES[1]?.id);

  const c1 = KEY_CANDIDATES.find(c => c.id === candidate1Id);
  const c2 = KEY_CANDIDATES.find(c => c.id === candidate2Id);

  const commonYears = c1 && c2
    ? Object.keys(c1.assets).filter(yr => yr in c2.assets)
    : [];

  const assetComparison = commonYears.map(yr => ({
    year: yr,
    [c1.name]: c1.assets[yr],
    [c2.name]: c2.assets[yr],
  }));

  // Radar comparison data
  const getMaxCases = () => Math.max(...KEY_CANDIDATES.map(c => c.criminalCases.total)) || 1;
  const getMaxAssets = () => Math.max(...KEY_CANDIDATES.flatMap(c => Object.values(c.assets))) || 1;
  const getMaxElections = () => Math.max(...KEY_CANDIDATES.map(c => Object.keys(c.elections).length)) || 1;
  const getMaxWins = () => Math.max(...KEY_CANDIDATES.map(c => Object.values(c.elections).filter(e => e.won).length)) || 1;
  const getMaxDev = () => Math.max(...KEY_CANDIDATES.map(c => c.development.length)) || 1;

  const radarData = c1 && c2 ? [
    {
      subject: 'Wins',
      [c1.name]: (Object.values(c1.elections).filter(e => e.won).length / getMaxWins()) * 100,
      [c2.name]: (Object.values(c2.elections).filter(e => e.won).length / getMaxWins()) * 100,
    },
    {
      subject: 'Clean Record',
      [c1.name]: Math.max(0, 100 - (c1.criminalCases.total / getMaxCases()) * 100),
      [c2.name]: Math.max(0, 100 - (c2.criminalCases.total / getMaxCases()) * 100),
    },
    {
      subject: 'Development',
      [c1.name]: (c1.development.length / getMaxDev()) * 100,
      [c2.name]: (c2.development.length / getMaxDev()) * 100,
    },
    {
      subject: 'Good Deeds',
      [c1.name]: (c1.goodDeeds.length / 6) * 100,
      [c2.name]: (c2.goodDeeds.length / 6) * 100,
    },
    {
      subject: 'Experience',
      [c1.name]: (Object.keys(c1.elections).length / getMaxElections()) * 100,
      [c2.name]: (Object.keys(c2.elections).length / getMaxElections()) * 100,
    },
  ] : [];

  const CandidateSelector = ({ value, onChange, label, excludeId }) => (
    <div className="flex-1">
      <label className="text-xs text-slate-400 block mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
      >
        {KEY_CANDIDATES.filter(c => c.id !== excludeId).map(c => (
          <option key={c.id} value={c.id}>{c.name} ({c.party})</option>
        ))}
      </select>
    </div>
  );

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

  if (!c1 || !c2) return <p className="text-slate-400">Select two candidates to compare</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Candidate Comparison</h1>
        <p className="text-slate-400 mt-1">Compare candidates head-to-head across all metrics</p>
      </div>

      {/* Selectors */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <CandidateSelector value={candidate1Id} onChange={setCandidate1Id} label="Candidate 1" excludeId={candidate2Id} />
        <span className="text-2xl text-slate-500 font-bold pb-2">VS</span>
        <CandidateSelector value={candidate2Id} onChange={setCandidate2Id} label="Candidate 2" excludeId={candidate1Id} />
      </div>

      {/* Head to Head Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[c1, c2].map((c, idx) => (
          <div key={c.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                style={{ backgroundColor: `${PARTY_COLORS[c.party]}20`, color: PARTY_COLORS[c.party] }}
              >
                {c.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{c.name}</h3>
                <PartyBadge party={c.party} />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-slate-400">Constituency: <span className="text-white">{c.constituency}</span></p>
              <p className="text-slate-400">Education: <span className="text-white">{c.education}</span></p>
              <p className="text-slate-400">Elections Contested: <span className="text-white">{Object.keys(c.elections).length}</span></p>
              <p className="text-slate-400">Elections Won: <span className="text-green-400 font-bold">{Object.values(c.elections).filter(e => e.won).length}</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Head-to-Head Comparison</h3>
        <CompareRow label="Total Criminal Cases" v1={c1.criminalCases.total} v2={c2.criminalCases.total} highlight="lower" />
        <CompareRow label="Serious Cases" v1={c1.criminalCases.serious} v2={c2.criminalCases.serious} highlight="lower" />
        <CompareRow label="Latest Assets (₹ Cr)" v1={`₹${c1.assets[Math.max(...Object.keys(c1.assets).map(Number))]}`} v2={`₹${c2.assets[Math.max(...Object.keys(c2.assets).map(Number))]}`} />
        <CompareRow label="Good Deeds Count" v1={c1.goodDeeds.length} v2={c2.goodDeeds.length} highlight="higher" />
        <CompareRow label="Development Activities" v1={c1.development.length} v2={c2.development.length} highlight="higher" />
        <CompareRow label="Corruption Cases" v1={c1.corruption.length} v2={c2.corruption.length} highlight="lower" />
        <CompareRow label="Controversies" v1={c1.badDeeds.length} v2={c2.badDeeds.length} highlight="lower" />
      </div>

      {/* Radar Chart */}
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

      {/* Side by Side: Good vs Bad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[c1, c2].map(c => (
          <div key={c.id} className="space-y-4">
            <h3 className="text-lg font-bold text-white">{c.name}</h3>
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-green-400 mb-2">Good Deeds</h4>
              <ul className="space-y-1">
                {c.goodDeeds.map((d, i) => (
                  <li key={i} className="text-sm text-slate-300">• {d}</li>
                ))}
              </ul>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-red-400 mb-2">Controversies</h4>
              <ul className="space-y-1">
                {c.badDeeds.map((d, i) => (
                  <li key={i} className="text-sm text-slate-300">• {d}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
