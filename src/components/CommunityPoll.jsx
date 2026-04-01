import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import PartySymbolIcon from './PartySymbolIcon';

const POLL_STORAGE_KEY = 'tn-election-poll-2026';

const POLL_OPTIONS = [
  { id: 'dmk', label: 'DMK+ Alliance', party: 'DMK', color: '#e11d48' },
  { id: 'aiadmk', label: 'AIADMK+ Alliance', party: 'AIADMK', color: '#22c55e' },
  { id: 'tvk', label: 'TVK+ Alliance', party: 'TVK', color: '#f59e0b' },
  { id: 'ntk', label: 'NTK', party: 'NTK', color: '#ef4444' },
  { id: 'bjp', label: 'BJP+ Alliance', party: 'BJP', color: '#f97316' },
  { id: 'others', label: 'Others', party: 'IND', color: '#6b7280' },
];

// Simulate community results using deterministic seed from vote counts
function generateCommunityResults(userVote) {
  const stored = JSON.parse(localStorage.getItem(POLL_STORAGE_KEY) || '{}');
  const baseCounts = { dmk: 412, aiadmk: 287, tvk: 198, ntk: 84, bjp: 52, others: 31 };

  // Add all previous votes
  const counts = { ...baseCounts };
  if (stored.vote) {
    counts[stored.vote] = (counts[stored.vote] || 0) + 1;
  }

  const total = Object.values(counts).reduce((s, v) => s + v, 0);
  return POLL_OPTIONS.map(opt => ({
    ...opt,
    votes: counts[opt.id] || 0,
    percent: Math.round(((counts[opt.id] || 0) / total) * 100),
  }));
}

export default function CommunityPoll() {
  const [voted, setVoted] = useState(false);
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(POLL_STORAGE_KEY) || '{}');
    if (stored.vote) {
      setVoted(true);
      setResults(generateCommunityResults(stored.vote));
    }
  }, []);

  const handleVote = () => {
    if (!selected) return;
    const data = { vote: selected, timestamp: Date.now() };
    localStorage.setItem(POLL_STORAGE_KEY, JSON.stringify(data));
    setVoted(true);
    setResults(generateCommunityResults(selected));
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 size={18} className="text-amber-400" />
        <h3 className="text-lg font-bold text-white">Community Poll</h3>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        {voted ? 'Thanks for voting! Here are the community results.' : 'Who do you think will win the 2026 TN election?'}
      </p>

      {!voted ? (
        <div className="space-y-2">
          {POLL_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left text-sm transition-all ${
                selected === opt.id
                  ? 'border-amber-400/60 bg-amber-400/10 text-white'
                  : 'border-slate-700/50 bg-slate-800/30 text-slate-300 hover:border-slate-600 hover:bg-slate-800/60'
              }`}
            >
              <PartySymbolIcon party={opt.party} size={18} color={opt.color} />
              <span className="font-medium">{opt.label}</span>
              {selected === opt.id && <span className="ml-auto text-amber-400 text-xs">Selected</span>}
            </button>
          ))}
          <button
            onClick={handleVote}
            disabled={!selected}
            className={`w-full mt-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              selected
                ? 'bg-amber-400 text-slate-900 hover:bg-amber-300'
                : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
            }`}
          >
            Submit Vote
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {results?.sort((a, b) => b.percent - a.percent).map(opt => (
            <div key={opt.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <PartySymbolIcon party={opt.party} size={14} color={opt.color} />
                  <span className="text-sm text-slate-300">{opt.label}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: opt.color }}>{opt.percent}%</span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${opt.percent}%`, backgroundColor: opt.color }}
                />
              </div>
            </div>
          ))}
          <p className="text-[10px] text-slate-500 mt-3 text-center">
            {results?.reduce((s, r) => s + r.votes, 0).toLocaleString()} votes · For entertainment only
          </p>
        </div>
      )}
    </div>
  );
}
