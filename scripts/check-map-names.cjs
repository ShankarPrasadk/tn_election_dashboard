const geo = JSON.parse(require('fs').readFileSync('public/data/tn-constituencies.geojson','utf8'));
const elec = JSON.parse(require('fs').readFileSync('public/data/elections-2021.json','utf8'));

const norm = s => (s || '').toUpperCase().replace(/\s*\(.*?\)\s*/g,'').trim();

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

const canonicalize = n => { const k = norm(n); return MAP[k] || k; };

const geoCanon = new Set(geo.features.map(f => canonicalize(f.properties.AC_NAME)));
const elecNames = Object.values(elec.constituencies).map(c => norm(c.name));

const stillMissing = elecNames.filter(n => !geoCanon.has(n));
console.log('After mapping, still unmatched:', stillMissing.length);
stillMissing.forEach(n => console.log('  ', n));

const geoList = geo.features.map(f => canonicalize(f.properties.AC_NAME));
const elecSet = new Set(elecNames);
const geoStillMissing = [...new Set(geoList)].filter(n => !elecSet.has(n));
console.log('\nGeo features still unmatched:', geoStillMissing.length);
geoStillMissing.forEach(n => console.log('  ', n));
