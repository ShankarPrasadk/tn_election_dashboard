import { Link } from 'react-router-dom';
import { AlertTriangle, Scale, TrendingUp, Users, MapPin, Newspaper, MessageCircleQuestion, Map } from 'lucide-react';

const CTA_ITEMS = [
  { to: '/criminal', icon: AlertTriangle, label: 'Criminal Records', desc: 'See candidates with criminal cases', color: 'red' },
  { to: '/candidates', icon: Users, label: 'All Candidates', desc: 'Browse 1,200+ candidates for 2026', color: 'amber' },
  { to: '/comparison', icon: Scale, label: 'Compare', desc: 'Compare parties and candidates', color: 'purple' },
  { to: '/trends', icon: TrendingUp, label: 'Historical Trends', desc: '70+ years of election data', color: 'blue' },
  { to: '/constituency', icon: MapPin, label: 'My Constituency', desc: 'Find your constituency data', color: 'emerald' },
  { to: '/map', icon: Map, label: 'Election Map', desc: 'Interactive TN election map', color: 'cyan' },
  { to: '/news', icon: Newspaper, label: 'Live News', desc: 'Latest election updates', color: 'orange' },
  { to: '/ask', icon: MessageCircleQuestion, label: 'Ask AI', desc: 'Ask questions about elections', color: 'violet' },
];

const COLOR_MAP = {
  red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', hover: 'hover:border-red-500/40' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', hover: 'hover:border-amber-500/40' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', hover: 'hover:border-purple-500/40' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', hover: 'hover:border-blue-500/40' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', hover: 'hover:border-emerald-500/40' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', hover: 'hover:border-cyan-500/40' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', hover: 'hover:border-orange-500/40' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', hover: 'hover:border-violet-500/40' },
};

export default function ExploreCTA({ exclude = [], maxItems = 4, title = 'Explore More' }) {
  const items = CTA_ITEMS.filter(item => !exclude.includes(item.to)).slice(0, maxItems);

  return (
    <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-5">
      <h3 className="text-base font-bold text-white mb-3">{title}</h3>
      <div className={`grid grid-cols-2 ${maxItems > 4 ? 'md:grid-cols-4' : 'md:grid-cols-' + Math.min(maxItems, 4)} gap-3`}>
        {items.map(({ to, icon: Icon, label, desc, color }) => {
          const c = COLOR_MAP[color];
          return (
            <Link
              key={to}
              to={to}
              className={`${c.bg} ${c.border} ${c.hover} border rounded-lg p-3 transition-all hover:scale-[1.02] group`}
            >
              <Icon size={20} className={`${c.text} mb-2 group-hover:scale-110 transition-transform`} />
              <p className="text-sm font-medium text-white">{label}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
