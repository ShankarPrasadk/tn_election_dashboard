import { useEffect, useState, useMemo, useCallback } from 'react';
import { Search, MapPin, Users, ChevronRight, Star, StarOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PartyBadge } from '../components/UIComponents';
import { CANDIDATES_2026 } from '../data/candidates2026';
import { PY_CANDIDATES_2026 } from '../data/pyElectionData';
import { loadCandidateDirectory } from '../data/candidateDirectory';
import { generateCandidateId } from '../data/candidateUtils';
import { ConstituencyCard } from '../components/ConstituencyCard';
import { ExportDropdown, exportCSV } from '../components/DataExport';
import VoterCheckWidget from '../components/VoterCheckWidget';
import { useI18n } from '../i18n';
import { useElectionState } from '../context/StateContext';

const PARTY_ORDER = ['DMK', 'AIADMK', 'AINRC', 'BJP', 'NTK', 'TVK', 'INC', 'PMK', 'AMMK', 'CPI', 'CPI(M)', 'VCK', 'LJK', 'NMK', 'DMDK', 'MDMK', 'IUML'];

export default function ConstituencyPage() {
  const [search, setSearch] = useState('');
  const { t } = useI18n();
  const { stateCode, config } = useElectionState();
  const isPY = stateCode === 'PY';
  const candidates2026 = isPY ? PY_CANDIDATES_2026 : CANDIDATES_2026;
  const [districtFilter, setDistrictFilter] = useState('All');
  const [directoryIds, setDirectoryIds] = useState(new Set());
  const [savedConstituency, setSavedConstituency] = useState(() => {
    try { return localStorage.getItem(`${stateCode}-my-constituency`) || ''; } catch { return ''; }
  });
  const [shareCard, setShareCard] = useState(null);

  const handleSave = useCallback((name) => {
    const next = savedConstituency === name ? '' : name;
    setSavedConstituency(next);
    try { localStorage.setItem(`${stateCode}-my-constituency`, next); } catch {}
  }, [savedConstituency]);

  useEffect(() => {
    loadCandidateDirectory(stateCode).then((dir) => {
      setDirectoryIds(new Set((dir?.entries || []).map((e) => e.id)));
    }).catch(() => {});
  }, []);

  const districts = useMemo(
    () => ['All', ...new Set(candidates2026.map((s) => s.district).filter(Boolean).sort())],
    [candidates2026]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return candidates2026.filter((seat) => {
      if (districtFilter !== 'All' && seat.district !== districtFilter) return false;
      if (!q) return true;
      if (seat.constituency.toLowerCase().includes(q)) return true;
      if (seat.district?.toLowerCase().includes(q)) return true;
      return Object.values(seat.candidates).some(
        (name) => name && name !== 'TBD' && name.toLowerCase().includes(q)
      );
    });
  }, [search, districtFilter]);

  const resolveId = (name, party, constituency) => {
    const id = generateCandidateId(name, party, constituency, 2026);
    return directoryIds.has(id) ? id : null;
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <MapPin className="text-amber-400" /> {t('constituency.title')}
        </h1>
        <p className="text-slate-400 mt-1">
          Look up your constituency to see all announced 2026 candidates. {candidates2026.length} constituencies across {config.name}.
        </p>
      </div>

      {/* Saved Constituency Banner */}
      {savedConstituency && (() => {
        const saved = candidates2026.find((s) => s.constituency === savedConstituency);
        return saved ? (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
            <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider mb-1">⭐ Your Constituency</p>
            <ConstituencyCard constituency={saved.constituency} candidates={saved.candidates} district={saved.district} no={saved.no} />
          </div>
        ) : null;
      })()}

      <VoterCheckWidget />

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search constituency, district, or candidate name..."
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
          />
        </div>
        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-sm text-slate-300 rounded-lg px-3 py-2.5 focus:border-amber-500/50 focus:outline-none"
        >
          {districts.map((d) => (
            <option key={d} value={d}>{d === 'All' ? 'All Districts' : d}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{filtered.length} of {candidates2026.length} constituencies</p>
        <ExportDropdown
          data={filtered.map((s) => ({ no: s.no, constituency: s.constituency, district: s.district, reserved: s.reserved || '', ...s.candidates }))}
          filename={`${stateCode.toLowerCase()}-2026-constituencies`}
        />
      </div>

      {/* Constituency Cards */}
      <div className="space-y-4">
        {filtered.map((seat) => {
          const parties = Object.entries(seat.candidates).filter(([, name]) => name && name !== 'TBD');
          return (
            <div key={seat.no} className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-amber-400 text-sm font-normal">#{seat.no}</span>
                    {seat.constituency}
                    {seat.reserved && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                        {seat.reserved}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{seat.district} District</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Users size={14} />
                    {parties.length} candidates
                  </div>
                  <button
                    onClick={() => handleSave(seat.constituency)}
                    className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                    title={savedConstituency === seat.constituency ? 'Remove from saved' : 'Set as My Constituency'}
                  >
                    {savedConstituency === seat.constituency
                      ? <Star size={16} className="text-amber-400 fill-amber-400" />
                      : <StarOff size={16} className="text-slate-600 hover:text-amber-400" />}
                  </button>
                  <button
                    onClick={() => setShareCard(shareCard === seat.no ? null : seat.no)}
                    className="px-2 py-1 rounded-lg text-[10px] text-slate-400 hover:text-white bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                  >
                    Share
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {PARTY_ORDER.map((party) => {
                  const name = seat.candidates[party];
                  if (!name || name === 'TBD') return null;
                  const candidateId = resolveId(name, party, seat.constituency);
                  const content = (
                    <div className="flex items-center justify-between gap-2 glass rounded-lg px-3 py-2 hover:border-amber-500/30 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{name}</p>
                        <PartyBadge party={party} />
                      </div>
                      <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />
                    </div>
                  );
                  return candidateId ? (
                    <Link key={party} to={`/candidate/${candidateId}`}>{content}</Link>
                  ) : (
                    <div key={party}>{content}</div>
                  );
                })}
                {/* Remaining parties not in PARTY_ORDER */}
                {Object.entries(seat.candidates)
                  .filter(([party, name]) => name && name !== 'TBD' && !PARTY_ORDER.includes(party))
                  .map(([party, name]) => (
                    <div key={party} className="flex items-center justify-between gap-2 glass rounded-lg px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{name}</p>
                        <PartyBadge party={party} />
                      </div>
                    </div>
                  ))}
              </div>
              {shareCard === seat.no && (
                <div className="mt-3">
                  <ConstituencyCard constituency={seat.constituency} candidates={seat.candidates} district={seat.district} no={seat.no} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <MapPin className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-400">{t('constituency.noMatch')}</p>
          <p className="text-xs text-slate-500 mt-1">{t('constituency.tryDifferent')}</p>
        </div>
      )}
    </div>
  );
}
