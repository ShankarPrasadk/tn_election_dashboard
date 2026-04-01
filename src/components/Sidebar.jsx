import { NavLink } from 'react-router-dom';
import { BarChart3, Users, Scale, TrendingUp, Building2, AlertTriangle, Menu, X, MessageCircleQuestion, MapPin, Map, Newspaper } from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/', icon: BarChart3, label: 'Dashboard' },
  { to: '/trends', icon: TrendingUp, label: 'Trends (1952–2026)' },
  { to: '/candidates', icon: Users, label: 'Candidates' },
  { to: '/news', icon: Newspaper, label: 'Live News' },
  { to: '/development', icon: Building2, label: 'Development' },
  { to: '/criminal', icon: AlertTriangle, label: 'Criminal Records' },
  { to: '/constituency', icon: MapPin, label: 'My Constituency' },
  { to: '/map', icon: Map, label: 'Map' },
  { to: '/comparison', icon: Scale, label: 'Compare' },
  { to: '/ask', icon: MessageCircleQuestion, label: 'Ask' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

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
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <img src="/tnsec-emblem.png" alt="Tamil Nadu State Election Commission" className="w-12 h-12 flex-shrink-0 object-contain" />
            <h1 className="text-xl font-bold text-white">
              <span className="text-amber-400">TN</span> Election
              <span className="block text-xs font-normal text-slate-400 mt-0.5">
                Dashboard • 1952–2026
              </span>
            </h1>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all relative
                ${isActive
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 border-l-2 border-l-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'}
              `}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
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
