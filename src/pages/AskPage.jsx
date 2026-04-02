import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle, User, Bot, Trash2 } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'Who will likely win the 2026 TN election and why?',
  'What is the anti-incumbency pattern in Tamil Nadu?',
  'Compare DMK and AIADMK performance from 2006 to 2021',
  'Tell me about Vijay\'s TVK party and its prospects in 2026',
  'Who were the Chief Ministers of Tamil Nadu?',
  'What is the criminal record situation among TN candidates?',
  'Explain the alliance dynamics in Tamil Nadu politics',
  'What was the 2G scam impact on 2011 election?',
];

function formatMessage(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-white mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-white mt-3 mb-1">$1</h2>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$1. $2</li>')
    .replace(/\n/g, '<br/>');
}

function Message({ message }) {
  return (
    <div className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.role === 'assistant' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center mt-1">
          <Bot size={16} className="text-amber-400" />
        </div>
      )}
      <div className={`max-w-[85%] ${message.role === 'user' ? 'order-first' : ''}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          message.role === 'user'
            ? 'bg-amber-500/20 text-white border border-amber-500/20'
            : 'bg-slate-800 text-slate-200 border border-slate-700/50'
        }`}>
          {message.role === 'user' ? (
            <p className="text-sm leading-relaxed">{message.content}</p>
          ) : (
            <div
              className="text-sm leading-relaxed prose-invert"
              dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
            />
          )}
        </div>
      </div>
      {message.role === 'user' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mt-1">
          <User size={16} className="text-slate-300" />
        </div>
      )}
    </div>
  );
}

export default function AskPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;

    setError('');
    const userMsg = { role: 'user', content: q };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setQuestion('');
    setLoading(true);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Error ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (q) => {
    setQuestion(q);
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="text-amber-400" size={28} />
            Ask About TN Elections
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            AI-powered assistant for Tamil Nadu election data, history, and analysis (1952–2026)
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); setError(''); }}
            className="flex items-center gap-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-400 hover:text-white transition-colors"
            title="New conversation"
          >
            <Trash2 size={14} />
            New Chat
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Bot size={32} className="text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">TN Election AI Assistant</h2>
            <p className="text-sm text-slate-400 mb-6 max-w-md">
              Ask anything about Tamil Nadu elections — history, candidates, parties, alliances, predictions, criminal records, and more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggestion(q)}
                  className="text-left text-sm text-slate-300 glass hover:bg-white/[0.06] hover:border-amber-500/30 rounded-lg px-4 py-2.5 transition-all"
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
              <p className="text-sm text-slate-400">Thinking...</p>
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
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about TN elections..."
            className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
            disabled={loading}
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-black font-medium rounded-lg px-4 py-2.5 transition-colors flex items-center gap-2"
          >
            <Send size={16} />
          </button>
        </form>
        <p className="text-[10px] text-slate-600 mt-2 text-center">
          Powered by AI. Responses may not be 100% accurate — verify critical data from official ECI sources.
        </p>
      </div>
    </div>
  );
}
