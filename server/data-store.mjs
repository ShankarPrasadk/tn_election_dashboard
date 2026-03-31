import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

import { generateCandidateId, normalizeName, normalizeText } from '../src/data/candidateUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const datasetPath = path.resolve(__dirname, '../public/data/tn-candidate-directory.json');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://fywnanexremftzavylkz.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

let cachedDatasetPromise;

function buildSearchDocument(entry) {
  return [
    entry.name,
    entry.party,
    entry.constituency,
    entry.district,
    entry.education,
    entry.status,
    entry.bio,
    entry.criminalCasesText,
    entry.assetsText,
    entry.liabilitiesText,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function enrichEntry(entry) {
  return {
    ...entry,
    id: entry.id || generateCandidateId(entry.name, entry.party, entry.constituency, entry.year),
    normalizedName: normalizeName(entry.name),
    normalizedParty: normalizeName(entry.party),
    normalizedConstituency: normalizeName(entry.constituency),
    normalizedDistrict: normalizeName(entry.district),
    searchDocument: buildSearchDocument(entry),
  };
}

function rowToCandidate(row) {
  return {
    id: row.id,
    year: row.year,
    name: row.name,
    party: row.party,
    constituency: row.constituency,
    district: row.district,
    reserved: row.reserved,
    status: row.status,
    criminalCases: row.criminal_cases,
    criminalCasesText: row.criminal_cases_text,
    education: row.education,
    assetsText: row.assets_text,
    liabilitiesText: row.liabilities_text,
    assetsCrores: row.assets_crores != null ? Number(row.assets_crores) : null,
    liabilitiesCrores: row.liabilities_crores != null ? Number(row.liabilities_crores) : null,
    ageText: row.age_text,
    voterEnrollment: row.voter_enrollment,
    selfProfession: row.self_profession,
    spouseProfession: row.spouse_profession,
    photo: row.photo,
    source: row.source,
    votes: row.votes,
    voteShare: row.vote_share != null ? Number(row.vote_share) : null,
    margin: row.margin,
  };
}

async function loadFromSupabase() {
  if (!SUPABASE_ANON_KEY) return null;
  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await sb.from('candidates').select('*').order('year', { ascending: false });
    if (error || !data?.length) return null;
    return {
      generated: new Date().toISOString(),
      totalEntries: data.length,
      entries: data.map(rowToCandidate),
    };
  } catch {
    return null;
  }
}

export async function loadDataset() {
  if (!cachedDatasetPromise) {
    cachedDatasetPromise = (async () => {
      // Try Supabase first, fall back to static JSON file
      const sbData = await loadFromSupabase();
      const payload = sbData || JSON.parse(await fs.readFile(datasetPath, 'utf8'));
      return {
        ...payload,
        entries: payload.entries.map(enrichEntry),
      };
    })();
  }

  return cachedDatasetPromise;
}

export async function reloadDataset() {
  cachedDatasetPromise = null;
  return loadDataset();
}

export async function listAvailableFilters() {
  const dataset = await loadDataset();

  const years = [...new Set(dataset.entries.map((entry) => entry.year))].sort((left, right) => right - left);
  const parties = [...new Set(dataset.entries.map((entry) => normalizeText(entry.party)).filter(Boolean))].sort();
  const constituencies = [...new Set(dataset.entries.map((entry) => normalizeText(entry.constituency)).filter(Boolean))].sort();

  return { years, parties, constituencies };
}

function scoreEntry(entry, queryTokens) {
  if (!queryTokens.length) {
    return 0;
  }

  return queryTokens.reduce((score, token) => {
    if (entry.normalizedName.includes(token)) {
      return score + 6;
    }

    if (entry.normalizedConstituency.includes(token)) {
      return score + 5;
    }

    if (entry.normalizedParty.includes(token)) {
      return score + 4;
    }

    if (entry.normalizedDistrict.includes(token)) {
      return score + 3;
    }

    if (entry.searchDocument.includes(token)) {
      return score + 1;
    }

    return score;
  }, 0);
}

export async function searchCandidates(filters = {}) {
  const dataset = await loadDataset();
  const normalizedQuery = normalizeName(filters.query || '');
  const queryTokens = normalizedQuery ? normalizedQuery.split(' ').filter(Boolean) : [];
  const normalizedParty = normalizeName(filters.party || '');
  const normalizedConstituency = normalizeName(filters.constituency || '');
  const year = filters.year ? Number(filters.year) : null;
  const limit = Math.max(1, Math.min(Number(filters.limit) || 20, 100));
  const offset = Math.max(0, Number(filters.offset) || 0);

  const matched = dataset.entries
    .filter((entry) => !year || entry.year === year)
    .filter((entry) => !normalizedParty || entry.normalizedParty === normalizedParty)
    .filter((entry) => !normalizedConstituency || entry.normalizedConstituency === normalizedConstituency)
    .map((entry) => ({
      ...entry,
      _score: scoreEntry(entry, queryTokens),
    }))
    .filter((entry) => !queryTokens.length || entry._score > 0)
    .sort((left, right) => right._score - left._score || right.year - left.year || left.name.localeCompare(right.name));

  return {
    total: matched.length,
    offset,
    limit,
    items: matched.slice(offset, offset + limit),
  };
}

export async function getCandidateById(id) {
  const dataset = await loadDataset();
  return dataset.entries.find((entry) => entry.id === id) || null;
}