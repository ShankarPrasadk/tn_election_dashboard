/**
 * Seed Supabase with TN Election Dashboard data
 *
 * Usage:
 *   node scripts/seed-supabase.mjs
 *
 * Requires SUPABASE_URL and SUPABASE_KEY env vars (or uses defaults below).
 * Run supabase-schema.sql in Supabase SQL Editor FIRST.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fywnanexremftzavylkz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error('Set SUPABASE_KEY env var (use service_role key or anon key with RLS disabled)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function readJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8'));
}

// Batch upsert helper (Supabase max ~1000 rows per request)
async function batchUpsert(table, rows, batchSize = 500) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from(table).upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`Error inserting into ${table} (batch ${i}-${i + batch.length}):`, error.message);
      throw error;
    }
    inserted += batch.length;
    process.stdout.write(`\r  ${table}: ${inserted}/${rows.length}`);
  }
  console.log();
}

// ── 1. Seed constituencies ──────────────────────────────────
async function seedConstituencies() {
  console.log('Seeding constituencies...');
  const meta = readJSON('public/data/constituency-meta.json');
  const seen = new Set();
  const rows = [];
  for (const c of Object.values(meta)) {
    const key = c.name.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({
      name: c.name,
      district: c.district,
      type: c.type || 'GEN',
      sub_region: c.sub_region || null,
      description: c.description || null,
      electors_2016: c.electors?.['2016'] || null,
      electors_2021: c.electors?.['2021'] || null,
    });
  }

  // Use name as conflict target (upsert by name)
  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    const { error } = await supabase.from('constituencies').upsert(batch, { onConflict: 'name' });
    if (error) throw new Error(`constituencies: ${error.message}`);
  }
  console.log(`  constituencies: ${rows.length} rows`);
}

// ── 2. Seed candidates ──────────────────────────────────────
async function seedCandidates() {
  console.log('Seeding candidates...');
  const dir = readJSON('public/data/tn-candidate-directory.json');
  const rows = dir.entries.map((e) => ({
    id: e.id,
    year: e.year,
    name: e.name,
    party: e.party,
    constituency: e.constituency,
    district: e.district,
    reserved: e.reserved || null,
    status: e.status,
    criminal_cases: typeof e.criminalCases === 'number' ? e.criminalCases : null,
    criminal_cases_text: e.criminalCasesText || null,
    education: e.education || null,
    assets_text: e.assetsText || null,
    liabilities_text: e.liabilitiesText || null,
    assets_crores: e.assetsCrores != null ? e.assetsCrores : null,
    liabilities_crores: e.liabilitiesCrores != null ? e.liabilitiesCrores : null,
    age_text: e.ageText || null,
    voter_enrollment: e.voterEnrollment || null,
    self_profession: e.selfProfession || null,
    spouse_profession: e.spouseProfession || null,
    photo: e.photo || null,
    source: e.source || null,
    votes: e.votes != null ? e.votes : null,
    vote_share: e.voteShare != null ? e.voteShare : null,
    margin: e.margin != null ? e.margin : null,
  }));
  await batchUpsert('candidates', rows);
}

// ── 3. Seed election results ────────────────────────────────
async function seedElectionResults() {
  console.log('Seeding election results...');
  const rows = [];
  const seen = new Set();
  for (const year of [2016, 2021]) {
    const filePath = `public/data/elections-${year}.json`;
    if (!fs.existsSync(path.join(root, filePath))) {
      console.log(`  Skipping ${filePath} (not found)`);
      continue;
    }
    const data = readJSON(filePath);
    for (const [, c] of Object.entries(data.constituencies)) {
      const key = `${year}:${c.name.toUpperCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({
        year,
        constituency: c.name,
        district: c.district || null,
        type: c.type || null,
        total_votes: c.total_votes || null,
        electors: c.electors || null,
        turnout_percent: c.turnout_percent || null,
        num_candidates: c.num_candidates || null,
        candidates: c.candidates || [],
      });
    }
  }

  // Batch upsert with composite unique (year, constituency)
  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    const { error } = await supabase
      .from('election_results')
      .upsert(batch, { onConflict: 'year,constituency' });
    if (error) throw new Error(`election_results: ${error.message}`);
  }
  console.log(`  election_results: ${rows.length} rows`);
}

// ── 4. Seed curated profiles ────────────────────────────────
async function seedCuratedProfiles() {
  console.log('Seeding curated profiles...');

  // Read and evaluate the profiles JS file (can't import directly due to Vite-specific imports)
  const filePath = path.join(root, 'src/data/candidateProfiles.js');
  let src = fs.readFileSync(filePath, 'utf8');
  // Remove the Supabase import and export keywords so it can be eval'd
  src = src.replace(/^import\s.*$/gm, '');
  src = src.replace(/^export\s+(const|function|async)/gm, '$1');
  // Extract just CANDIDATE_PROFILES array (before the Supabase loader section)
  const match = src.match(/const CANDIDATE_PROFILES\s*=\s*\[/);
  if (!match) throw new Error('Could not find CANDIDATE_PROFILES in source');

  // Use Function constructor to evaluate the code safely
  const evalCode = `
    ${src.substring(0, src.indexOf('// ── Supabase-backed loaders'))}
    return CANDIDATE_PROFILES;
  `;
  const profiles = new Function(evalCode)();

  const rows = profiles.map((p) => ({
    id: p.id,
    name: p.name,
    full_name: p.fullName || null,
    party: p.party,
    constituency: p.constituency || null,
    district: p.district || null,
    role: p.role || null,
    designation: p.designation || null,
    dob: p.dob || null,
    age: p.age || null,
    gender: p.gender || null,
    education: p.education || null,
    religion: p.religion || null,
    photo: p.photo || null,        // generateAvatarUrl already resolved at import
    bio: p.bio || null,
    career: p.career || [],
    achievements: p.achievements || [],
    controversies: p.controversies || [],
    family: p.family || {},
    assets: p.assets || {},
    criminal_cases: p.criminalCases || 0,
    social_media: p.socialMedia || {},
    electoral_history: p.electoralHistory || [],
    tags: p.tags || [],
  }));

  await batchUpsert('curated_profiles', rows);
}

// ── Run all ─────────────────────────────────────────────────
async function main() {
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log('Starting seed...\n');

  await seedConstituencies();
  await seedCandidates();
  await seedElectionResults();
  await seedCuratedProfiles();

  console.log('\n✓ All data seeded successfully!');
  console.log('Now run supabase-rls.sql in the SQL Editor to enable Row Level Security.');
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
