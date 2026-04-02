import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, ReferenceLine } from 'recharts';
import { TrendingUp, AlertTriangle, BarChart3, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { generateForecast, FORECAST_ALLIANCE_COLORS, FORECAST_ALLIANCE_LABELS } from '../data/forecastModel';
import { OPINION_POLLS_2026 } from '../data/candidates2026';
import ShareBar from '../components/ShareBar';
import ExploreCTA from '../components/ExploreCTA';
import { useI18n } from '../i18n';

function ProbabilityMeter({ label, percent, color }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-300 font-medium">{label}</span>
        <span className="font-bold" style={{ color }}>{percent}%</span>
      </div>
      <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function SeatRangeBar({ alliance, data, color, majorityMark, totalSeats }) {
  const pct = (v) => (v / totalSeats) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-300 font-medium">{FORECAST_ALLIANCE_LABELS[alliance]}</span>
        <span className="font-bold" style={{ color }}>{data.seatMin}–{data.seatMax} seats</span>
      </div>
      <div className="relative h-6 bg-slate-700/50 rounded-lg overflow-hidden">
        {/* Range bar */}
        <div
          className="absolute h-full rounded-lg opacity-30"
          style={{ left: `${pct(data.seatMin)}%`, width: `${pct(data.seatMax - data.seatMin)}%`, backgroundColor: color }}
        />
        {/* Mid-point marker */}
        <div
          className="absolute h-full w-1 rounded"
          style={{ left: `${pct(data.seatMid)}%`, backgroundColor: color }}
        />
        {/* Majority line */}
        <div
          className="absolute h-full w-[1px] border-l border-dashed border-amber-400/60"
          style={{ left: `${pct(majorityMark)}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-500">
        <span>0</span>
        <span className="text-amber-400/60">↑ Majority: {majorityMark}</span>
        <span>{totalSeats}</span>
      </div>
    </div>
  );
}

export default function ForecastPage() {
  const [showMethodology, setShowMethodology] = useState(false);
  const { t } = useI18n();
  const result = useMemo(() => generateForecast(), []);
  const { forecast, winProbability, antiIncumbencyRate, majorityMark, totalSeats, pollsUsed } = result;

  const barData = Object.entries(forecast).map(([key, val]) => ({
    name: key,
    fullName: FORECAST_ALLIANCE_LABELS[key],
    mid: val.seatMid,
    min: val.seatMin,
    max: val.seatMax,
    voteShare: val.voteShare,
    color: FORECAST_ALLIANCE_COLORS[key],
  }));

  const pieData = Object.entries(forecast).map(([key, val]) => ({
    name: key,
    fullName: FORECAST_ALLIANCE_LABELS[key],
    value: val.seatMid,
    color: FORECAST_ALLIANCE_COLORS[key],
  }));

  const spaLeading = forecast.SPA.seatMid >= forecast.NDA.seatMid;
  const leader = spaLeading ? 'SPA' : 'NDA';
  const leaderColor = FORECAST_ALLIANCE_COLORS[leader];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <TrendingUp className="text-amber-400" /> {t('forecast.title')}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Seat projection based on {pollsUsed} opinion polls · Majority mark: {majorityMark} seats
        </p>
      </div>

      {/* Headline Card */}
      <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 rounded-xl p-6 border border-slate-700/50">
        <div className="text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">{t('forecast.projectedWinner')}</p>
          <p className="text-4xl font-bold mb-1" style={{ color: leaderColor }}>
            {FORECAST_ALLIANCE_LABELS[leader].split(' (')[0]}
          </p>
          <p className="text-2xl font-semibold text-white">
            {forecast[leader].seatMin}–{forecast[leader].seatMax} seats
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {forecast[leader].voteShare}% projected vote share
          </p>
        </div>
      </div>

      {/* Win Probability */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="text-amber-400" size={16} /> {t('forecast.winProbability')}
        </h3>
        <div className="space-y-3">
          <ProbabilityMeter label="DMK Alliance (SPA)" percent={winProbability.SPA} color={FORECAST_ALLIANCE_COLORS.SPA} />
          <ProbabilityMeter label="AIADMK Alliance (NDA)" percent={winProbability.NDA} color={FORECAST_ALLIANCE_COLORS.NDA} />
        </div>
        <p className="text-[10px] text-slate-500 mt-3">
          Historical anti-incumbency rate in TN since 1967: <strong className="text-amber-400">{antiIncumbencyRate}%</strong> — ruling parties have lost power in {antiIncumbencyRate}% of elections
        </p>
      </div>

      {/* Seat Range Visualization */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-white mb-4">{t('forecast.projectedSeatRanges')}</h3>
        <div className="space-y-5">
          {Object.entries(forecast).map(([key, data]) => (
            <SeatRangeBar key={key} alliance={key} data={data} color={FORECAST_ALLIANCE_COLORS[key]} majorityMark={majorityMark} totalSeats={totalSeats} />
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h3 className="text-sm font-semibold text-white mb-3">Seat Projection</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={40}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                formatter={(v, n, props) => [`${props.payload.min}–${props.payload.max} seats`, props.payload.fullName]}
              />
              <ReferenceLine y={majorityMark} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: 'Majority', fill: '#fbbf24', fontSize: 10 }} />
              <Bar dataKey="mid" radius={[6, 6, 0, 0]}>
                {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h3 className="text-sm font-semibold text-white mb-3">{t('forecast.projectedSeatShare')}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="fullName" cx="50%" cy="50%" outerRadius={85} innerRadius={45} paddingAngle={2}>
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Opinion Polls Table */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-white mb-3">{t('forecast.sourcePolls')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 px-2 text-slate-400">Agency</th>
                <th className="text-left py-2 px-2 text-slate-400">Date</th>
                <th className="text-right py-2 px-2 text-slate-400">Sample</th>
                <th className="text-right py-2 px-2 text-slate-400">SPA</th>
                <th className="text-right py-2 px-2 text-slate-400">NDA</th>
                <th className="text-right py-2 px-2 text-slate-400">TVK</th>
              </tr>
            </thead>
            <tbody>
              {OPINION_POLLS_2026.map((poll, i) => (
                <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="py-2 px-2 font-medium">{poll.agency}</td>
                  <td className="py-2 px-2 text-slate-400">{new Date(poll.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</td>
                  <td className="py-2 px-2 text-right">{poll.sampleSize.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right font-medium" style={{ color: FORECAST_ALLIANCE_COLORS.SPA }}>{poll.seats.SPA || poll.seats['DMK+'] || '—'}</td>
                  <td className="py-2 px-2 text-right font-medium" style={{ color: FORECAST_ALLIANCE_COLORS.NDA }}>{poll.seats['AIADMK+'] || poll.seats.NDA || '—'}</td>
                  <td className="py-2 px-2 text-right font-medium" style={{ color: FORECAST_ALLIANCE_COLORS.TVK }}>{poll.seats.TVK || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vote Share Comparison */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-white mb-3">{t('forecast.projectedVoteShare')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {barData.map((d) => (
            <div key={d.name} className="bg-slate-700/30 rounded-lg p-3 text-center">
              <p className="text-[10px] text-slate-400 mb-1">{d.fullName.split(' (')[0]}</p>
              <p className="text-2xl font-bold" style={{ color: d.color }}>{d.voteShare}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50">
        <button
          onClick={() => setShowMethodology(!showMethodology)}
          className="w-full p-4 flex items-center justify-between text-sm font-semibold text-white hover:bg-slate-700/20 transition-colors rounded-xl"
        >
          <span className="flex items-center gap-2"><Info size={16} className="text-amber-400" /> {t('forecast.methodology')}</span>
          {showMethodology ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showMethodology && (
          <div className="px-5 pb-5 text-xs text-slate-400 space-y-2">
            <p><strong className="text-slate-300">Methodology:</strong> Weighted poll aggregation using {pollsUsed} opinion polls. Each poll is weighted by recency (√1/days_ago) and sample size (√sample/10000). Seat projections are the weighted average of poll ranges.</p>
            <p><strong className="text-slate-300">Win probability</strong> is estimated based on the gap between projected midpoint seats and historical anti-incumbency patterns in TN elections since 1967.</p>
            <p><strong className="text-slate-300">Historical context:</strong> Tamil Nadu has a {antiIncumbencyRate}% anti-incumbency rate since 1967, with ruling parties losing power in most elections. The current incumbent is DMK (SPA).</p>
            <p className="text-amber-400/70 flex items-start gap-1">
              <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
              <span>This is a statistical projection, not a prediction of actual results. Opinion polls have inherent margins of error (±3-5%). Actual results on May 4, 2026 may differ significantly. This platform does not endorse any party or alliance.</span>
            </p>
          </div>
        )}
      </div>

      <ShareBar title="TN 2026 Election Forecast — Who will win Tamil Nadu?" />
      <ExploreCTA exclude={['/forecast']} maxItems={4} title="More Election Data" />
    </div>
  );
}
