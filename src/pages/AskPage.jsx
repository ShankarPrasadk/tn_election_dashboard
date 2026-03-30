import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle, User, Bot, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PartyBadge } from '../components/UIComponents';
import { PARTY_COLORS } from '../data/electionData';

const SUGGESTED_QUESTIONS = [
  'Who are the DMK candidates in 2026 election?',
  'Show AIADMK candidates with criminal cases in 2021',
  'Which candidates have the highest assets in 2026?',
  'Compare DMK and AIADMK candidate profiles in 2021',
  'Show BJP candidates in Tamil Nadu 2026 assembly election',
];

function Citation({ citation }) {
  return (
    <Link
      to={`/candidate/${citation.candidateId}`}
      className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded px-2 py-0.5 hover:bg-amber-500/20 transition-colors"
    >
      {citation.label}
    </Link>
  );
}

function MatchedCandidate({ candidate }) {
  const color = PARTY_COLORS[candidate.party] || '#64748b';

  return (
    <Link
      to={`/candidate/${candidate.id}`}
      className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-amber-500/30 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white truncate">{candidate.name}</p>
        <p className="text-xs text-slate-400">
          {candidate.constituency} &middot; {candidate.year}
        </p>
      </div>
      <PartyBadge party={candidate.party} colors={PARTY_COLORS} />
    </Link>
  );
}

function Message({ message }) {
  const [expanded, setExpanded] = useState(false);
  const hasCandidates = message.matchedCandidates?.length > 0;

  return (
    <div className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.role === 'assistant' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Bot size={16} className="text-amber-400" />
        </div>
      )}

      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          message.role === 'user'
            ? 'bg-amber-500/20 text-white border border-amber-500/20'
            : message.status === 'blocked'
              ? 'bg-red-500/10 text-red-300 border border-red-500/20'
              : 'bg-slate-800 text-slate-200 border border-slate-700/50'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.answer || message.text}</p>

          {message.citations?.length > 0 && (
            <div className="mt-3 pt-2 border-t border-slate-700/50">
              <p className="text-xs text-slate-500 mb-1.5">Sources</p>
              <div className="flex flex-wrap gap-1.5">
                {message.citations.map((c, i) => <Citation key={i} citation={c} />)}
              </div>
            </div>
          )}
        </div>

        {hasCandidates && (
          <div className="mt-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {message.matchedCandidates.length} matched candidate{message.matchedCandidates.length > 1 ? 's' : ''}
            </button>
            {expanded && (
              <div className="mt-2 space-y-1.5">
                {message.matchedCandidates.map((c) => <MatchedCandidate key={c.id} candidate={c} />)}
              </div>
            )}
          </div>
        )}

        {message.mode && (
          <p className="text-[10px] text-slate-600 mt-1">
            {message.mode === 'deterministic-rag-preview' ? 'Deterministic RAG' : message.mode}
            {message.retrieval?.total != null && ` \u00b7 ${message.retrieval.total} records matched`}
          </p>
        )}
      </div>

      {message.role === 'user' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
          <User size={16} className="text-slate-300" />
        </div>
      )}
    </div>
  );
}

export default function AskPage() {
  const [question, setQuestion] = useState('');
  const [year, setYear] = useState('');
  const [party, setParty] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || q.length < 8) return;

    setError('');
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setQuestion('');
    setLoading(true);

    try {
      const body = { question: q, maxCandidates: 5 };
      if (year) body.year = Number(year);
      if (party) body.party = party;

      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Server error ${response.status}`);
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', ...data }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (q) => {
    setQuestion(q);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bot className="text-amber-400" size={28} />
          Ask About Elections
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Query candidate affidavit data across 2006–2026 Tamil Nadu assembly elections. Answers are grounded in official disclosures.
        </p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Bot size={32} className="text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Election Data Assistant</h2>
            <p className="text-sm text-slate-400 mb-6 max-w-md">
              Ask questions about candidates, their criminal records, assets, education, and party affiliations.
              All answers are sourced from official election affidavits.
            </p>
            <div className="space-y-2 w-full max-w-md">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Try asking</p>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggestion(q)}
                  className="w-full text-left text-sm text-slate-300 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-amber-500/30 rounded-lg px-4 py-2.5 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => <Message key={i} message={msg} />)}

        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Loader2 size={16} className="text-amber-400 animate-spin" />
            </div>
            <div className="bg-slate-800 border border-slate-700/50 rounded-2xl px-4 py-3">
              <p className="text-sm text-slate-400">Searching election records...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-700/50 pt-4">
        {showFilters && (
          <div className="flex gap-3 mb-3">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-sm text-slate-300 rounded-lg px-3 py-2 focus:border-amber-500/50 focus:outline-none"
            >
              <option value="">All Years</option>
              {[2026, 2021, 2016, 2011, 2006].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              value={party}
              onChange={(e) => setParty(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-sm text-slate-300 rounded-lg px-3 py-2 focus:border-amber-500/50 focus:outline-none"
            >
              <option value="">All Parties</option>
              {['DMK', 'AIADMK', 'BJP', 'INC', 'PMK', 'NTK', 'TVK', 'AMMK'].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
              showFilters
                ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle filters"
          >
            Filters
          </button>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about candidates, parties, constituencies..."
            className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
            disabled={loading}
            minLength={8}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={loading || question.trim().length < 8}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-black font-medium rounded-lg px-4 py-2.5 transition-colors flex items-center gap-2"
          >
            <Send size={16} />
          </button>
        </form>
        <p className="text-[10px] text-slate-600 mt-2 text-center">
          Powered by deterministic RAG over official election affidavit data. No LLM hallucinations — every answer is grounded in source records.
        </p>
      </div>
    </div>
  );
}
