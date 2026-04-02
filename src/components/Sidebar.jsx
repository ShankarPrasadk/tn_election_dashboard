import { NavLink } from 'react-router-dom';
import { Target, Users, Scale, Building2, AlertTriangle, MessageCircleQuestion, MapPin, Award, IndianRupee, Vote } from 'lucide-react';
import { useI18n } from '../i18n';
import { useElectionState } from '../context/StateContext';

const SIDEBAR_GROUPS = [
  { label: 'Forecast', items: [
    { to: '/forecast', icon: Target, i18nKey: 'nav.forecast' },
  ]},
  { label: 'Data', items: [
    { to: '/candidates', icon: Users, i18nKey: 'nav.candidates' },
    { to: '/voters', icon: Vote, i18nKey: 'nav.voters' },
    { to: '/constituency', icon: MapPin, i18nKey: 'nav.constituency' },
  ]},
  { label: 'Analysis', items: [
    { to: '/comparison', icon: Scale, i18nKey: 'nav.compare' },
    { to: '/mla-tracker', icon: Award, i18nKey: 'nav.mla' },
    { to: '/finance', icon: IndianRupee, i18nKey: 'nav.finance' },
    { to: '/development', icon: Building2, i18nKey: 'nav.development' },
    { to: '/criminal', icon: AlertTriangle, i18nKey: 'nav.criminal' },
  ]},
  { label: 'Tools', items: [
    { to: '/ask', icon: MessageCircleQuestion, i18nKey: 'nav.ask' },
  ]},
];

export default function Sidebar() {
  const { t } = useI18n();
  const { config } = useElectionState();

  return (
    <aside className="hidden lg:flex flex-col w-14 hover:w-52 group/sidebar transition-all duration-300 ease-out bg-[#080c16]/60 backdrop-blur-xl border-r border-white/[0.04] overflow-hidden flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)]">
      {/* Ambient glow */}
      <div className="absolute top-0 left-0 w-20 h-20 bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <nav className="flex-1 py-3 space-y-3 overflow-y-auto custom-scrollbar" aria-label="Secondary navigation">
        {SIDEBAR_GROUPS.map(({ label, items }) => (
          <div key={label}>
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600 px-4 mb-1.5 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">{label}</p>
            <div className="space-y-0.5 px-2">
              {items.map(({ to, icon: Icon, i18nKey }) => (
                <NavLink
                  key={to}
                  to={to}
                  title={t(i18nKey)}
                  className={({ isActive }) => `
                    flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 relative group/item whitespace-nowrap overflow-hidden
                    ${isActive
                      ? 'bg-amber-500/[0.08] text-amber-400'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]'}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-amber-400 rounded-r-full shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                      )}
                      <Icon size={16} className={`flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-600 group-hover/item:text-slate-400'}`} />
                      <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">{t(i18nKey)}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-white/[0.04] opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
        <div className="flex justify-center gap-2 text-[10px]">
          <NavLink to="/about" className="text-slate-600 hover:text-amber-400 transition-colors">About</NavLink>
          <NavLink to="/privacy" className="text-slate-600 hover:text-amber-400 transition-colors">Privacy</NavLink>
          <NavLink to="/terms" className="text-slate-600 hover:text-amber-400 transition-colors">Terms</NavLink>
        </div>
        <p className="text-[9px] text-slate-700 text-center mt-1 whitespace-nowrap overflow-hidden">
          <a href={config.electionCommissionURL} target="_blank" rel="noopener noreferrer" className="text-amber-500/40 hover:text-amber-400">{config.electionCommissionName}</a>
        </p>
      </div>
    </aside>
  );
}
