import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, GeoJSON, TileLayer, useMap } from 'react-leaflet';
import { Search, ChevronDown, Trophy, Vote, Users, X } from 'lucide-react';
import { PARTY_COLORS } from '../data/electionData';
import { PY_PARTY_COLORS } from '../data/pyElectionData';
import { useElectionState } from '../context/StateContext';
import { supabase } from '../lib/supabase';
import 'leaflet/dist/leaflet.css';

const YEAR_OPTIONS = [2021, 2016];

const PARTY_MAP_COLORS = {
  DMK: '#e11d48',
  ADMK: '#16a34a',
  AIADMK: '#16a34a',
  AINRC: '#22c55e',
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
  let n = (name || '').toUpperCase().trim();
  // Strip reservation markers (SC), (ST) — including malformed ones like "(SC"
  n = n.replace(/\s*\(?\b(SC|ST)\b\)?\s*/g, ' ').trim();
  // Expand parenthesized directional labels: "Coimbatore(North)" → "COIMBATORE NORTH"
  n = n.replace(/\(([^)]+)\)/g, ' $1');
  // Collapse multiple spaces
  n = n.replace(/\s+/g, ' ').trim();
  return n;
}

// Normalize spelling variants so GeoJSON names match election data names
function canonicalize(name) {
  const n = normalizeConstituencyName(name);
  const MAP = {
    'ARAKKONAM': 'ARAKONAM',
    'ARANTHANGI': 'ARANTANGI',
    'ARUPPUKKOTTAI': 'ARUPPUKOTTAI',
    'CHEPAUK-THIRUVALLIKEN': 'CHEPAUK-THIRUVALLIKENI',
    'DR.RADHAKRISHNAN NAGA': 'DR. RADHAKRISHNAN NAGAR',
    'EDAPPADI': 'EDAPADI',
    'GUDIYATTAM': 'GUDIYATHAM',
    'GUMMIDIPOONDI': 'GUMMIDIPUNDI',
    'KILVAITHINANKUPPAM': 'KILVAITHINANKUPPAM',
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

function FlyToBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.flyToBounds(bounds, { padding: [30, 30], maxZoom: 10, duration: 0.5 });
  }, [bounds, map]);
  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const { stateCode, config } = useElectionState();
  const isPY = stateCode === 'PY';
  const [year, setYear] = useState(2021);
  const [geojson, setGeojson] = useState(null);
  const [electionData, setElectionData] = useState(null);
  const [voterData, setVoterData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedBounds, setSelectedBounds] = useState(null);
  const [colorMode, setColorMode] = useState('party'); // 'party' | 'voters'
  const geoJsonRef = useRef(null);

  // Load data
  useEffect(() => {
    if (isPY) {
      fetch('/data/py-constituencies.geojson').then(r => r.json()).then(setGeojson).catch(() => setGeojson(null));
    } else {
      fetch('/data/tn-constituencies.geojson').then(r => r.json()).then(setGeojson);
      fetch('/data/tn-voter-roll-2026.json').then(r => r.json()).then(setVoterData).catch(() => {});
    }
  }, [stateCode]);

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

  // Voter data lookup by constituency number
  const voterLookup = useMemo(() => {
    if (!voterData?.constituencies) return new Map();
    const map = new Map();
    voterData.constituencies.forEach(c => map.set(c.no, c));
    return map;
  }, [voterData]);

  // Voter density range for choropleth
  const voterRange = useMemo(() => {
    if (!voterData?.constituencies?.length) return { min: 100000, max: 700000 };
    const voters = voterData.constituencies.map(c => c.totalVoters);
    return { min: Math.min(...voters), max: Math.max(...voters) };
  }, [voterData]);

  function getVoterColor(totalVoters) {
    const t = Math.max(0, Math.min(1, (totalVoters - voterRange.min) / (voterRange.max - voterRange.min)));
    // Blue gradient: light → dark
    const r = Math.round(30 + (1 - t) * 170);
    const g = Math.round(60 + (1 - t) * 130);
    const b = Math.round(120 + t * 135);
    return `rgb(${r}, ${g}, ${b})`;
  }

  // GeoJSON AC_NO → election name for features with duplicate polygon names
  const AC_NO_MAP = {
    140: 'TIRUCHIRAPALLI WEST',
    141: 'TIRUCHIRAPALLI EAST',
  };

  // Match GeoJSON feature → election data
  function getFeatureResult(feature) {
    const acNo = feature.properties?.AC_NO;
    if (AC_NO_MAP[acNo]) {
      return resultLookup.get(AC_NO_MAP[acNo]) || null;
    }
    const name = canonicalize(feature.properties?.AC_NAME);
    return resultLookup.get(name) || null;
  }

  function getWinner(result) {
    if (!result?.candidates) return null;
    return result.candidates.find(c => c.winner) || result.candidates[0] || null;
  }

  // Style each constituency polygon
  function style(feature) {
    const isSelected = selected?.properties?.AC_NO === feature.properties?.AC_NO;
    const acNo = feature.properties?.AC_NO;

    if (colorMode === 'voters') {
      const voter = voterLookup.get(acNo);
      const color = voter ? getVoterColor(voter.totalVoters) : '#374151';
      return {
        fillColor: color,
        fillOpacity: isSelected ? 0.95 : 0.75,
        color: isSelected ? '#fff' : '#0f172a',
        weight: isSelected ? 3 : 0.8,
      };
    }

    const result = getFeatureResult(feature);
    const winner = getWinner(result);
    const color = winner ? getPartyColor(winner.party) : '#374151';

    return {
      fillColor: color,
      fillOpacity: isSelected ? 0.9 : 0.6,
      color: isSelected ? '#fff' : '#1e293b',
      weight: isSelected ? 3 : 1,
    };
  }

  // Event handlers
  function onEachFeature(feature, layer) {
    const name = feature.properties?.AC_NAME || '';
    const acNo = feature.properties?.AC_NO;
    const result = getFeatureResult(feature);
    const winner = getWinner(result);
    const voter = voterLookup.get(acNo);

    let tip;
    if (colorMode === 'voters' && voter) {
      tip = `${name} — ${voter.totalVoters.toLocaleString('en-IN')} voters`;
    } else {
      tip = winner ? `${name} — ${winner.party}` : name;
    }
    layer.bindTooltip(tip, { sticky: true, className: 'map-tooltip', direction: 'top', offset: [0, -10] });

    layer.on({
      mouseover: () => {
        layer.setStyle({ fillOpacity: 0.75, weight: 2, color: '#e2e8f0' });
        layer.bringToFront();
      },
      mouseout: () => {
        if (geoJsonRef.current) geoJsonRef.current.resetStyle(layer);
      },
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
        const district = (f.properties?.DIST_NAME || f.properties?.DISTRICT || '').toLowerCase();
        return name.includes(q) || district.includes(q);
      })
      .slice(0, 8);
  }, [geojson, search]);

  // When a search result is clicked, find the layer and fly to it
  const handleSelectFromSearch = useCallback((feature) => {
    setSelected(feature);
    setSearch('');
    // Find bounds from GeoJSON feature geometry
    if (feature.geometry) {
      try {
        const L = window.L || (geoJsonRef.current && geoJsonRef.current._map && window.L);
        if (L) {
          const layer = L.geoJSON(feature);
          setSelectedBounds(layer.getBounds());
        }
      } catch { /* ignore */ }
    }
  }, []);

  // Selected constituency details
  const selectedResult = selected ? getFeatureResult(selected) : null;
  const selectedWinner = selectedResult ? getWinner(selectedResult) : null;

  // Party wins summary (for legend)
  const partyWins = useMemo(() => {
    if (!electionData) return [];
    const wins = {};
    Object.values(electionData.constituencies).forEach(c => {
      const w = c.candidates?.find(x => x.winner);
      if (w) wins[w.party] = (wins[w.party] || 0) + 1;
    });
    return Object.entries(wins).sort((a, b) => b[1] - a[1]);
  }, [electionData]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-4">
      <style>{`
        .map-tooltip {
          background: #1e293b;
          color: #e2e8f0;
          border: 1px solid #334155;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 12px;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }
        .map-tooltip::before { border-top-color: #334155; }
      `}</style>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Constituency Map</h1>
          <p className="text-slate-400 text-sm mt-1">Interactive map of {config.name}'s {config.totalSeats} assembly constituencies</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Color mode toggle */}
          <div className="flex glass rounded-lg p-0.5">
            <button
              onClick={() => setColorMode('party')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${colorMode === 'party' ? 'bg-amber-500/20 text-amber-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Party
            </button>
            <button
              onClick={() => setColorMode('voters')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${colorMode === 'voters' ? 'bg-cyan-500/20 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Voters
            </button>
          </div>

          {colorMode === 'party' && (
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
          )}

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
                  const acNo = f.properties.AC_NO;
                  const result = getFeatureResult(f);
                  const winner = getWinner(result);
                  const voter = voterLookup.get(acNo);
                  return (
                    <button
                      key={acNo}
                      onClick={() => handleSelectFromSearch(f)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-700 text-sm flex items-center gap-2"
                    >
                      {colorMode === 'party' && winner && (
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getPartyColor(winner.party) }} />
                      )}
                      {colorMode === 'voters' && (
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: voter ? getVoterColor(voter.totalVoters) : '#374151' }} />
                      )}
                      <span className="text-white">{f.properties.AC_NAME}</span>
                      <span className="text-slate-500 text-xs ml-auto">
                        {colorMode === 'voters' && voter ? voter.totalVoters.toLocaleString('en-IN') : f.properties.DIST_NAME}
                      </span>
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
        <div className="flex-1 glass rounded-xl overflow-hidden" style={{ minHeight: 500 }}>
          {geojson && (
            <MapContainer
              center={isPY ? [11.93, 79.83] : [10.8, 78.8]}
              zoom={isPY ? 12 : 7}
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
                key={`${stateCode}-${year}-${colorMode}`}
                data={geojson}
                style={style}
                onEachFeature={onEachFeature}
              />
              <FlyToBounds bounds={selectedBounds} />
            </MapContainer>
          )}
        </div>

        {/* Info Panel */}
        <div className="w-full lg:w-80 space-y-4">
          {selected ? (
            <>
              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-bold text-white">{selected.properties.AC_NAME}</h2>
                  <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-700">
                    <X size={16} />
                  </button>
                </div>
                <p className="text-slate-400 text-sm">{selected.properties.DIST_NAME} District • {selectedResult?.type === 'SC' ? 'SC Reserved' : selectedResult?.type === 'ST' ? 'ST Reserved' : 'General'}</p>

                {/* Voter Data Card */}
                {(() => {
                  const voter = voterLookup.get(selected.properties?.AC_NO);
                  return voter ? (
                    <div className="mt-3 p-3 rounded-lg bg-cyan-500/[0.06] border border-cyan-500/10">
                      <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-semibold mb-2">2026 Electoral Roll</p>
                      <p className="text-xl font-bold text-white tabular-nums">{voter.totalVoters.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-slate-500 mb-2">registered voters</p>
                      <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500/80 to-blue-500" style={{ width: `${100 - voter.femalePercent}%` }} />
                        <div className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-pink-500/80 to-pink-500" style={{ width: `${voter.femalePercent}%` }} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-blue-400 font-medium">Male</p>
                          <p className="text-white font-semibold tabular-nums">{voter.maleVoters.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-pink-400 font-medium">Female</p>
                          <p className="text-white font-semibold tabular-nums">{voter.femaleVoters.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">{voter.femalePercent}% female • {voter.thirdGender} third gender</p>
                    </div>
                  ) : null;
                })()}

                {/* Election Winner */}
                {selectedResult && selectedWinner && (
                  <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: `${getPartyColor(selectedWinner.party)}15`, borderLeft: `3px solid ${getPartyColor(selectedWinner.party)}` }}>
                    <div className="flex items-center gap-2">
                      <Trophy size={14} className="text-amber-400" />
                      <span className="text-xs text-slate-400 uppercase font-medium">Winner ({year})</span>
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

                {selectedResult && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="glass rounded-lg p-2 text-center">
                      <Vote size={14} className="mx-auto text-blue-400 mb-1" />
                      <p className="text-white font-semibold">{selectedResult.turnout_percent}%</p>
                      <p className="text-slate-500 text-xs">Turnout</p>
                    </div>
                    <div className="glass rounded-lg p-2 text-center">
                      <Users size={14} className="mx-auto text-purple-400 mb-1" />
                      <p className="text-white font-semibold">{selectedResult.num_candidates}</p>
                      <p className="text-slate-500 text-xs">Candidates</p>
                    </div>
                  </div>
                )}
              </div>

              {/* All candidates */}
              {selectedResult && (
              <div className="glass rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">All Candidates ({year})</h3>
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
              )}
            </>
          ) : (
            <div className="glass rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <Search size={20} className="text-slate-500" />
              </div>
              <p className="text-slate-400 text-sm">Click on a constituency or search to view {colorMode === 'voters' ? 'voter data' : 'election results'}</p>
            </div>
          )}

          {/* Legend */}
          <div className="glass rounded-xl p-4">
            {colorMode === 'voters' ? (
              <>
                <p className="text-xs text-slate-500 uppercase font-medium mb-3">Voter Density</p>
                <div className="h-3 rounded-full overflow-hidden mb-2" style={{
                  background: `linear-gradient(90deg, ${getVoterColor(voterRange.min)}, ${getVoterColor((voterRange.min + voterRange.max) / 2)}, ${getVoterColor(voterRange.max)})`,
                }} />
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{Math.round(voterRange.min / 1000)}K</span>
                  <span>Registered Voters</span>
                  <span>{Math.round(voterRange.max / 1000)}K</span>
                </div>
                {voterData && (
                  <div className="mt-4 space-y-1.5">
                    <p className="text-[10px] text-slate-500 uppercase font-medium">State Summary</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Total Voters</span>
                      <span className="text-white font-medium">{(voterData.totalVoters / 10000000).toFixed(2)} Cr</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-400">Male</span>
                      <span className="text-white font-medium">{(voterData.maleVoters / 10000000).toFixed(2)} Cr</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-pink-400">Female</span>
                      <span className="text-white font-medium">{(voterData.femaleVoters / 10000000).toFixed(2)} Cr</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-xs text-slate-500 uppercase font-medium mb-2">Party Colors</p>
                <div className="grid grid-cols-2 gap-1">
                  {(isPY ? ['AINRC', 'BJP', 'INC', 'DMK', 'AIADMK', 'IND'] : ['DMK', 'AIADMK', 'BJP', 'INC', 'PMK', 'NTK', 'DMDK', 'IND']).map(p => (
                    <div key={p} className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: getPartyColor(p) }} />
                      <span className="text-slate-400">{p}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {colorMode === 'party' && partyWins.length > 0 && (
              <>
                <p className="text-xs text-slate-500 uppercase font-medium mt-4 mb-2">{year} Seats Won</p>
                {partyWins.slice(0, 10).map(([party, seats]) => (
                  <div key={party} className="flex items-center gap-2 py-0.5">
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: getPartyColor(party) }} />
                    <span className="text-slate-300 text-xs flex-1">{party}</span>
                    <div className="flex-1 bg-slate-800 rounded-full h-1.5 mx-1">
                      <div className="h-1.5 rounded-full" style={{ width: `${(seats / config.totalSeats) * 100}%`, backgroundColor: getPartyColor(party) }} />
                    </div>
                    <span className="text-white text-xs font-semibold w-6 text-right">{seats}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
