import { NavLink } from 'react-router-dom';
import { BarChart3, Users, Scale, TrendingUp, Building2, AlertTriangle, Menu, X, MessageCircleQuestion, MapPin, Map, Newspaper, Target, Radio, Award, IndianRupee, Code } from 'lucide-react';
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
  { to: '/embed', icon: Code, i18nKey: 'nav.embed' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-slate-800 p-2 rounded-lg text-slate-300"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-700/50
        transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <img src="/tnsec-emblem.png" alt="Tamil Nadu State Election Commission" className="w-10 h-10 flex-shrink-0 object-contain" />
            <h1 className="text-xl font-bold text-white">
              <span className="text-amber-400">TN</span> Election
              <span className="block text-xs font-normal text-slate-400 mt-0.5">
                Dashboard • 1952–2026
              </span>
            </h1>
          </div>
        </div>

        <nav aria-label="Main navigation" className="p-4 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, i18nKey }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all relative
                ${isActive
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 border-l-2 border-l-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'}
              `}
            >
              <Icon size={18} />
              {t(i18nKey)}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
          <div className="flex justify-center mb-2">
            <LanguageToggle />
          </div>
          <div className="flex justify-center gap-3 mb-2">
            <NavLink to="/about" className="text-[10px] text-slate-500 hover:text-amber-400 transition-colors">About</NavLink>
            <NavLink to="/privacy" className="text-[10px] text-slate-500 hover:text-amber-400 transition-colors">Privacy</NavLink>
            <NavLink to="/terms" className="text-[10px] text-slate-500 hover:text-amber-400 transition-colors">Terms</NavLink>
          </div>
          <p className="text-xs text-slate-500 text-center">
            Source: <a href="https://tnsec.tn.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-500/70 hover:text-amber-400">TNSEC</a> · <a href="https://www.eci.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-500/70 hover:text-amber-400">ECI</a> · myneta.info
            <br />
            Based on candidate affidavits
          </p>
        </div>
      </aside>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
