const geo = JSON.parse(require('fs').readFileSync('public/data/tn-constituencies.geojson','utf8'));
const elec = JSON.parse(require('fs').readFileSync('public/data/elections-2021.json','utf8'));
const elec16 = JSON.parse(require('fs').readFileSync('public/data/elections-2016.json','utf8'));

// New normalization: keep directional suffixes but strip reservation markers
const norm = s => {
  let n = (s || '').toUpperCase().trim();
  // Remove (SC), (ST), (SC) etc but keep (North), (South), (East), (West)
  n = n.replace(/\s*\((SC|ST)\)\s*/gi, '').trim();
  // Normalize brackets: "Coimbatore(North)" → "COIMBATORE NORTH"
  n = n.replace(/\(([^)]+)\)/g, ' $1').replace(/\s+/g, ' ').trim();
  return n;
};

console.log('=== Checking normalization of key names ===');
['Coimbatore(North)', 'Coimbatore(South)', 'Gudiyattam (SC)', 'Sirkazhi (SC)'].forEach(n => {
  console.log(`  "${n}" → "${norm(n)}"`);
});

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
  'COIMBATORE NORTH': 'COIMBATORE NORTH',
  'COIMBATORE SOUTH': 'COIMBATORE SOUTH',
};

const canonicalize = n => { const k = norm(n); return MAP[k] || k; };

console.log('\n=== 2021 election data ===');
const geoCanon = new Set(geo.features.map(f => canonicalize(f.properties.AC_NAME)));
const elecNames = Object.values(elec.constituencies).map(c => norm(c.name));

const stillMissing = elecNames.filter(n => !geoCanon.has(n));
console.log('Unmatched election→geo:', stillMissing.length);
stillMissing.forEach(n => console.log('  ', n));

const geoList = [...new Set(geo.features.map(f => canonicalize(f.properties.AC_NAME)))];
const elecSet = new Set(elecNames);
const geoStillMissing = geoList.filter(n => !elecSet.has(n));
console.log('Unmatched geo→election:', geoStillMissing.length);
geoStillMissing.forEach(n => console.log('  ', n));

console.log('\n=== 2016 election data ===');
const elecNames16 = Object.values(elec16.constituencies).map(c => norm(c.name));
const stillMissing16 = elecNames16.filter(n => !geoCanon.has(n));
console.log('Unmatched election→geo:', stillMissing16.length);
stillMissing16.forEach(n => console.log('  ', n));

const elecSet16 = new Set(elecNames16);
const geoStillMissing16 = geoList.filter(n => !elecSet16.has(n));
console.log('Unmatched geo→election:', geoStillMissing16.length);
geoStillMissing16.forEach(n => console.log('  ', n));
