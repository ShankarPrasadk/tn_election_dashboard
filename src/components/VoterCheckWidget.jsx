import { ExternalLink, ClipboardCheck } from 'lucide-react';

export default function VoterCheckWidget() {
  return (
    <div className="bg-gradient-to-r from-blue-500/5 to-slate-800/40 rounded-xl p-5 border border-blue-500/20">
      <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
        <ClipboardCheck className="text-blue-400" size={16} />
        Check Your Voter Registration
      </h3>
      <p className="text-xs text-slate-400 mb-3">
        Verify your name on the electoral roll before April 23, 2026
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href="https://electoralsearch.eci.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-medium transition-colors"
        >
          <ExternalLink size={12} /> Search on ECI (NVSP)
        </a>
        <a
          href="https://ceotn.gov.in/OnlineServices/ElectoralSearch"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-medium transition-colors"
        >
          <ExternalLink size={12} /> Search on CEO TN
        </a>
      </div>
      <p className="text-[10px] text-slate-500 mt-2">
        You'll need your Epic (Voter ID) number or personal details to search
      </p>
    </div>
  );
}
