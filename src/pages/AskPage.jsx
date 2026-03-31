import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle, User, Bot, Key, X, Settings } from 'lucide-react';

const SYSTEM_PROMPT = `You are the TN Election Dashboard AI Assistant — an expert on Tamil Nadu state assembly elections from 1952 to 2026.

You have deep knowledge of:
- All Tamil Nadu assembly elections (1952, 1957, 1962, 1967, 1971, 1977, 1980, 1984, 1989, 1991, 1996, 2001, 2006, 2011, 2016, 2021, 2026)
- Political parties: DMK, AIADMK, INC, BJP, TVK (Vijay's party), NTK (Seeman), PMK, VCK, CPI, CPI(M), DMDK, AMMK, MDMK, IUML, etc.
- Key leaders: M.K. Stalin, Edappadi K. Palaniswami (EPS), Vijay (TVK), Seeman (NTK), K. Annamalai (BJP TN), Udhayanidhi Stalin, and historical leaders like M.G. Ramachandran (MGR), J. Jayalalithaa, M. Karunanidhi, C.N. Annadurai, K. Kamaraj, C. Rajagopalachari
- Chief Ministers of Tamil Nadu from 1952 to present
- Alliance patterns (SPA/DMK alliance, NDA/AIADMK alliance), seat-sharing
- Anti-incumbency patterns in TN (power changed in 10 of 13 elections since 1967)
- Candidate criminal records, assets, education from election affidavits (via ECI, myneta.info, ADR)
- Constituency-level data, vote share trends, turnout statistics
- 2026 election: polling date April 23, 2026; 234 constituencies; ~5.67 crore voters
- Current alliances: SPA (DMK-led), NDA (AIADMK-led), TVK (independent), NTK (independent)

Rules:
1. Answer questions about Tamil Nadu elections accurately and concisely
2. If you don't know something specific, say so — don't make up data
3. For candidate-specific criminal/asset data, mention that data comes from self-sworn affidavits filed with ECI
4. Be politically neutral — don't endorse any party or candidate
5. Use markdown formatting for better readability (bold, lists, headers)
6. Keep answers focused and relevant to what was asked
7. You can discuss election predictions, analysis, and political history
8. For non-election questions, politely redirect to election topics`;

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

const API_KEY_STORAGE = 'tn_election_openai_key';

function formatMessage(text) {
  // Simple markdown-like formatting
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
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!apiKey) setShowKeyInput(true);
  }, [apiKey]);

  const saveApiKey = () => {
    const key = keyInput.trim();
    if (!key.startsWith('sk-')) {
      setError('Invalid API key. It should start with "sk-"');
      return;
    }
    localStorage.setItem(API_KEY_STORAGE, key);
    setApiKey(key);
    setShowKeyInput(false);
    setError('');
    inputRef.current?.focus();
  };

  const removeApiKey = () => {
    localStorage.removeItem(API_KEY_STORAGE);
    setApiKey('');
    setKeyInput('');
    setShowKeyInput(true);
    setMessages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || !apiKey) return;

    setError('');
    const userMsg = { role: 'user', content: q };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setQuestion('');
    setLoading(true);

    try {
      // Build conversation history (keep last 10 messages for context)
      const conversationHistory = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...newMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: conversationHistory,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenAI API key and try again.');
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        throw new Error(err.error?.message || `OpenAI API error (${response.status})`);
      }

      const data = await response.json();
      const assistantContent = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
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
        <button
          onClick={() => apiKey ? removeApiKey() : setShowKeyInput(true)}
          className="flex items-center gap-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-400 hover:text-white transition-colors"
          title={apiKey ? 'Change API key' : 'Set API key'}
        >
          <Settings size={14} />
          {apiKey ? 'API Key Set' : 'Set Key'}
        </button>
      </div>

      {/* API Key Input */}
      {showKeyInput && (
        <div className="mb-4 bg-slate-800/80 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Key size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Enter your OpenAI API Key</h3>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Your API key is stored only in your browser (localStorage) and sent directly to OpenAI — we never see or store it on our servers.
            Get a key from{' '}
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
              platform.openai.com/api-keys
            </a>
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="sk-..."
              className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm placeholder-slate-600 focus:border-amber-500/50 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && saveApiKey()}
            />
            <button
              onClick={saveApiKey}
              disabled={!keyInput.trim()}
              className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black font-medium rounded-lg px-4 py-2 text-sm transition-colors"
            >
              Save
            </button>
            {apiKey && (
              <button
                onClick={() => setShowKeyInput(false)}
                className="text-slate-400 hover:text-white p-2"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Bot size={32} className="text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">TN Election AI Assistant</h2>
            <p className="text-sm text-slate-400 mb-6 max-w-md">
              Ask anything about Tamil Nadu elections — history, candidates, parties, alliances, predictions, criminal records, and more. Powered by OpenAI.
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
            placeholder={apiKey ? 'Ask anything about TN elections...' : 'Set your OpenAI API key first...'}
            className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
            disabled={loading || !apiKey}
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={loading || !question.trim() || !apiKey}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-black font-medium rounded-lg px-4 py-2.5 transition-colors flex items-center gap-2"
          >
            <Send size={16} />
          </button>
        </form>
        <p className="text-[10px] text-slate-600 mt-2 text-center">
          Powered by OpenAI GPT-4o-mini. Your API key stays in your browser only. AI responses may not be 100% accurate — verify critical data from official ECI sources.
        </p>
      </div>
    </div>
  );
}
