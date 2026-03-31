import { readFileSync } from 'fs';

const d = JSON.parse(readFileSync('public/data/tn-candidate-directory.json', 'utf8'));
console.log('=== CANDIDATE DIRECTORY ===');
console.log('Entries:', d.entries.length);
console.log('Fields:', Object.keys(d.entries[0]));
console.log('Sample:', JSON.stringify(d.entries[0], null, 2));

const e = JSON.parse(readFileSync('public/data/elections-2021.json', 'utf8'));
const ckeys = Object.keys(e.constituencies);
console.log('\n=== ELECTION RESULTS ===');
console.log('Constituencies:', ckeys.length);
const first = e.constituencies[ckeys[0]];
console.log('Fields:', Object.keys(first));
console.log('Candidate fields:', Object.keys(first.candidates[0]));

const m = JSON.parse(readFileSync('public/data/constituency-meta.json', 'utf8'));
const mkeys = Object.keys(m);
console.log('\n=== CONSTITUENCY META ===');
console.log('Count:', mkeys.length);
console.log('Fields:', Object.keys(m[mkeys[0]]));
console.log('Sample:', JSON.stringify(m[mkeys[0]], null, 2));

// Also check curated profiles
const { candidateProfiles } = await import('../src/data/candidateProfiles.js');
console.log('\n=== CURATED PROFILES ===');
console.log('Count:', candidateProfiles.length);
console.log('Fields:', Object.keys(candidateProfiles[0]));
