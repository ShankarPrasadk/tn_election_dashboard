import { useState, useMemo, useRef, useEffect } from 'react';
import { BookOpen, Clock, ChevronDown, ChevronUp, Filter, Search, Share2 } from 'lucide-react';
import { useElectionState } from '../context/StateContext';
import { TN_ELECTION_STORIES, PY_ELECTION_STORIES, STORY_CATEGORIES } from '../data/electionStories';
import { SectionHeader } from '../components/UIComponents';
import { ExportDropdown } from '../components/DataExport';
import { useI18n } from '../i18n';

// ─── Story Card ─────────────────────────────────────────────

function StoryCard({ story, isExpanded, onToggle, index }) {
  const cat = STORY_CATEGORIES[story.category] || {};
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isExpanded]);

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: story.title, text: story.subtitle, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(`${story.title} — ${story.subtitle}\n${window.location.href}`);
    }
  };

  return (
    <article
      className="group relative glass rounded-xl overflow-hidden transition-all duration-300"
      style={{ borderLeft: `3px solid ${cat.color || '#64748b'}` }}
    >
      {/* Header — always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-4 sm:p-5"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Year badge */}
          <div
            className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex flex-col items-center justify-center text-white font-bold shadow-lg"
            style={{ backgroundColor: `${cat.color}20`, border: `1px solid ${cat.color}40` }}
          >
            <span className="text-lg sm:text-xl leading-none" style={{ color: cat.color }}>{story.year}</span>
            <span className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">{story.era}</span>
          </div>

          {/* Title and meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
              >
                {cat.icon} {cat.label}
              </span>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Clock size={10} /> {story.readTime} min read
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white leading-snug group-hover:text-amber-400 transition-colors">
              {story.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 line-clamp-2">{story.subtitle}</p>
          </div>

          {/* Expand indicator */}
          <div className="flex-shrink-0 flex items-center gap-1.5 mt-1">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-white/5 transition-all"
              title="Share"
            >
              <Share2 size={14} />
            </button>
            <div className="p-1 text-slate-500">
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </div>
      </button>

      {/* Expandable content */}
      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{ maxHeight: isExpanded ? `${contentHeight + 100}px` : '0px' }}
      >
        <div ref={contentRef} className="px-4 sm:px-5 pb-5 space-y-4">
          <div className="border-t border-slate-700/30 pt-4" />

          {/* Main content */}
          <div className="prose prose-sm prose-invert max-w-none">
            {story.content.split('\n\n').map((para, i) => (
              <p key={i} className="text-sm text-slate-300 leading-relaxed mb-3 last:mb-0">
                {para}
              </p>
            ))}
          </div>

          {/* Key fact callout */}
          {story.keyFact && (
            <div className="rounded-lg p-3 sm:p-4 border" style={{ backgroundColor: `${cat.color}08`, borderColor: `${cat.color}30` }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: cat.color }}>
                📌 Key Fact
              </p>
              <p className="text-sm text-slate-200 leading-relaxed">{story.keyFact}</p>
            </div>
          )}

          {/* Sources */}
          {story.sources?.length > 0 && (
            <div className="pt-2 border-t border-slate-700/20">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Sources</p>
              <div className="flex flex-wrap gap-1.5">
                {story.sources.map((src, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/50 text-slate-400 border border-slate-700/30">
                    {src}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Timeline Connector ─────────────────────────────────────

function TimelineDot({ color, isFirst, isLast }) {
  return (
    <div className="flex flex-col items-center w-6 flex-shrink-0">
      {!isFirst && <div className="w-px flex-1 bg-slate-700/40" />}
      <div className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{ borderColor: color, backgroundColor: `${color}40` }} />
      {!isLast && <div className="w-px flex-1 bg-slate-700/40" />}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────

export default function StoriesPage() {
  const { stateCode, config } = useElectionState();
  const { t } = useI18n();
  const isPY = stateCode === 'PY';

  const allStories = isPY ? PY_ELECTION_STORIES : TN_ELECTION_STORIES;

  const [expandedId, setExpandedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('chronological'); // chronological | reverse

  // Filtered and sorted stories
  const filteredStories = useMemo(() => {
    let result = [...allStories];

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter(s => s.category === activeCategory);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.subtitle.toLowerCase().includes(q) ||
        s.content.toLowerCase().includes(q) ||
        String(s.year).includes(q)
      );
    }

    // Sort
    result.sort((a, b) => sortOrder === 'chronological' ? a.year - b.year : b.year - a.year);

    return result;
  }, [allStories, activeCategory, searchQuery, sortOrder]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: allStories.length };
    for (const s of allStories) {
      counts[s.category] = (counts[s.category] || 0) + 1;
    }
    return counts;
  }, [allStories]);

  // Total read time
  const totalReadTime = useMemo(() => filteredStories.reduce((sum, s) => sum + s.readTime, 0), [filteredStories]);

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <BookOpen className="text-amber-400" size={22} />
              {isPY ? 'Puducherry' : 'Tamil Nadu'} Election Stories
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Key moments, origins, and turning points from {isPY ? '1954' : '1916'} to present — sourced from official records, books, and documentaries
            </p>
          </div>
          <ExportDropdown tableId="stories-content" fileName={`${config.code}-election-stories`} />
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          <span>{filteredStories.length} stories</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Clock size={11} /> ~{totalReadTime} min total read time</span>
          <span>•</span>
          <span>{isPY ? '70+' : '100+'} years of history</span>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-3 sm:p-4 space-y-3">
        {/* Search & sort */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories..."
              className="w-full bg-slate-800/50 border border-slate-700/40 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <button
            onClick={() => setSortOrder(prev => prev === 'chronological' ? 'reverse' : 'chronological')}
            className="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/40 text-xs text-slate-400 hover:text-white hover:border-slate-600 transition-all flex-shrink-0"
          >
            {sortOrder === 'chronological' ? '↑ Oldest First' : '↓ Newest First'}
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            All ({categoryCounts.all})
          </button>
          {Object.entries(STORY_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === key
                  ? 'border'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
              style={activeCategory === key ? { backgroundColor: `${cat.color}20`, color: cat.color, borderColor: `${cat.color}40` } : undefined}
            >
              {cat.icon} {cat.label} ({categoryCounts[key] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Stories Timeline */}
      <div id="stories-content" className="space-y-3">
        {filteredStories.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-slate-400 text-sm">No stories match your search.</p>
          </div>
        ) : (
          filteredStories.map((story, i) => (
            <div key={story.id} className="flex gap-0 sm:gap-2">
              {/* Timeline connector (hidden on mobile) */}
              <div className="hidden sm:flex">
                <TimelineDot
                  color={STORY_CATEGORIES[story.category]?.color || '#64748b'}
                  isFirst={i === 0}
                  isLast={i === filteredStories.length - 1}
                />
              </div>
              {/* Story card */}
              <div className="flex-1">
                <StoryCard
                  story={story}
                  index={i}
                  isExpanded={expandedId === story.id}
                  onToggle={() => setExpandedId(expandedId === story.id ? null : story.id)}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="glass rounded-xl p-4 text-center space-y-2">
        <p className="text-xs text-slate-400">
          📚 All stories sourced from official records, Election Commission reports, published books, and documentary archives.
        </p>
        <p className="text-[10px] text-slate-500">
          Sources include: Election Commission of India • Tamil Nadu State Archives • Legislative Assembly records • The Hindu archives • Frontline magazine • India Today
        </p>
      </div>
    </div>
  );
}
