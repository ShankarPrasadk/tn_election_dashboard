import fs from 'fs';
import path from 'path';

const raw = fs.readFileSync('./public/data/tn-candidate-directory.json', 'utf8');
const data = JSON.parse(raw);

// Understand structure
console.log('Type:', typeof data, 'IsArray:', Array.isArray(data));

const entries = data.entries || data;
const c2026 = entries.filter(d => d.year === 2026 || d.year === '2026');
console.log('\nTotal entries:', entries.length);
console.log('2026 entries:', c2026.length);

// Assets audit (field: assetsCrores)
const withAssets = c2026.filter(d => d.assetsCrores != null && d.assetsCrores > 0);
withAssets.sort((a, b) => b.assetsCrores - a.assetsCrores);

console.log('\n=== TOP 30 ASSETS ===');
withAssets.slice(0, 30).forEach(c =>
  console.log(`${String(c.assetsCrores).padStart(10)} Cr | ${(c.name || '').padEnd(25)} | ${(c.party || '').padEnd(10)} | ${c.constituency || ''}`)
);

console.log('\n=== ASSET DISTRIBUTION ===');
console.log('Total with assets:', withAssets.length, '/', c2026.length);
const brackets = [[0, 1], [1, 10], [10, 50], [50, 100], [100, 500], [500, 1000], [1000, 10000]];
for (const [lo, hi] of brackets) {
  const count = withAssets.filter(c => c.assetsCrores >= lo && c.assetsCrores < hi).length;
  if (count > 0) console.log(`  ${lo}-${hi} Cr: ${count}`);
}

// Criminal audit (field: criminalCases)
const withCriminal = c2026.filter(d => d.criminalCases != null && d.criminalCases > 0);
withCriminal.sort((a, b) => b.criminalCases - a.criminalCases);
console.log('\n=== TOP 20 CRIMINAL CASES ===');
withCriminal.slice(0, 20).forEach(c =>
  console.log(`${String(c.criminalCases).padStart(5)} | ${(c.name || '').padEnd(25)} | ${(c.party || '').padEnd(10)} | ${c.constituency || ''}`)
);
console.log('Total with criminal:', withCriminal.length, '/', c2026.length);

// Duplicated values check
const assetCounts = {};
withAssets.forEach(c => {
  const v = c.assetsCrores;
  if (!assetCounts[v]) assetCounts[v] = [];
  assetCounts[v].push(c.name + ' (' + c.party + ')');
});
console.log('\n=== DUPLICATED ASSET VALUES (>2 occurrences) ===');
Object.entries(assetCounts)
  .filter(([, arr]) => arr.length > 2)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([val, names]) => {
    console.log(`  ${val} Cr (${names.length}x): ${names.slice(0, 5).join(', ')}${names.length > 5 ? '...' : ''}`);
  });

// Coverage stats
const withEducation = c2026.filter(d => d.education);
const withAge = c2026.filter(d => d.ageText);
const withPhoto = c2026.filter(d => d.photo);
console.log('\n=== COVERAGE ===');
console.log('Assets:', withAssets.length, '/', c2026.length, `(${(withAssets.length / c2026.length * 100).toFixed(1)}%)`);
console.log('Criminal:', withCriminal.length, '/', c2026.length, `(${(withCriminal.length / c2026.length * 100).toFixed(1)}%)`);
console.log('Education:', withEducation.length, '/', c2026.length, `(${(withEducation.length / c2026.length * 100).toFixed(1)}%)`);
console.log('Age:', withAge.length, '/', c2026.length, `(${(withAge.length / c2026.length * 100).toFixed(1)}%)`);
console.log('Photo:', withPhoto.length, '/', c2026.length, `(${(withPhoto.length / c2026.length * 100).toFixed(1)}%)`);

// Party-wise average assets
console.log('\n=== PARTY-WISE AVERAGE ASSETS ===');
const partyAssets = {};
withAssets.forEach(c => {
  if (!partyAssets[c.party]) partyAssets[c.party] = [];
  partyAssets[c.party].push(c.assetsCrores);
});
Object.entries(partyAssets)
  .map(([party, vals]) => ({
    party,
    count: vals.length,
    avg: vals.reduce((a, b) => a + b, 0) / vals.length,
    max: Math.max(...vals),
    min: Math.min(...vals)
  }))
  .sort((a, b) => b.avg - a.avg)
  .slice(0, 20)
  .forEach(p => {
    console.log(`  ${p.party.padEnd(20)} avg: ${p.avg.toFixed(2)} Cr  max: ${p.max.toFixed(2)} Cr  min: ${p.min.toFixed(2)} Cr  (${p.count} candidates)`);
  });

// "Awaiting" text stats
const awaitingAssets = c2026.filter(d => d.assetsText && d.assetsText.includes('Awaiting'));
const awaitingCriminal = c2026.filter(d => d.criminalCasesText && d.criminalCasesText.includes('Awaiting'));
console.log('\n=== AWAITING SYNC ===');
console.log('Assets awaiting:', awaitingAssets.length);
console.log('Criminal awaiting:', awaitingCriminal.length);
