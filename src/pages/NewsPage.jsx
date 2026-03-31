import { useState, useEffect, useCallback, useRef } from 'react';
import { Newspaper, RefreshCw, Clock, ExternalLink, Filter, Tag, Timer } from 'lucide-react';

const CATEGORY_LABELS = {
  all: 'All News',
  election: 'Election',
  crime: 'Crime',
  police: 'Police',
  commission: 'Election Commission',
  general: 'General',
};

const CATEGORY_COLORS = {
  election: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  crime: 'bg-red-500/20 text-red-400 border-red-500/30',
  police: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  commission: 'bg-green-500/20 text-green-400 border-green-500/30',
  general: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const PARTY_COLORS = {
  DMK: '#e11d48',
  AIADMK: '#16a34a',
  BJP: '#f97316',
  PMK: '#eab308',
  DMDK: '#06b6d4',
  TVK: '#8b5cf6',
  NTK: '#dc2626',
  AMMK: '#14b8a6',
  VCK: '#f59e0b',
  MDMK: '#6366f1',
  CPI: '#ef4444',
  IUML: '#22c55e',
  IND: '#94a3b8',
};

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [partyFilter, setPartyFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [nextRefreshIn, setNextRefreshIn] = useState(REFRESH_INTERVAL_MS / 1000);
  const lastFetchTime = useRef(Date.now());

  // Countdown timer for next refresh
  useEffect(() => {
    const tick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastFetchTime.current) / 1000);
      const remaining = Math.max(0, (REFRESH_INTERVAL_MS / 1000) - elapsed);
      setNextRefreshIn(remaining);
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const fetchNews = useCallback(async (manual = false) => {
    try {
      if (manual) setRefreshing(true);
      else setLoading(true);

      const res = await fetch('/api/news');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setArticles(data.articles || []);
      setLastFetched(data.fetchedAt);
      setError(null);

      // Use server's fetchedAt to calculate true remaining time
      if (data.fetchedAt) {
        const serverFetchedAt = new Date(data.fetchedAt).getTime();
        const elapsed = Date.now() - serverFetchedAt;
        const remaining = Math.max(0, REFRESH_INTERVAL_MS - elapsed);
        lastFetchTime.current = serverFetchedAt;
        setNextRefreshIn(Math.floor(remaining / 1000));
      } else {
        lastFetchTime.current = Date.now();
        setNextRefreshIn(REFRESH_INTERVAL_MS / 1000);
      }
    } catch (err) {
      console.error('Failed to fetch news:', err);
      setError('Failed to load news. Will retry automatically.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const id = setInterval(() => fetchNews(), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchNews]);

  // Get unique parties mentioned across articles
  const allParties = [...new Set(articles.flatMap(a => a.matched_parties || []))].sort();

  // Filter articles
  const filtered = articles.filter(a => {
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
    if (partyFilter !== 'all' && !(a.matched_parties || []).includes(partyFilter)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-400 border-t-transparent mx-auto mb-4" />
          <p className="text-slate-400">Fetching latest news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Newspaper className="text-amber-400" size={28} />
            Election News
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Live updates on Tamil Nadu 2026 elections, parties, crime &amp; election commission
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastFetched && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock size={12} />
              Updated {timeAgo(lastFetched)}
            </span>
          )}
          <button
            onClick={() => fetchNews(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 hover:bg-amber-500/20 text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Auto-refresh indicator with countdown */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Auto-refreshing • {filtered.length} articles
        </div>
        <div className="flex items-center gap-1.5 bg-slate-700/50 px-2.5 py-1 rounded-full">
          <Timer size={11} className="text-amber-400" />
          <span className="tabular-nums text-amber-400 font-medium">
            {String(Math.floor(nextRefreshIn / 60)).padStart(2, '0')}:{String(nextRefreshIn % 60).padStart(2, '0')}
          </span>
          <span className="text-slate-500">until refresh</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Category filter */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Filter size={12} /> Category
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setCategoryFilter(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  categoryFilter === key
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:border-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Party filter */}
        {allParties.length > 0 && (
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <Tag size={12} /> Party
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPartyFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  partyFilter === 'all'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:border-slate-600'
                }`}
              >
                All
              </button>
              {allParties.map(party => (
                <button
                  key={party}
                  onClick={() => setPartyFilter(party)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    partyFilter === party
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:border-slate-600'
                  }`}
                  style={partyFilter === party ? { borderColor: PARTY_COLORS[party] || '#f59e0b', color: PARTY_COLORS[party] || '#f59e0b' } : {}}
                >
                  {party}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Articles Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Newspaper size={48} className="mx-auto mb-4 opacity-30" />
          <p>No news articles found for the selected filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article, idx) => (
            <a
              key={idx}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-amber-500/30 hover:bg-slate-800/80 transition-all duration-200 flex flex-col"
            >
              {/* Category + Source */}
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                  CATEGORY_COLORS[article.category] || CATEGORY_COLORS.general
                }`}>
                  {article.category}
                </span>
                <span className="text-[10px] text-slate-500">{article.source}</span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-3 mb-2 flex-grow">
                {article.title}
              </h3>

              {/* Snippet */}
              {article.snippet && (
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {article.snippet}
                </p>
              )}

              {/* Party tags */}
              {article.matched_parties?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {article.matched_parties.map(party => (
                    <span
                      key={party}
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                      style={{
                        backgroundColor: `${PARTY_COLORS[party] || '#64748b'}20`,
                        color: PARTY_COLORS[party] || '#94a3b8',
                      }}
                    >
                      {party}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-700/30">
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock size={10} />
                  {timeAgo(article.published_at)}
                </span>
                <ExternalLink size={12} className="text-slate-500 group-hover:text-amber-400" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
