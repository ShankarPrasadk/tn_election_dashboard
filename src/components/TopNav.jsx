import { NavLink, Link } from 'react-router-dom';
import {
  BarChart3, Target, Radio, TrendingUp, Newspaper, Map,
  Menu, X, Users, Scale, Building2, AlertTriangle,
  MessageCircleQuestion, MapPin, Award, IndianRupee, Vote, Sun, Moon
} from 'lucide-react';
import { useState } from 'react';
import { LanguageToggle, useI18n } from '../i18n';
import { useElectionState } from '../context/StateContext';
import { useTheme } from '../context/ThemeContext';

const PRIMARY_NAV = [
  { to: '/', icon: BarChart3, i18nKey: 'nav.dashboard' },
  { to: '/trends', icon: TrendingUp, i18nKey: 'nav.trends' },
  { to: '/news', icon: Newspaper, i18nKey: 'nav.news' },
  { to: '/results', icon: Radio, i18nKey: 'nav.results' },
  { to: '/map', icon: Map, i18nKey: 'nav.map' },
];

const ALL_NAV_GROUPS = [
  { group: 'Main', items: [
    { to: '/', icon: BarChart3, i18nKey: 'nav.dashboard' },
    { to: '/trends', icon: TrendingUp, i18nKey: 'nav.trends' },
    { to: '/news', icon: Newspaper, i18nKey: 'nav.news' },
    { to: '/results', icon: Radio, i18nKey: 'nav.results' },
    { to: '/map', icon: Map, i18nKey: 'nav.map' },
  ]},
  { group: 'Data', items: [
    { to: '/forecast', icon: Target, i18nKey: 'nav.forecast' },
    { to: '/candidates', icon: Users, i18nKey: 'nav.candidates' },
    { to: '/voters', icon: Vote, i18nKey: 'nav.voters' },
    { to: '/constituency', icon: MapPin, i18nKey: 'nav.constituency' },
  ]},
  { group: 'Analysis', items: [
    { to: '/comparison', icon: Scale, i18nKey: 'nav.compare' },
    { to: '/mla-tracker', icon: Award, i18nKey: 'nav.mla' },
    { to: '/finance', icon: IndianRupee, i18nKey: 'nav.finance' },
    { to: '/development', icon: Building2, i18nKey: 'nav.development' },
    { to: '/criminal', icon: AlertTriangle, i18nKey: 'nav.criminal' },
  ]},
  { group: 'Tools', items: [
    { to: '/ask', icon: MessageCircleQuestion, i18nKey: 'nav.ask' },
  ]},
];

export default function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useI18n();
  const { stateCode, config, switchState, states } = useElectionState();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#080c16]/95 backdrop-blur-xl border-b border-white/[0.06]">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-60 h-20 bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center h-14 px-3 lg:px-5 gap-2">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="relative">
              <img src={config.emblem} alt={`${config.name} Election Commission`} className="w-8 h-8 object-contain" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full pulse-dot" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">
                <span className="text-amber-400">{config.shortName === 'Pondy' ? 'PY' : config.code}</span> Election
              </h1>
              <span className="text-[10px] text-slate-500 hidden sm:block">Dashboard &bull; {config.yearRange}</span>
            </div>
          </Link>

          {/* Divider */}
          <div className="hidden lg:block w-px h-6 bg-white/[0.06] mx-2" />

          {/* Desktop primary nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1" aria-label="Primary navigation">
            {PRIMARY_NAV.map(({ to, icon: Icon, i18nKey }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-amber-500/[0.1] text-amber-400 shadow-sm shadow-amber-500/10'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]'}
                `}
              >
                <Icon size={15} />
                {t(i18nKey)}
              </NavLink>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2 ml-auto">
            {/* State Switcher */}
            <div className="flex glass rounded-lg p-0.5">
              {Object.values(states).map((s) => (
                <button
                  key={s.code}
                  onClick={() => switchState(s.code)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all duration-200 ${
                    stateCode === s.code
                      ? 'bg-amber-500/20 text-amber-400 shadow-sm shadow-amber-500/20'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {s.code}
                </button>
              ))}
            </div>
            <div className="hidden sm:block">
              <LanguageToggle />
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/[0.05] transition-all"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-14 left-0 right-0 bottom-0 z-40 bg-[#080c16]/98 backdrop-blur-xl overflow-y-auto lg:hidden">
            <nav className="p-4 pb-24">
              {ALL_NAV_GROUPS.map(({ group, items }) => (
                <div key={group} className="mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600 px-1 mb-2">{group}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {items.map(({ to, icon: Icon, i18nKey }) => (
                      <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) => `
                          flex items-center gap-2.5 px-3 py-3 rounded-xl text-[13px] font-medium transition-all duration-200
                          ${isActive
                            ? 'bg-amber-500/[0.1] text-amber-400 border border-amber-500/20'
                            : 'text-slate-400 hover:text-slate-200 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04]'}
                        `}
                      >
                        <Icon size={16} />
                        {t(i18nKey)}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* Mobile menu footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#080c16]/90 backdrop-blur-xl border-t border-white/[0.04] lg:hidden">
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <NavLink to="/about" onClick={() => setMenuOpen(false)} className="text-[11px] text-slate-500 hover:text-amber-400 transition-colors">About</NavLink>
                  <NavLink to="/privacy" onClick={() => setMenuOpen(false)} className="text-[11px] text-slate-500 hover:text-amber-400 transition-colors">Privacy</NavLink>
                  <NavLink to="/terms" onClick={() => setMenuOpen(false)} className="text-[11px] text-slate-500 hover:text-amber-400 transition-colors">Terms</NavLink>
                </div>
                <div className="sm:hidden">
                  <LanguageToggle />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
