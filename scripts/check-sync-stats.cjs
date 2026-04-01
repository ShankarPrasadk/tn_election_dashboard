const fs = require('node:fs');
const d = JSON.parse(fs.readFileSync('public/data/tn-candidate-directory.json', 'utf8'));
const entries = d.entries || d;
const e2026 = entries.filter(e => e.year === 2026);
const synced = e2026.filter(e => e.criminalCases !== null);
const unsynced = e2026.filter(e => e.criminalCases === null);

console.log('=== 2026 DATA SYNC STATUS ===');
console.log('Total 2026 candidates:', e2026.length);
console.log('With criminal data:', synced.length, `(${Math.round(synced.length/e2026.length*100)}%)`);
console.log('Without criminal data:', unsynced.length);
console.log();

const partyStats = {};
e2026.forEach(e => {
  const p = e.party || 'Other';
  if (!partyStats[p]) partyStats[p] = { total: 0, synced: 0, unsynced: 0 };
  partyStats[p].total++;
  if (e.criminalCases !== null) partyStats[p].synced++;
  else partyStats[p].unsynced++;
});

console.log('=== BY PARTY ===');
Object.entries(partyStats)
  .sort((a,b) => b[1].total - a[1].total)
  .slice(0, 15)
  .forEach(([party, s]) => {
    const pct = Math.round(s.synced / s.total * 100);
    console.log(`${party.padEnd(30)} Total: ${String(s.total).padStart(3)}  Synced: ${String(s.synced).padStart(3)}  Missing: ${String(s.unsynced).padStart(3)}  (${pct}%)`);
  });

console.log();
console.log('=== TOP CRIMINALS (2026) ===');
const withCases = synced.filter(e => e.criminalCases > 0);
withCases.sort((a,b) => b.criminalCases - a.criminalCases);
withCases.slice(0, 20).forEach((c, i) => {
  console.log(`${String(i+1).padStart(2)}. ${c.name.padEnd(30)} ${(c.party||'?').padEnd(10)} ${c.constituency?.padEnd(25)||''} Cases: ${c.criminalCases}`);
});

console.log();
console.log('=== ASSET DATA ===');
const withAssets = e2026.filter(e => e.assetsCrores !== null);
console.log('With asset data:', withAssets.length, `(${Math.round(withAssets.length/e2026.length*100)}%)`);
