import { PARTY_COLORS } from '../data/electionData';
import PartySymbolIcon from './PartySymbolIcon';
import PartyFlag from './PartyFlag';

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'amber' }) {
  const colorMap = {
    amber:  { border: 'border-amber-500/[0.12]',  glow: 'rgba(245,158,11,0.06)',  accent: '#f59e0b', iconBg: 'bg-amber-500/[0.08]' },
    red:    { border: 'border-red-500/[0.12]',     glow: 'rgba(239,68,68,0.06)',   accent: '#ef4444', iconBg: 'bg-red-500/[0.08]' },
    green:  { border: 'border-emerald-500/[0.12]', glow: 'rgba(16,185,129,0.06)',  accent: '#10b981', iconBg: 'bg-emerald-500/[0.08]' },
    blue:   { border: 'border-blue-500/[0.12]',    glow: 'rgba(59,130,246,0.06)',   accent: '#3b82f6', iconBg: 'bg-blue-500/[0.08]' },
    purple: { border: 'border-purple-500/[0.12]',  glow: 'rgba(168,85,247,0.06)',   accent: '#a855f7', iconBg: 'bg-purple-500/[0.08]' },
  };
  const c = colorMap[color] || colorMap.amber;

  return (
    <div className={`relative glass-card ${c.border} rounded-2xl p-4 overflow-hidden group hover:scale-[1.02] transition-all duration-300`}>
      {/* Corner glow */}
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-60 blur-2xl pointer-events-none" style={{ backgroundColor: c.glow }} />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{title}</span>
          {Icon && (
            <div className={`${c.iconBg} rounded-lg p-1.5`}>
              <Icon size={14} style={{ color: c.accent }} />
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-white tracking-tight animate-fadeInUp">{value}</p>
        {subtitle && <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{subtitle}</p>}
        {trend !== undefined && (
          <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from previous
          </div>
        )}
      </div>
    </div>
  );
}

export function PartyBadge({ party, size = 'sm', showFlag = true }) {
  const color = PARTY_COLORS[party] || PARTY_COLORS.Others;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  const iconSize = size === 'sm' ? 12 : 16;
  const flagSize = size === 'sm' ? 10 : 14;
  return (
    <span
      className={`${sizeClass} rounded-full font-semibold inline-flex items-center gap-1`}
      style={{ backgroundColor: `${color}20`, color: color, border: `1px solid ${color}40` }}
    >
      {showFlag && <PartyFlag party={party} size={flagSize} />}
      <PartySymbolIcon party={party} size={iconSize} color={color} />
      {party}
    </span>
  );
}

/** Larger party identity block — flag + symbol + name for prominent displays */
export function PartyIdentity({ party, size = 'md' }) {
  const color = PARTY_COLORS[party] || PARTY_COLORS.Others;
  const sizes = {
    sm: { flag: 12, symbol: 14, text: 'text-xs' },
    md: { flag: 16, symbol: 18, text: 'text-sm' },
    lg: { flag: 22, symbol: 24, text: 'text-base' },
  };
  const s = sizes[size] || sizes.md;
  return (
    <span className="inline-flex items-center gap-1.5">
      <PartyFlag party={party} size={s.flag} />
      <PartySymbolIcon party={party} size={s.symbol} color={color} />
      <span className={`${s.text} font-semibold`} style={{ color }}>{party}</span>
    </span>
  );
}

export function YearSelector({ selectedYear, onChange, years = [2006, 2011, 2016, 2021, 2026] }) {
  return (
    <div className="flex gap-1.5 glass rounded-xl p-1">
      {years.map(year => (
        <button
          key={year}
          onClick={() => onChange(year)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            selectedYear === year
              ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/25'
              : 'text-slate-500 hover:text-white hover:bg-white/[0.04]'
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
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
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
