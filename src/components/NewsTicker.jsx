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
    <div className="bg-slate-800/80 border-b border-slate-700/50 overflow-hidden">
      <div className="flex items-center">
        <Link
          to="/news"
          className="flex-shrink-0 flex items-center gap-1.5 bg-amber-500/20 px-3 py-1.5 text-amber-400 text-xs font-bold uppercase z-10"
        >
          <Newspaper size={12} />
          Live
        </Link>
        <div className="overflow-hidden flex-1 relative">
          <div className="animate-ticker whitespace-nowrap py-1.5 text-xs text-slate-300">
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
