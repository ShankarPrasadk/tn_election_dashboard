import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend, AreaChart, Area, ComposedChart
} from 'recharts';
import { SectionHeader } from '../components/UIComponents';
import { VOTE_SHARE_TREND, SEATS_TREND, PARTY_COLORS, ELECTION_SUMMARY, CRIMINAL_STATS, ASSET_STATS } from '../data/electionData';
import PartySymbolIcon from '../components/PartySymbolIcon';

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
      <p className="text-sm font-medium text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.color || p.stroke }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function TrendsPage() {
  const turnoutData = Object.entries(ELECTION_SUMMARY)
    .filter(([, d]) => d.status !== 'upcoming')
    .map(([yr, d]) => ({
      year: Number(yr),
      turnout: d.turnoutPercent,
      voters: (d.totalVoters / 1000000).toFixed(1),
      candidates: d.totalCandidates,
    }));

  const criminalTrend = Object.entries(CRIMINAL_STATS).map(([yr, d]) => ({
    year: Number(yr),
    'Candidates with Cases (%)': d.percentWithCases,
    'Serious Cases (%)': d.percentSerious,
    'Avg Cases per Candidate': d.avgCases,
  }));

  const assetTrend = Object.entries(ASSET_STATS).map(([yr, d]) => ({
    year: Number(yr),
    'Average Assets (₹ Cr)': d.avgAssets,
    'Median Assets (₹ Cr)': d.medianAssets,
    'Richest (₹ Cr)': d.richest,
  }));

  const cmTimeline = [
    { period: '2006–2011', cm: 'M. Karunanidhi', party: 'DMK', color: PARTY_COLORS.DMK },
    { period: '2011–2016', cm: 'J. Jayalalithaa', party: 'AIADMK', color: PARTY_COLORS.AIADMK },
    { period: '2016–2021', cm: 'Jayalalithaa / EPS', party: 'AIADMK', color: PARTY_COLORS.AIADMK },
    { period: '2021–2026', cm: 'M.K. Stalin', party: 'DMK', color: PARTY_COLORS.DMK },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Historical Trends</h1>
        <p className="text-slate-400 mt-1">20 years of Tamil Nadu electoral trends (2006–2021)</p>
      </div>

      {/* CM Timeline */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <SectionHeader title="Chief Ministers Timeline" />
        <div className="flex flex-col sm:flex-row gap-4">
          {cmTimeline.map((cm, i) => (
            <div
              key={i}
              className="flex-1 rounded-lg p-4 border-l-4"
              style={{ borderColor: cm.color, backgroundColor: `${cm.color}08` }}
            >
              <p className="text-xs text-slate-400">{cm.period}</p>
              <p className="text-lg font-bold text-white mt-1">{cm.cm}</p>
              <p className="text-sm mt-1 flex items-center gap-1" style={{ color: cm.color }}><PartySymbolIcon party={cm.party} size={16} color={cm.color} /> {cm.party}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Vote Share Trend */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <SectionHeader title="Vote Share Trend (%)" subtitle="How party vote shares have changed over elections" />
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={VOTE_SHARE_TREND.filter(d => d.DMK !== null)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis unit="%" />
            <Tooltip content={CUSTOM_TOOLTIP} />
            <Legend />
            <Line type="monotone" dataKey="DMK" stroke={PARTY_COLORS.DMK} strokeWidth={3} dot={{ r: 6 }} />
            <Line type="monotone" dataKey="AIADMK" stroke={PARTY_COLORS.AIADMK} strokeWidth={3} dot={{ r: 6 }} />
            <Line type="monotone" dataKey="INC" stroke={PARTY_COLORS.INC} strokeWidth={2} dot={{ r: 5 }} />
            <Line type="monotone" dataKey="BJP" stroke={PARTY_COLORS.BJP} strokeWidth={2} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Seats Trend */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <SectionHeader title="Seats Won Trend" subtitle="Number of seats won by major parties" />
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={SEATS_TREND.filter(d => d.DMK !== null)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip content={CUSTOM_TOOLTIP} />
            <Legend />
            <Bar dataKey="DMK" fill={PARTY_COLORS.DMK} radius={[2, 2, 0, 0]} />
            <Bar dataKey="AIADMK" fill={PARTY_COLORS.AIADMK} radius={[2, 2, 0, 0]} />
            <Bar dataKey="INC" fill={PARTY_COLORS.INC} radius={[2, 2, 0, 0]} />
            <Bar dataKey="BJP" fill={PARTY_COLORS.BJP} radius={[2, 2, 0, 0]} />
            <Bar dataKey="Others" fill={PARTY_COLORS.Others} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Voter Turnout */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <SectionHeader title="Voter Turnout & Participation" />
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={turnoutData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis yAxisId="left" unit="%" />
            <YAxis yAxisId="right" orientation="right" unit="M" />
            <Tooltip content={CUSTOM_TOOLTIP} />
            <Legend />
            <Bar yAxisId="right" dataKey="voters" fill="#3b82f630" stroke="#3b82f6" name="Voters (M)" radius={[4, 4, 0, 0]} />
            <Line yAxisId="left" type="monotone" dataKey="turnout" stroke="#f59e0b" strokeWidth={3} dot={{ r: 6 }} name="Turnout (%)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Criminal Cases Trend */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <SectionHeader
          title="Criminalization of Politics Trend"
          subtitle="Rising percentage of candidates with criminal records"
        />
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={criminalTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip content={CUSTOM_TOOLTIP} />
            <Legend />
            <Area type="monotone" dataKey="Candidates with Cases (%)" stroke="#f59e0b" fill="#f59e0b30" strokeWidth={2} />
            <Area type="monotone" dataKey="Serious Cases (%)" stroke="#ef4444" fill="#ef444430" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Asset Growth Trend */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <SectionHeader title="Wealth of MLAs Trend" subtitle="Average and peak assets of winning candidates" />
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={assetTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis unit="Cr" />
            <Tooltip content={CUSTOM_TOOLTIP} />
            <Legend />
            <Bar dataKey="Richest (₹ Cr)" fill="#22c55e30" stroke="#22c55e" name="Richest MLA (₹ Cr)" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="Average Assets (₹ Cr)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 6 }} />
            <Line type="monotone" dataKey="Median Assets (₹ Cr)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 5 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Key Observations */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <SectionHeader title="Key Observations" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'Anti-Incumbency Pattern',
              desc: 'Tamil Nadu has consistently alternated between DMK and AIADMK alliances since 1967. No ruling party has won consecutive elections.',
              color: '#f59e0b',
            },
            {
              title: 'Rising Criminalization',
              desc: 'The percentage of candidates with criminal cases has risen from 25.3% (2006) to 38.6% (2021), a 52% increase in 15 years.',
              color: '#ef4444',
            },
            {
              title: 'Wealth Explosion',
              desc: 'Average MLA assets grew from ₹3.2 Cr (2006) to ₹12.21 Cr (2021) — a 4x increase in 15 years, far outpacing inflation.',
              color: '#22c55e',
            },
            {
              title: 'Third Front Struggles',
              desc: 'Despite parties like DMDK, NTK, MNM polling significant vote shares, translating to seats remains a challenge in the FPTP system.',
              color: '#3b82f6',
            },
          ].map((obs, i) => (
            <div key={i} className="rounded-lg p-4 border-l-4" style={{ borderColor: obs.color, backgroundColor: `${obs.color}08` }}>
              <h4 className="text-sm font-semibold text-white">{obs.title}</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{obs.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
