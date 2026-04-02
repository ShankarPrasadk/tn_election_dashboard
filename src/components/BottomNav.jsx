import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BarChart3, Users, Newspaper, Map, MoreHorizontal, X, Target, Vote, MapPin, Scale, Award, IndianRupee, Building2, AlertTriangle, MessageCircleQuestion, TrendingUp, Radio } from 'lucide-react';
import { useI18n } from '../i18n';

const BOTTOM_TABS = [
  { to: '/', icon: BarChart3, label: 'Home' },
  { to: '/candidates', icon: Users, label: 'Candidates' },
  { to: '/news', icon: Newspaper, label: 'News' },
  { to: '/map', icon: Map, label: 'Map' },
];

const MORE_ITEMS = [
  { to: '/forecast', icon: Target, label: 'Forecast' },
  { to: '/trends', icon: TrendingUp, label: 'Trends' },
  { to: '/results', icon: Radio, label: 'Results' },
  { to: '/voters', icon: Vote, label: 'Voters' },
  { to: '/constituency', icon: MapPin, label: 'Constituency' },
  { to: '/comparison', icon: Scale, label: 'Compare' },
  { to: '/mla-tracker', icon: Award, label: 'MLA Tracker' },
  { to: '/finance', icon: IndianRupee, label: 'Finance' },
  { to: '/development', icon: Building2, label: 'Development' },
  { to: '/criminal', icon: AlertTriangle, label: 'Criminal' },
  { to: '/ask', icon: MessageCircleQuestion, label: 'Ask AI' },
];

export default function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { t } = useI18n();
  const location = useLocation();

  // Close more menu on navigation
  useEffect(() => { setMoreOpen(false); }, [location.pathname]);

  return (
    <>
      {/* More menu overlay */}
      {moreOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMoreOpen(false)} />
          <div className="fixed bottom-16 left-2 right-2 z-50 lg:hidden glass rounded-2xl border border-white/[0.08] p-3 animate-slide-up">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">More Pages</span>
              <button onClick={() => setMoreOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {MORE_ITEMS.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `
                    flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-center transition-all
                    ${isActive
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  <Icon size={18} />
                  <span className="text-[10px] font-medium leading-tight">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-[#080c16]/95 backdrop-blur-xl border-t border-white/[0.06] safe-area-bottom" aria-label="Mobile navigation">
        <div className="flex items-center justify-around h-16 px-2">
          {BOTTOM_TABS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `
                flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px]
                ${isActive
                  ? 'text-amber-400'
                  : 'text-slate-500 active:text-slate-300'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg transition-all ${isActive ? 'bg-amber-500/15' : ''}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>{label}</span>
                  {isActive && <div className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />}
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px] ${moreOpen ? 'text-amber-400' : 'text-slate-500'}`}
          >
            <div className={`p-1 rounded-lg transition-all ${moreOpen ? 'bg-amber-500/15' : ''}`}>
              <MoreHorizontal size={20} strokeWidth={moreOpen ? 2.5 : 1.5} />
            </div>
            <span className={`text-[10px] font-medium ${moreOpen ? 'text-amber-400' : 'text-slate-500'}`}>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
