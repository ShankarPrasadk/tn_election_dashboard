import { useEffect, useState } from 'react';
import { Search, Vote, Users, ExternalLink, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PartyBadge } from '../components/UIComponents';
import { PARTY_COLORS } from '../data/electionData';
import { CANDIDATES_2026, ALLIANCE_2026, VOTER_STATS_2026, OPINION_POLLS_2026 } from '../data/candidates2026';
import { CANDIDATE_PROFILES, findCandidateProfile } from '../data/candidateProfiles';
import { getCandidateRouteId, loadCandidateDirectory } from '../data/candidateDirectory';
import { generateCandidateId } from '../data/candidateUtils';

const SPA_PARTIES = ['DMK', 'INC', 'VCK', 'CPI', 'CPI(M)', 'DMDK', 'MDMK', 'IUML'];
const NDA_PARTIES = ['AIADMK', 'BJP', 'PMK', 'AMMK'];
const HISTORICAL_PAGE_SIZE = 50;

export default function CandidatesPage() {
  const [search, setSearch] = useState('');
  const [partyFilter, setPartyFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('2026');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [historicalYearFilter, setHistoricalYearFilter] = useState('All');
  const [historicalPage, setHistoricalPage] = useState(1);
  const [directory, setDirectory] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    loadCandidateDirectory()
      .then((data) => {
        if (active) {
          setDirectory(data);
        }
      })
      .catch((error) => {
        if (active) {
          setLoadError(error.message || 'Failed to load candidate directory');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setHistoricalPage(1);
  }, [search, partyFilter, sortBy, historicalYearFilter]);

  const directoryEntries = directory?.entries || [];
  const historicalEntries = directoryEntries.filter((entry) => entry.year !== 2026);
  const totalDirectoryRecords = directoryEntries.length;
  const historicalDirectoryRecords = historicalEntries.length;
  const historicalParties = ['All', ...new Set(historicalEntries.map((entry) => entry.party))].sort();
  const historicalYears = ['All', ...new Set(historicalEntries.map((entry) => entry.year))].sort((left, right) => {
    if (left === 'All') return -1;
    if (right === 'All') return 1;
    return right - left;
  });
  const districts2026 = ['All', ...new Set(CANDIDATES_2026.map((seat) => seat.district))];

  let filteredHistorical = historicalEntries.filter((entry) => {
    const query = search.toLowerCase();
    const matchesSearch = search === '' || [entry.name, entry.constituency, entry.district, entry.party]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
    const matchesParty = partyFilter === 'All' || entry.party === partyFilter;
    const matchesYear = historicalYearFilter === 'All' || entry.year === Number(historicalYearFilter);
    return matchesSearch && matchesParty && matchesYear;
  });

  if (sortBy === 'cases') {
    filteredHistorical.sort((left, right) => (right.criminalCases || -1) - (left.criminalCases || -1));
  } else if (sortBy === 'assets') {
    filteredHistorical.sort((left, right) => (right.assetsCrores || -1) - (left.assetsCrores || -1));
  } else {
    filteredHistorical.sort((left, right) => left.name.localeCompare(right.name));
  }

  const historicalPageCount = Math.max(1, Math.ceil(filteredHistorical.length / HISTORICAL_PAGE_SIZE));
  const paginatedHistorical = filteredHistorical.slice(
    (historicalPage - 1) * HISTORICAL_PAGE_SIZE,
    historicalPage * HISTORICAL_PAGE_SIZE,
  );

  const filtered2026 = CANDIDATES_2026.filter((seat) => {
    const query = search.toLowerCase();
    const matchesSearch = search === ''
      || seat.constituency.toLowerCase().includes(query)
      || seat.district.toLowerCase().includes(query)
      || Object.values(seat.candidates).some((name) => name.toLowerCase().includes(query));
    const matchesDistrict = districtFilter === 'All' || seat.district === districtFilter;
    return matchesSearch && matchesDistrict;
  });

  const daysUntilElection = Math.ceil((new Date('2026-04-23') - new Date()) / (1000 * 60 * 60 * 24));

  function getRouteIdFor2026Candidate(name, party, constituency) {
    const curated = findCandidateProfile(name);
    return curated?.id || generateCandidateId(name, party, constituency, 2026);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Candidate Profiles</h1>
          <p className="text-slate-400 mt-1">
            {viewMode === '2026'
              ? `2026 Election - All 234 constituencies • Polling: April 23, 2026 ${daysUntilElection > 0 ? `(${daysUntilElection} days away)` : ''}`
              : 'Historical affidavit directory with public criminal, education, assets, and liability disclosures'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('2026')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === '2026' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <Vote size={14} className="inline mr-1.5" />
            2026 Candidates
          </button>
          <button
            onClick={() => setViewMode('historical')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'historical' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <Users size={14} className="inline mr-1.5" />
            2006-2021 Directory
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-800/80 via-slate-800/60 to-amber-500/10 border border-slate-700/60 rounded-2xl p-4 lg:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">Public Data Coverage</p>
            <p className="text-white text-lg font-semibold mt-1">
              {totalDirectoryRecords ? `${totalDirectoryRecords.toLocaleString()} candidate records loaded across 2006-2026` : 'Loading candidate directory...'}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {historicalDirectoryRecords
                ? `${historicalDirectoryRecords.toLocaleString()} historical affidavit records are available in the directory view.`
                : 'Historical affidavit records will appear here once the directory finishes loading.'}
            </p>
            {loadError && <p className="text-sm text-red-400 mt-2">{loadError}</p>}
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(directory?.countsByYear || {}).map(([year, count]) => (
              <span key={year} className="px-3 py-2 rounded-xl border border-slate-600/60 bg-slate-900/40 text-sm text-slate-200">
                <span className="text-slate-400 mr-2">{year}</span>
                <span className="font-semibold text-white">{Number(count).toLocaleString()}</span>
              </span>
            ))}
          </div>
        </div>

        {viewMode === '2026' && historicalDirectoryRecords > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-slate-300">
              Historical candidates are available now. Switch views to browse every public affidavit record from 2006 to 2021.
            </p>
            <button
              onClick={() => setViewMode('historical')}
              className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 text-sm font-semibold hover:bg-amber-400 transition-colors"
            >
              Open Historical Directory
            </button>
          </div>
        )}
      </div>

      {viewMode === '2026' ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-4">
              <p className="text-xs text-amber-400 uppercase">Total Voters</p>
              <p className="text-xl font-bold text-white">{(VOTER_STATS_2026.totalVoters / 10000000).toFixed(2)} Cr</p>
              <p className="text-xs text-slate-400 mt-1">{VOTER_STATS_2026.changeFromPrevious}% from 2021</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4">
              <p className="text-xs text-blue-400 uppercase">Constituencies</p>
              <p className="text-xl font-bold text-white">234</p>
              <p className="text-xs text-slate-400 mt-1">Single member</p>
            </div>
            <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-4">
              <p className="text-xs text-red-400 uppercase">SPA (DMK-led)</p>
              <p className="text-lg font-bold text-white">CM: M.K. Stalin</p>
              <p className="text-xs text-slate-400 mt-1">{ALLIANCE_2026.SPA.parties.length} parties</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-4">
              <p className="text-xs text-green-400 uppercase">NDA (AIADMK-led)</p>
              <p className="text-lg font-bold text-white">CM: E.K. Palaniswami</p>
              <p className="text-xs text-slate-400 mt-1">{ALLIANCE_2026.NDA.parties.length} parties</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-red-400 mb-3 uppercase">Secular Progressive Alliance (SPA)</h3>
              <div className="space-y-2">
                {ALLIANCE_2026.SPA.parties.map((party) => (
                  <div key={party.party} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PARTY_COLORS[party.party] || '#6b7280' }} />
                      <span className="text-slate-300">{party.party}</span>
                    </div>
                    <span className="text-white font-medium">{party.seats} seats</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-green-400 mb-3 uppercase">AIADMK-led Alliance (NDA)</h3>
              <div className="space-y-2">
                {ALLIANCE_2026.NDA.parties.map((party) => (
                  <div key={party.party} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PARTY_COLORS[party.party] || '#6b7280' }} />
                      <span className="text-slate-300">{party.party}</span>
                    </div>
                    <span className="text-white font-medium">{party.seats} seats</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-amber-400 mb-1 uppercase tracking-wider">CM Candidates & Key Figures</h3>
            <p className="text-xs text-slate-500 mb-4">Every 2026 candidate row below now links to a profile page. Featured leaders retain richer curated dossiers.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {CANDIDATE_PROFILES.slice(0, 4).map((profile) => {
                const partyColor = PARTY_COLORS[profile.party] || '#6b7280';
                return (
                  <Link key={profile.id} to={`/candidate/${profile.id}`} className="group relative overflow-hidden rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-slate-900/50">
                    <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: `linear-gradient(135deg, ${partyColor}, transparent)` }} />
                    <div className="relative p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 group-hover:ring-4 transition-all flex-shrink-0" style={{ ringColor: `${partyColor}50` }}>
                          <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-white font-bold truncate group-hover:text-amber-300 transition-colors">{profile.name}</h4>
                          <PartyBadge party={profile.party} />
                        </div>
                      </div>
                      <p className="text-xs font-medium mb-1" style={{ color: partyColor }}>{profile.role}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin size={10} />
                        <span>{profile.constituency}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">{profile.bio.substring(0, 100)}...</p>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink size={14} className="text-slate-400" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-purple-400 mb-3 uppercase">Opinion Polls</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="text-left p-2">Agency</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-center p-2">SPA</th>
                    <th className="text-center p-2">AIADMK+</th>
                    <th className="text-center p-2">TVK</th>
                    <th className="text-center p-2">Sample</th>
                  </tr>
                </thead>
                <tbody>
                  {OPINION_POLLS_2026.map((poll, index) => (
                    <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-800/80">
                      <td className="p-2 text-white">{poll.agency}</td>
                      <td className="p-2 text-slate-400">{new Date(poll.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                      <td className="p-2 text-center"><span className="text-red-400 font-medium">{poll.seats.SPA}</span></td>
                      <td className="p-2 text-center"><span className="text-green-400 font-medium">{poll.seats['AIADMK+']}</span></td>
                      <td className="p-2 text-center"><span className="text-sky-400 font-medium">{poll.seats.TVK}</span></td>
                      <td className="p-2 text-center text-slate-400">{poll.sampleSize.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search constituency, candidate name, district..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <select
              value={districtFilter}
              onChange={(event) => setDistrictFilter(event.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              {districts2026.map((district) => <option key={district} value={district}>{district}</option>)}
            </select>
          </div>

          <p className="text-sm text-slate-400">{filtered2026.length} constituencies found</p>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/50">
                  <tr className="text-slate-400">
                    <th className="text-left p-3 font-medium">#</th>
                    <th className="text-left p-3 font-medium">Constituency</th>
                    <th className="text-left p-3 font-medium">District</th>
                    <th className="text-left p-3 font-medium">SPA</th>
                    <th className="text-left p-3 font-medium">NDA</th>
                    <th className="text-left p-3 font-medium">NTK</th>
                    <th className="text-left p-3 font-medium">TVK</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered2026.map((seat) => {
                    const spaParty = Object.keys(seat.candidates).find((party) => SPA_PARTIES.includes(party));
                    const ndaParty = Object.keys(seat.candidates).find((party) => NDA_PARTIES.includes(party));

                    return (
                      <tr key={seat.no} className="border-t border-slate-700/30 hover:bg-slate-800/80">
                        <td className="p-3 text-slate-400">{seat.no}</td>
                        <td className="p-3">
                          <span className="text-white font-medium">{seat.constituency}</span>
                          {seat.reserved && <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">{seat.reserved}</span>}
                        </td>
                        <td className="p-3 text-slate-400">{seat.district}</td>
                        <td className="p-3">
                          {spaParty && (
                            <Link to={`/candidate/${getRouteIdFor2026Candidate(seat.candidates[spaParty], spaParty, seat.constituency)}`} className="text-white hover:text-amber-300 transition-colors">
                              {seat.candidates[spaParty]}
                              <span className="text-xs ml-1" style={{ color: PARTY_COLORS[spaParty] || '#6b7280' }}>({spaParty})</span>
                            </Link>
                          )}
                        </td>
                        <td className="p-3">
                          {ndaParty && (
                            <Link to={`/candidate/${getRouteIdFor2026Candidate(seat.candidates[ndaParty], ndaParty, seat.constituency)}`} className="text-white hover:text-amber-300 transition-colors">
                              {seat.candidates[ndaParty]}
                              <span className="text-xs ml-1" style={{ color: PARTY_COLORS[ndaParty] || '#6b7280' }}>({ndaParty})</span>
                            </Link>
                          )}
                        </td>
                        <td className="p-3">
                          {seat.candidates.NTK ? (
                            <Link to={`/candidate/${getRouteIdFor2026Candidate(seat.candidates.NTK, 'NTK', seat.constituency)}`} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                              {seat.candidates.NTK}
                            </Link>
                          ) : '-'}
                        </td>
                        <td className="p-3">
                          {seat.candidates.TVK ? (
                            <Link to={`/candidate/${getRouteIdFor2026Candidate(seat.candidates.TVK, 'TVK', seat.constituency)}`} className="text-sky-400 hover:text-sky-300 transition-colors">
                              {seat.candidates.TVK}
                            </Link>
                          ) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {historicalYears.filter((year) => year !== 'All').map((year) => (
              <div key={year} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <p className="text-xs text-slate-400 uppercase">{year}</p>
                <p className="text-2xl font-bold text-white">{directory?.countsByYear?.[year] || 0}</p>
                <p className="text-xs text-slate-500 mt-1">public affidavit records</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates, constituencies, districts, parties..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <select
              value={historicalYearFilter}
              onChange={(event) => setHistoricalYearFilter(event.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              {historicalYears.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
            <select
              value={partyFilter}
              onChange={(event) => setPartyFilter(event.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              {historicalParties.map((party) => <option key={party} value={party}>{party}</option>)}
            </select>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="name">Sort: Name</option>
              <option value="cases">Sort: Criminal Cases</option>
              <option value="assets">Sort: Assets</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-slate-400">
              {filteredHistorical.length.toLocaleString()} historical records found
              {historicalYearFilter === 'All' ? '' : ` for ${historicalYearFilter}`}
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/50">
                  <tr className="text-slate-400">
                    <th className="text-left p-3 font-medium">Year</th>
                    <th className="text-left p-3 font-medium">Candidate</th>
                    <th className="text-left p-3 font-medium">Constituency</th>
                    <th className="text-left p-3 font-medium">Party</th>
                    <th className="text-left p-3 font-medium">Result</th>
                    <th className="text-left p-3 font-medium">Cases</th>
                    <th className="text-left p-3 font-medium">Education</th>
                    <th className="text-left p-3 font-medium">Assets</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistorical.map((entry) => (
                    <tr key={entry.id} className="border-t border-slate-700/30 hover:bg-slate-800/80">
                      <td className="p-3 text-slate-400">{entry.year}</td>
                      <td className="p-3">
                        <Link to={`/candidate/${getCandidateRouteId(entry)}`} className="text-white hover:text-amber-300 transition-colors font-medium">
                          {entry.name}
                        </Link>
                      </td>
                      <td className="p-3 text-slate-300">
                        {entry.constituency}
                        {entry.district && <span className="text-slate-500"> • {entry.district}</span>}
                      </td>
                      <td className="p-3"><PartyBadge party={entry.party} /></td>
                      <td className="p-3">
                        {entry.status === 'Won' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">Won</span>
                            {entry.votes && <p className="text-slate-500 text-xs mt-0.5">{entry.votes.toLocaleString()} votes</p>}
                          </div>
                        ) : entry.status === 'Lost' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">Lost</span>
                            {entry.votes && <p className="text-slate-500 text-xs mt-0.5">{entry.votes.toLocaleString()} votes</p>}
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-300">{entry.criminalCasesText || '-'}</td>
                      <td className="p-3 text-slate-300">{entry.education || '-'}</td>
                      <td className="p-3 text-emerald-400">{entry.assetsText || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-slate-500">Page {historicalPage} of {historicalPageCount}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHistoricalPage((page) => Math.max(1, page - 1))}
                disabled={historicalPage === 1}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => setHistoricalPage((page) => Math.min(historicalPageCount, page + 1))}
                disabled={historicalPage === historicalPageCount}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
