import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { ELECTION_SUMMARY, PARTY_COLORS } from '../data/electionData';

/**
 * Swing Analysis: Shows margin of victory changes between elections
 * Used in ConstituencyPage and TrendsPage
 */

export function computeSwingData() {
  const years = [2006, 2011, 2016, 2021];
  const swings = [];

  for (let i = 1; i < years.length; i++) {
    const prev = ELECTION_SUMMARY[years[i - 1]];
    const curr = ELECTION_SUMMARY[years[i]];
    if (!prev || !curr) continue;

    const parties = new Set([...Object.keys(prev.results), ...Object.keys(curr.results)]);
    const partySwings = [];
    for (const party of parties) {
      if (['IND', 'Others'].includes(party)) continue;
      const prevShare = prev.results[party]?.voteShare || 0;
      const currShare = curr.results[party]?.voteShare || 0;
      const swing = Math.round((currShare - prevShare) * 10) / 10;
      if (Math.abs(swing) > 0.3) {
        partySwings.push({ party, swing, prevShare, currShare });
      }
    }
    partySwings.sort((a, b) => b.swing - a.swing);
    swings.push({ from: years[i - 1], to: years[i], partySwings });
  }

  return swings;
}

export function SwingChart({ from, to, partySwings }) {
  const data = partySwings.map((p) => ({
    name: p.party,
    swing: p.swing,
    color: PARTY_COLORS[p.party] || '#6b7280',
  }));

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <h4 className="text-xs font-semibold text-white mb-2">{from} → {to} Vote Swing (%)</h4>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={24} layout="vertical">
          <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} domain={['dataMin - 2', 'dataMax + 2']} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={60} />
          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
            formatter={(v) => `${v > 0 ? '+' : ''}${v}%`} />
          <ReferenceLine x={0} stroke="#475569" />
          <Bar dataKey="swing" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.swing >= 0 ? d.color : '#ef4444'} opacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function SwingAnalysis() {
  const swings = useMemo(() => computeSwingData(), []);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Vote Swing Analysis</h3>
      <p className="text-[10px] text-slate-400">
        How vote shares shifted between elections — positive means gained, negative means lost
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        {swings.map((s) => (
          <SwingChart key={`${s.from}-${s.to}`} from={s.from} to={s.to} partySwings={s.partySwings} />
        ))}
      </div>
    </div>
  );
}
