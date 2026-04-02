import { NavLink } from 'react-router-dom';
import { BarChart3, Users, Scale, TrendingUp, Building2, AlertTriangle, Menu, X, MessageCircleQuestion, MapPin, Map, Newspaper, Target, Radio, Award, IndianRupee } from 'lucide-react';
import { useState } from 'react';
import { LanguageToggle, useI18n } from '../i18n';

const NAV_ITEMS = [
  { to: '/', icon: BarChart3, i18nKey: 'nav.dashboard' },
  { to: '/forecast', icon: Target, i18nKey: 'nav.forecast' },
  { to: '/trends', icon: TrendingUp, i18nKey: 'nav.trends' },
  { to: '/candidates', icon: Users, i18nKey: 'nav.candidates' },
  { to: '/news', icon: Newspaper, i18nKey: 'nav.news' },
  { to: '/results', icon: Radio, i18nKey: 'nav.results' },
  { to: '/development', icon: Building2, i18nKey: 'nav.development' },
  { to: '/criminal', icon: AlertTriangle, i18nKey: 'nav.criminal' },
  { to: '/constituency', icon: MapPin, i18nKey: 'nav.constituency' },
  { to: '/map', icon: Map, i18nKey: 'nav.map' },
  { to: '/comparison', icon: Scale, i18nKey: 'nav.compare' },
  { to: '/mla-tracker', icon: Award, i18nKey: 'nav.mla' },
  { to: '/finance', icon: IndianRupee, i18nKey: 'nav.finance' },
  { to: '/ask', icon: MessageCircleQuestion, i18nKey: 'nav.ask' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 glass rounded-xl p-2.5 text-slate-300 hover:text-white transition-colors"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-60
        bg-[#080c16]/90 backdrop-blur-xl border-r border-white/[0.04]
        transform transition-transform duration-300 ease-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Ambient glow */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none" />

        <div className="p-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src="/tnsec-emblem.png" alt="Tamil Nadu State Election Commission" className="w-9 h-9 flex-shrink-0 object-contain" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full pulse-dot" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              <span className="text-amber-400">TN</span> Election
              <span className="block text-[10px] font-normal text-slate-500 mt-0.5 tracking-wide">
                Dashboard • 1952–2026
              </span>
            </h1>
          </div>
        </div>

        <nav aria-label="Main navigation" className="p-3 space-y-0.5 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {NAV_ITEMS.map(({ to, icon: Icon, i18nKey }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 relative group
                ${isActive
                  ? 'bg-amber-500/[0.08] text-amber-400'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]'}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-amber-400 rounded-r-full shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                  )}
                  <Icon size={16} className={isActive ? 'text-amber-400' : 'text-slate-600 group-hover:text-slate-400'} />
                  {t(i18nKey)}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/[0.04] bg-[#080c16]/80 backdrop-blur-sm">
          <div className="flex justify-center mb-2">
            <LanguageToggle />
          </div>
          <div className="flex justify-center gap-3 mb-1.5">
            <NavLink to="/about" className="text-[10px] text-slate-600 hover:text-amber-400 transition-colors">About</NavLink>
            <NavLink to="/privacy" className="text-[10px] text-slate-600 hover:text-amber-400 transition-colors">Privacy</NavLink>
            <NavLink to="/terms" className="text-[10px] text-slate-600 hover:text-amber-400 transition-colors">Terms</NavLink>
          </div>
          <p className="text-[10px] text-slate-600 text-center">
            <a href="https://tnsec.tn.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-500/50 hover:text-amber-400">TNSEC</a> · <a href="https://www.eci.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-500/50 hover:text-amber-400">ECI</a> · myneta.info
          </p>
        </div>
      </aside>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
