import { PARTY_COLORS } from '../data/electionData';
import PartySymbolIcon from './PartySymbolIcon';

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'amber' }) {
  const colorMap = {
    amber: 'from-amber-500/10 via-amber-600/5 to-amber-700/[0.02] border-amber-500/20 text-amber-400',
    red: 'from-red-500/10 via-red-600/5 to-red-700/[0.02] border-red-500/20 text-red-400',
    green: 'from-green-500/10 via-green-600/5 to-green-700/[0.02] border-green-500/20 text-green-400',
    blue: 'from-blue-500/10 via-blue-600/5 to-blue-700/[0.02] border-blue-500/20 text-blue-400',
    purple: 'from-purple-500/10 via-purple-600/5 to-purple-700/[0.02] border-purple-500/20 text-purple-400',
  };
  const glowMap = {
    amber: 'shadow-amber-500/5',
    red: 'shadow-red-500/5',
    green: 'shadow-green-500/5',
    blue: 'shadow-blue-500/5',
    purple: 'shadow-purple-500/5',
  };

  return (
    <div className={`relative bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-5 backdrop-blur-sm shadow-lg ${glowMap[color]} overflow-hidden transition-all duration-300 hover:scale-[1.01]`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
          {Icon && <Icon size={18} className="text-slate-500" />}
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        {trend !== undefined && (
          <p className={`text-xs mt-2 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from previous
          </p>
        )}
      </div>
    </div>
  );
}

export function PartyBadge({ party, size = 'sm' }) {
  const color = PARTY_COLORS[party] || PARTY_COLORS.Others;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  const iconSize = size === 'sm' ? 12 : 16;
  return (
    <span
      className={`${sizeClass} rounded-full font-semibold inline-flex items-center gap-1`}
      style={{ backgroundColor: `${color}20`, color: color, border: `1px solid ${color}40` }}
    >
      <PartySymbolIcon party={party} size={iconSize} color={color} />
      {party}
    </span>
  );
}

export function YearSelector({ selectedYear, onChange, years = [2006, 2011, 2016, 2021, 2026] }) {
  return (
    <div className="flex gap-2">
      {years.map(year => (
        <button
          key={year}
          onClick={() => onChange(year)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedYear === year
              ? 'bg-amber-500 text-slate-900'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function DataTable({ columns, data, onRowClick }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            {columns.map((col, i) => (
              <th key={i} className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col, j) => (
                <td key={j} className="py-3 px-4 text-slate-300">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
