import { normalizeName, normalizeText } from '../src/data/candidateUtils.js';

const REQUEST_HEADERS = {
  accept: 'application/json',
  'user-agent': 'TN-Election-Dashboard/1.0 (public-profile-enrichment)',
};

const enrichmentCache = new Map();
const labelCache = new Map();

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean).map((value) => normalizeText(value)).filter(Boolean))];
}

function formatIsoDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function parseTimeClaim(entity, propertyId) {
  const claimValue = entity?.claims?.[propertyId]?.[0]?.mainsnak?.datavalue?.value?.time;
  if (!claimValue) {
    return null;
  }

  const normalized = String(claimValue).replace(/^\+/, '');
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

function parseStringClaim(entity, propertyId) {
  const values = entity?.claims?.[propertyId] || [];
  return values
    .map((claim) => claim?.mainsnak?.datavalue?.value)
    .map((value) => (typeof value === 'string' ? normalizeText(value) : null))
    .filter(Boolean)[0] || null;
}

function parseEntityIds(entity, propertyId) {
  return uniqueValues(
    (entity?.claims?.[propertyId] || []).map((claim) => claim?.mainsnak?.datavalue?.value?.id)
  );
}

function buildCommonsImageUrl(fileName) {
  if (!fileName) {
    return null;
  }

  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: REQUEST_HEADERS });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return response.json();
}

function scoreSearchResult(candidate, result) {
  const candidateName = normalizeName(candidate.name);
  const label = normalizeName(result.label);
  const description = normalizeName(result.description);
  const aliases = (result.aliases || []).map((alias) => normalizeName(alias));
  const candidateTokens = candidateName.split(' ').filter((token) => token.length > 1);
  const tokenOverlap = candidateTokens.filter((token) => label.includes(token)).length;
  const exactName = label === candidateName || aliases.includes(candidateName);
  const politicianProfile = /politician|mla|member of legislative assembly|actor|lawyer|minister|chief minister/.test(description);

  let score = 0;

  if (exactName) {
    score += 14;
  }

  score += tokenOverlap * 3;

  if (politicianProfile) {
    score += 5;
  }

  if (description.includes('tamil nadu') || description.includes('indian')) {
    score += 2;
  }

  if (candidate.constituency && description.includes(normalizeName(candidate.constituency))) {
    score += 3;
  }

  return {
    exactName,
    politicianProfile,
    score,
    tokenOverlap,
  };
}

async function searchWikidataCandidate(candidate) {
  const queries = uniqueValues([
    candidate.name,
    `${candidate.name} Tamil Nadu politician`,
  ]);
  const rankedResults = [];

  for (const query of queries) {
    const payload = await fetchJson(`https://www.wikidata.org/w/api.php?action=wbsearchentities&language=en&format=json&limit=6&search=${encodeURIComponent(query)}`);

    (payload.search || []).forEach((result) => {
      const ranking = scoreSearchResult(candidate, result);
      rankedResults.push({
        ...result,
        ...ranking,
      });
    });
  }

  const bestMatch = rankedResults
    .sort((left, right) => right.score - left.score)
    .find((result) => result.exactName || (result.score >= 13 && result.politicianProfile && result.tokenOverlap >= 2));

  return bestMatch || null;
}

async function fetchEntityLabels(ids) {
  const missingIds = ids.filter((id) => id && !labelCache.has(id));

  if (missingIds.length > 0) {
    const payload = await fetchJson(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&languages=en&props=labels&ids=${encodeURIComponent(missingIds.join('|'))}`);

    Object.entries(payload.entities || {}).forEach(([id, entity]) => {
      labelCache.set(id, entity?.labels?.en?.value || null);
    });
  }

  return ids.map((id) => labelCache.get(id)).filter(Boolean);
}

async function fetchWikipediaSummary(title) {
  if (!title) {
    return null;
  }

  try {
    return await fetchJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`);
  } catch (_error) {
    return null;
  }
}

async function buildWikidataEnrichment(candidate, match) {
  const entityPayload = await fetchJson(`https://www.wikidata.org/wiki/Special:EntityData/${match.id}.json`);
  const entity = entityPayload.entities?.[match.id];

  if (!entity) {
    return null;
  }

  const wikipediaTitle = entity.sitelinks?.enwiki?.title || null;
  const wikipediaSummary = await fetchWikipediaSummary(wikipediaTitle);
  const genderLabels = await fetchEntityLabels(parseEntityIds(entity, 'P21'));
  const occupationLabels = await fetchEntityLabels(parseEntityIds(entity, 'P106'));
  const positionLabels = await fetchEntityLabels(parseEntityIds(entity, 'P39'));
  const residenceLabels = await fetchEntityLabels(parseEntityIds(entity, 'P551'));
  const birthplaceLabels = await fetchEntityLabels(parseEntityIds(entity, 'P19'));
  const officialWebsite = parseStringClaim(entity, 'P856');
  const xHandle = parseStringClaim(entity, 'P2002');
  const wikimediaImage = entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value || null;

  const publicLinks = [
    wikipediaTitle
      ? {
          label: 'Wikipedia',
          type: 'biography',
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(wikipediaTitle.replace(/ /g, '_'))}`,
        }
      : null,
    {
      label: 'Wikidata',
      type: 'structured-data',
      url: `https://www.wikidata.org/wiki/${match.id}`,
    },
    officialWebsite
      ? {
          label: 'Official website',
          type: 'official',
          url: officialWebsite,
        }
      : null,
    xHandle
      ? {
          label: 'X profile',
          type: 'social',
          url: `https://x.com/${xHandle.replace(/^@/, '')}`,
        }
      : null,
  ].filter(Boolean);

  return {
    found: true,
    provider: 'wikipedia-wikidata',
    description: normalizeText(wikipediaSummary?.description || match.description || ''),
    summary: normalizeText(wikipediaSummary?.extract || ''),
    photo: wikipediaSummary?.thumbnail?.source || buildCommonsImageUrl(wikimediaImage),
    photoSourceLabel: wikipediaSummary?.thumbnail?.source ? 'Wikipedia' : wikimediaImage ? 'Wikimedia Commons' : null,
    birthDate: formatIsoDate(parseTimeClaim(entity, 'P569')),
    gender: genderLabels[0] || null,
    occupations: occupationLabels,
    positionsHeld: positionLabels,
    residence: residenceLabels[0] || null,
    birthplace: birthplaceLabels[0] || null,
    publicLinks,
    sourceNote: 'Additional public profile matched from Wikipedia and Wikidata when a confident entity match was found.',
  };
}

async function fetchCandidateEnrichment(candidate) {
  const match = await searchWikidataCandidate(candidate);

  if (!match) {
    return {
      found: false,
      provider: null,
      publicLinks: [],
      sourceNote: 'No verified Wikipedia or Wikidata profile was found for this candidate, so the page falls back to election disclosure data.',
    };
  }

  const enrichment = await buildWikidataEnrichment(candidate, match);

  return enrichment || {
    found: false,
    provider: null,
    publicLinks: [],
    sourceNote: 'Public profile lookup did not return a usable biography for this candidate.',
  };
}

export async function getCandidateEnrichment(candidate) {
  const cacheKey = candidate.id || `${normalizeName(candidate.name)}-${candidate.year}`;

  if (!enrichmentCache.has(cacheKey)) {
    enrichmentCache.set(
      cacheKey,
      fetchCandidateEnrichment(candidate).catch((error) => {
        console.error(`Failed to enrich candidate ${candidate.name}:`, error.message);
        return {
          found: false,
          provider: null,
          publicLinks: [],
          sourceNote: 'Live public-source enrichment is temporarily unavailable. Election disclosure data is still shown below.',
        };
      })
    );
  }

  return enrichmentCache.get(cacheKey);
}