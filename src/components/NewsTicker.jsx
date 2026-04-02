import { useState, useEffect } from 'react';
import { Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewsTicker() {
  const [headlines, setHeadlines] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch('/api/news');
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data.articles?.length) {
          // Take latest 15 headlines
          setHeadlines(data.articles.slice(0, 15).map(a => a.title));
        }
      } catch {
        // Silently fail - ticker is non-critical
      }
    }

    load();
    const id = setInterval(load, 10 * 60 * 1000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  if (!headlines.length) return null;

  const tickerText = headlines.join('  •  ');

  return (
    <div className="bg-[#080c16]/90 backdrop-blur-xl border-b border-white/[0.03] overflow-hidden">
      <div className="flex items-center">
        <Link
          to="/news"
          className="flex-shrink-0 flex items-center gap-1.5 bg-amber-500/[0.08] border-r border-amber-500/[0.1] px-3 py-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-widest z-10"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 pulse-dot" />
          Live
        </Link>
        <div className="overflow-hidden flex-1 relative">
          <div className="animate-ticker whitespace-nowrap py-1.5 text-[11px] text-slate-500">
            {tickerText}  •  {tickerText}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 120s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
