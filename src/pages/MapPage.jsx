import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, GeoJSON, TileLayer } from 'react-leaflet';
import { Search, ChevronDown, Trophy, Vote, Users } from 'lucide-react';
import { PARTY_COLORS } from '../data/electionData';
import { supabase } from '../lib/supabase';
import 'leaflet/dist/leaflet.css';

const YEAR_OPTIONS = [2021, 2016];

const PARTY_MAP_COLORS = {
  DMK: '#e11d48',
  ADMK: '#16a34a',
  AIADMK: '#16a34a',
  INC: '#3b82f6',
  BJP: '#f97316',
  PMK: '#eab308',
  VCK: '#7c3aed',
  CPI: '#dc2626',
  'CPI(M)': '#b91c1c',
  CPM: '#b91c1c',
  DMDK: '#8b5cf6',
  NTK: '#06b6d4',
  IUML: '#059669',
  MDMK: '#0ea5e9',
  TMC: '#14b8a6',
  AMMK: '#65a30d',
  MNM: '#ec4899',
  TVK: '#0284c7',
  IND: '#6b7280',
};

function getPartyColor(party) {
  return PARTY_MAP_COLORS[party] || PARTY_COLORS[party] || '#94a3b8';
}

function normalizeConstituencyName(name) {
  return (name || '').toUpperCase().replace(/\s*\(.*?\)\s*/g, '').trim();
}

// Normalize spelling variants so GeoJSON names match election data names
function canonicalize(name) {
  const n = normalizeConstituencyName(name);
  const MAP = {
    'ARAKKONAM': 'ARAKONAM',
    'ARANTHANGI': 'ARANTANGI',
    'ARUPPUKKOTTAI': 'ARUPPUKOTTAI',
    'CHEPAUK-THIRUVALLIKEN': 'CHEPAUK-THIRUVALLIKENI',
    'COIMBATORE': 'COIMBATORE SOUTH',
    'DR.RADHAKRISHNAN NAGA': 'DR. RADHAKRISHNAN NAGAR',
    'EDAPPADI': 'EDAPADI',
    'GUDIYATTAM': 'GUDIYATHAM',
    'GUMMIDIPOONDI': 'GUMMIDIPUNDI',
    'KILVAITHINANKUPPAM(SC': 'KILVAITHINANKUPPAM',
    'MADURANTAKAM': 'MADURANTHAKAM',
    'METTUPPALAYAM': 'METTUPALAYAM',
    'MODAKKURICHI': 'MODAKURICHI',
    'MUDHUKULATHUR': 'MUDUKULATHUR',
    'NILAKKOTTAI': 'NILAKOTTAI',
    'ORATHANADU': 'ORATHANAD',
    'PALACODU': 'PALACODE',
    'PALAYAMKOTTAI': 'PALAYAMCOTTAI',
    'RISHIVANDIYAM': 'RISHIVANDIAM',
    'SENTHAMANGALAM': 'SENDAMANGALAM',
    'SHOLINGUR': 'SHOLINGHUR',
    'SIRKAZHI': 'SIRKALI',
    'THIRUTHURAIPOONDI': 'THIRUTHURAIPUNDI',
    'THIRUVERUMBUR': 'THIRUVERAMBUR',
    'THIRUVIDAIMARUDUR': 'THIRUVIDAMARUDUR',
    'THIYAGARAYANAGAR': 'THEAYAGARAYA NAGAR',
    'TIRUCHENGODU': 'TIRUCHENGODE',
    'TIRUCHIRAPPALLI': 'TIRUCHIRAPALLI',
    'TIRUVOTTIYUR': 'THIRUVOTTIYUR',
    'UDUMALAIPETTAI': 'UDUMALPET',
    'ULUNDURPETTAI': 'ULUNDURPET',
    'VANIYAMBADI': 'VANIAYAMBADI',
    'VILUPPURAM': 'VILLUPURAM',
  };
  return MAP[n] || n;
}

export default function MapPage() {
  const navigate = useNavigate();
  const [year, setYear] = useState(2021);
  const [geojson, setGeojson] = useState(null);
  const [electionData, setElectionData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const geoJsonRef = useRef(null);

  // Load data
  useEffect(() => {
    fetch('/data/tn-constituencies.geojson').then(r => r.json()).then(setGeojson);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('election_results')
          .select('*')
          .eq('year', year);
        if (error || !data?.length) throw new Error(error?.message || 'empty');
        // Reshape to match legacy format: { constituencies: { [name]: {...} } }
        const constituencies = {};
        data.forEach((row) => {
          constituencies[row.constituency] = {
            name: row.constituency,
            district: row.district,
            type: row.type,
            total_votes: row.total_votes,
            electors: row.electors,
            turnout_percent: Number(row.turnout_percent),
            num_candidates: row.num_candidates,
            candidates: row.candidates,
          };
        });
        setElectionData({ constituencies });
      } catch {
        // Fallback to static JSON
        fetch(`/data/elections-${year}.json`)
          .then(r => r.ok ? r.json() : null)
          .then(setElectionData)
          .catch(() => setElectionData(null));
      }
    })();
    setSelected(null);
  }, [year]);

  // Build lookup: normalized constituency name → election result
  const resultLookup = useMemo(() => {
    if (!electionData) return new Map();
    const map = new Map();
    for (const [id, c] of Object.entries(electionData.constituencies)) {
      map.set(normalizeConstituencyName(c.name), { id, ...c });
    }
    return map;
  }, [electionData]);

  // Match GeoJSON feature → election data
  function getFeatureResult(feature) {
    const name = canonicalize(feature.properties?.AC_NAME);
    return resultLookup.get(name) || null;
  }

  function getWinner(result) {
    if (!result?.candidates) return null;
    return result.candidates.find(c => c.winner) || result.candidates[0] || null;
  }

  // Style each constituency polygon
  function style(feature) {
    const result = getFeatureResult(feature);
    const winner = getWinner(result);
    const color = winner ? getPartyColor(winner.party) : '#374151';
    const isHovered = hoveredId === feature.properties?.AC_NO;
    const isSelected = selected?.properties?.AC_NO === feature.properties?.AC_NO;

    return {
      fillColor: color,
      fillOpacity: isSelected ? 0.9 : isHovered ? 0.75 : 0.6,
      color: isSelected ? '#fff' : isHovered ? '#e2e8f0' : '#1e293b',
      weight: isSelected ? 3 : isHovered ? 2 : 1,
    };
  }

  // Event handlers
  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: () => setHoveredId(feature.properties?.AC_NO),
      mouseout: () => setHoveredId(null),
      click: () => {
        setSelected(feature);
        setSearch('');
      },
    });
  }

  // Search filter
  const filteredFeatures = useMemo(() => {
    if (!geojson || !search.trim()) return [];
    const q = search.toLowerCase();
    return geojson.features
      .filter(f => {
        const name = (f.properties?.AC_NAME || '').toLowerCase();
        const district = (f.properties?.DIST_NAME || '').toLowerCase();
        return name.includes(q) || district.includes(q);
      })
      .slice(0, 8);
  }, [geojson, search]);

  // Selected constituency details
  const selectedResult = selected ? getFeatureResult(selected) : null;
  const selectedWinner = selectedResult ? getWinner(selectedResult) : null;

  return (
    <div className="max-w-[1400px] mx-auto space-y-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Constituency Map</h1>
          <p className="text-slate-400 text-sm mt-1">Interactive map of Tamil Nadu's 234 assembly constituencies</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="appearance-none bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 pr-8 text-white text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            >
              {YEAR_OPTIONS.map(y => (
                <option key={y} value={y}>{y} Election</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search constituency..."
              className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-slate-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 w-56"
            />
            {filteredFeatures.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-[1000] max-h-60 overflow-y-auto">
                {filteredFeatures.map(f => {
                  const result = getFeatureResult(f);
                  const winner = getWinner(result);
                  return (
                    <button
                      key={f.properties.AC_NO}
                      onClick={() => { setSelected(f); setSearch(''); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-700 text-sm flex items-center gap-2"
                    >
                      {winner && (
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getPartyColor(winner.party) }} />
                      )}
                      <span className="text-white">{f.properties.AC_NAME}</span>
                      <span className="text-slate-500 text-xs ml-auto">{f.properties.DIST_NAME}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Map */}
        <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden" style={{ minHeight: 500 }}>
          {geojson && (
            <MapContainer
              center={[10.8, 78.8]}
              zoom={7}
              style={{ height: '70vh', minHeight: 500, width: '100%', background: '#0f172a' }}
              zoomControl={true}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                attribution=""
              />
              <GeoJSON
                ref={geoJsonRef}
                key={`${year}-${hoveredId}-${selected?.properties?.AC_NO}`}
                data={geojson}
                style={style}
                onEachFeature={onEachFeature}
              />
            </MapContainer>
          )}
        </div>

        {/* Info Panel */}
        <div className="w-full lg:w-80 space-y-4">
          {selected && selectedResult ? (
            <>
              <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
                <h2 className="text-lg font-bold text-white">{selected.properties.AC_NAME}</h2>
                <p className="text-slate-400 text-sm">{selected.properties.DIST_NAME} District • {selectedResult.type === 'SC' ? 'SC Reserved' : selectedResult.type === 'ST' ? 'ST Reserved' : 'General'}</p>

                {selectedWinner && (
                  <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: `${getPartyColor(selectedWinner.party)}15`, borderLeft: `3px solid ${getPartyColor(selectedWinner.party)}` }}>
                    <div className="flex items-center gap-2">
                      <Trophy size={14} className="text-amber-400" />
                      <span className="text-xs text-slate-400 uppercase font-medium">Winner</span>
                    </div>
                    <p className="text-white font-semibold mt-1">{selectedWinner.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${getPartyColor(selectedWinner.party)}30`, color: getPartyColor(selectedWinner.party) }}>
                        {selectedWinner.party}
                      </span>
                      <span className="text-slate-400 text-xs">{selectedWinner.votes?.toLocaleString()} votes ({selectedWinner.vote_share}%)</span>
                    </div>
                    {selectedWinner.margin && (
                      <p className="text-emerald-400 text-xs mt-1">Won by {selectedWinner.margin.toLocaleString()} votes ({selectedWinner.margin_percent}%)</p>
                    )}
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                    <Vote size={14} className="mx-auto text-blue-400 mb-1" />
                    <p className="text-white font-semibold">{selectedResult.turnout_percent}%</p>
                    <p className="text-slate-500 text-xs">Turnout</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                    <Users size={14} className="mx-auto text-purple-400 mb-1" />
                    <p className="text-white font-semibold">{selectedResult.num_candidates}</p>
                    <p className="text-slate-500 text-xs">Candidates</p>
                  </div>
                </div>
              </div>

              {/* All candidates */}
              <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">All Candidates</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {selectedResult.candidates
                    .filter(c => c.party !== 'NOTA')
                    .map((c, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-2 rounded-lg text-sm ${c.winner ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-800/50'}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 text-slate-500 text-xs text-right flex-shrink-0">{i + 1}</span>
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getPartyColor(c.party) }} />
                        <div className="min-w-0">
                          <p className={`truncate ${c.winner ? 'text-emerald-300 font-medium' : 'text-white'}`}>{c.name}</p>
                          <p className="text-slate-500 text-xs">{c.party}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-slate-300 text-xs">{c.votes?.toLocaleString()}</p>
                        <p className="text-slate-500 text-xs">{c.vote_share}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <Search size={20} className="text-slate-500" />
              </div>
              <p className="text-slate-400 text-sm">Click on a constituency or search to view election results</p>

              {/* Legend */}
              <div className="mt-6 text-left">
                <p className="text-xs text-slate-500 uppercase font-medium mb-2">Party Colors</p>
                <div className="grid grid-cols-2 gap-1">
                  {['DMK', 'AIADMK', 'BJP', 'INC', 'PMK', 'NTK', 'DMDK', 'IND'].map(p => (
                    <div key={p} className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: getPartyColor(p) }} />
                      <span className="text-slate-400">{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary stats */}
              {electionData && (
                <div className="mt-4 text-left">
                  <p className="text-xs text-slate-500 uppercase font-medium mb-2">{year} Results</p>
                  {(() => {
                    const partyWins = {};
                    Object.values(electionData.constituencies).forEach(c => {
                      const w = c.candidates?.find(x => x.winner);
                      if (w) partyWins[w.party] = (partyWins[w.party] || 0) + 1;
                    });
                    return Object.entries(partyWins)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 8)
                      .map(([party, seats]) => (
                        <div key={party} className="flex items-center gap-2 py-1">
                          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: getPartyColor(party) }} />
                          <span className="text-slate-300 text-xs flex-1">{party}</span>
                          <span className="text-white text-xs font-semibold">{seats}</span>
                        </div>
                      ));
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
