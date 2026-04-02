import { useState, useCallback, useRef } from 'react';
import { Share2, Copy, Check, Image } from 'lucide-react';
import { PARTY_COLORS } from '../data/electionData';

/**
 * Shareable Constituency Card — generates a visual card for social sharing
 */
export function ConstituencyCard({ constituency, candidates, district, no }) {
  const cardRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const shareText = `🗳️ ${constituency} (${district}) — TN 2026 Election\n\n` +
    Object.entries(candidates).map(([party, name]) =>
      name && name !== 'TBD' ? `${party}: ${name}` : null
    ).filter(Boolean).join('\n') +
    `\n\n🔗 tn-election-dashboard.vercel.app/constituency`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [shareText]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${constituency} — TN 2026`, text: shareText });
      } catch {}
    } else {
      handleCopy();
    }
  }, [shareText, constituency, handleCopy]);

  return (
    <div className="relative">
      <div ref={cardRef} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-amber-400 font-medium">#{no} · {district}</p>
            <h3 className="text-lg font-bold text-white">{constituency}</h3>
          </div>
          <div className="flex gap-1.5">
            <button onClick={handleShare} className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors">
              <Share2 size={14} />
            </button>
            <button onClick={handleCopy} className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors">
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          {Object.entries(candidates).slice(0, 6).map(([party, name]) => (
            name && name !== 'TBD' ? (
              <div key={party} className="flex items-center gap-2 bg-slate-700/20 rounded-lg px-3 py-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PARTY_COLORS[party] || '#6b7280' }} />
                <span className="text-[10px] font-medium text-slate-300 w-14">{party}</span>
                <span className="text-xs text-white">{name}</span>
              </div>
            ) : null
          ))}
        </div>
        <p className="text-[8px] text-slate-600 mt-3 text-right">tn-election-dashboard.vercel.app</p>
      </div>
    </div>
  );
}
