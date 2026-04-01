import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { PartyBadge } from './UIComponents';
import PartySymbolIcon from './PartySymbolIcon';
import { PARTY_COLORS } from '../data/electionData';
import { getCandidateRouteId } from '../data/candidateDirectory';

export default function RelatedCandidates({ current, allEntries, limit = 6 }) {
  if (!current || !allEntries?.length) return null;

  const related = [];
  const currentId = current.id;
  const year = current.year || 2026;

  // Same constituency, same year (opponents)
  const opponents = allEntries.filter(
    c => c.id !== currentId && c.constituency === current.constituency && c.year === year
  );
  for (const c of opponents.slice(0, 3)) {
    related.push({ ...c, reason: 'Opponent' });
  }

  // Same party, top criminals or highest assets (notable party-mates)
  if (related.length < limit) {
    const partyMates = allEntries
      .filter(c => c.id !== currentId && c.party === current.party && c.year === year && !related.find(r => r.id === c.id))
      .sort((a, b) => (b.criminalCases || 0) - (a.criminalCases || 0))
      .slice(0, limit - related.length);
    for (const c of partyMates) {
      related.push({ ...c, reason: `${current.party} candidate` });
    }
  }

  // High-profile candidates from other parties
  if (related.length < limit) {
    const notable = allEntries
      .filter(c =>
        c.id !== currentId &&
        c.year === year &&
        c.party !== current.party &&
        !related.find(r => r.id === c.id) &&
        (c.criminalCases > 3 || c.assetsCrores > 10)
      )
      .sort((a, b) => (b.criminalCases || 0) - (a.criminalCases || 0))
      .slice(0, limit - related.length);
    for (const c of notable) {
      related.push({ ...c, reason: 'Notable candidate' });
    }
  }

  if (related.length === 0) return null;

  return (
    <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-5">
      <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
        <Users size={18} className="text-amber-400" />
        Related Candidates
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {related.slice(0, limit).map(c => {
          const routeId = getCandidateRouteId(c);
          const color = PARTY_COLORS[c.party] || '#6b7280';
          return (
            <Link
              key={c.id}
              to={`/candidate/${routeId}`}
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/60 hover:border-slate-600 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700/50 flex items-center justify-center">
                {c.photo ? (
                  <img
                    src={c.photo}
                    alt={c.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div className={`${c.photo ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
                  <PartySymbolIcon party={c.party} size={18} color={color} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate group-hover:text-amber-400 transition-colors">
                  {c.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <PartyBadge party={c.party} />
                  <span className="text-[10px] text-slate-500 truncate">{c.constituency}</span>
                </div>
                <span className="text-[9px] text-slate-500 italic">{c.reason}</span>
              </div>
              {c.criminalCases > 0 && (
                <span className="text-xs font-bold text-red-400 flex-shrink-0">{c.criminalCases}</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
