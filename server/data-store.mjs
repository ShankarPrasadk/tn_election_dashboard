import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateCandidateId, normalizeName, normalizeText } from '../src/data/candidateUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const datasetPath = path.resolve(__dirname, '../public/data/tn-candidate-directory.json');

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

export async function loadDataset() {
  if (!cachedDatasetPromise) {
    cachedDatasetPromise = fs.readFile(datasetPath, 'utf8').then((raw) => {
      const payload = JSON.parse(raw);
      return {
        ...payload,
        entries: payload.entries.map(enrichEntry),
      };
    });
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