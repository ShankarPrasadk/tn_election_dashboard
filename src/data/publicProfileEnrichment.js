import { normalizeName, normalizeText } from './candidateUtils.js';

const enrichmentCache = new Map();
const labelCache = new Map();

const CURATED_TITLE_OVERRIDES = {
  'mk-stalin': 'M. K. Stalin',
  eps: 'Edappadi K. Palaniswami',
  vijay: 'Vijay (actor)',
  udhayanidhi: 'Udhayanidhi Stalin',
  seeman: 'Seeman',
  tamilisai: 'Tamilisai Soundararajan',
  ops: 'O. Panneerselvam',
  senthilbalaji: 'V. Senthil Balaji',
  thirumavalavan: 'Thol. Thirumavalavan',
  ptr: 'Palanivel Thiaga Rajan',
  sengottaiyan: 'K. A. Sengottaiyan',
  anbilmahesh: 'Anbil Mahesh Poyyamozhi',
  masubramanian: 'Ma. Subramanian',
  premalatha: 'Premalatha Vijayakant',
  nainar: 'Nainar Nagendran',
  jayakumar: 'D. Jayakumar',
  vaithialingam: 'R. Vaithilingam',
};

const CURATED_ENTITY_OVERRIDES = {
  vijay: 'Q31955',
  thirumavalavan: 'Q377312',
  vaithialingam: 'Q10978147',
  premalatha: 'Q65042731',
  aadhav: 'Q137218643',
  sowmiya: 'Q125556518',
};

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
  return (entity?.claims?.[propertyId] || [])
    .map((claim) => claim?.mainsnak?.datavalue?.value)
    .find((value) => typeof value === 'string' && normalizeText(value));
}

function parseEntityIds(entity, propertyId) {
  return uniqueValues((entity?.claims?.[propertyId] || []).map((claim) => claim?.mainsnak?.datavalue?.value?.id));
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return response.json();
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

function buildCommonsImageUrl(fileName) {
  if (!fileName) {
    return null;
  }

  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
}

async function fetchEntityLabels(ids) {
  const missingIds = ids.filter((id) => id && !labelCache.has(id));

  if (missingIds.length > 0) {
    const payload = await fetchJson(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&languages=en&props=labels&origin=*&ids=${encodeURIComponent(missingIds.join('|'))}`);

    Object.entries(payload.entities || {}).forEach(([id, entity]) => {
      labelCache.set(id, entity?.labels?.en?.value || null);
    });
  }

  return ids.map((id) => labelCache.get(id)).filter(Boolean);
}

function scoreSearchResult(candidate, result) {
  const candidateName = normalizeName(candidate.fullName || candidate.name);
  const label = normalizeName(result.label);
  const description = normalizeName(result.description);
  const aliases = (result.aliases || []).map((alias) => normalizeName(alias));
  const candidateTokens = candidateName.split(' ').filter((token) => token.length > 1);
  const tokenOverlap = candidateTokens.filter((token) => label.includes(token)).length;
  const exactName = label === candidateName || aliases.includes(candidateName);
  const politicianProfile = /politician|mla|member of legislative assembly|actor|lawyer|minister|chief minister|governor/.test(description);

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
  const overrideEntityId = CURATED_ENTITY_OVERRIDES[candidate.id];
  if (overrideEntityId) {
    return {
      id: overrideEntityId,
      label: CURATED_TITLE_OVERRIDES[candidate.id] || candidate.fullName || candidate.name,
      description: null,
      exactName: true,
      politicianProfile: true,
      score: 999,
      tokenOverlap: 99,
    };
  }

  const overrideTitle = CURATED_TITLE_OVERRIDES[candidate.id];

  const queries = uniqueValues([
    overrideTitle,
    candidate.fullName,
    candidate.name,
    `${candidate.name} Tamil Nadu politician`,
  ]);

  const rankedResults = [];

  for (const query of queries) {
    const payload = await fetchJson(`https://www.wikidata.org/w/api.php?action=wbsearchentities&language=en&format=json&limit=6&origin=*&search=${encodeURIComponent(query)}`);

    (payload.search || []).forEach((result) => {
      rankedResults.push({
        ...result,
        ...scoreSearchResult(candidate, result),
      });
    });
  }

  return rankedResults
    .sort((left, right) => right.score - left.score)
    .find((result) => result.exactName || (result.score >= 13 && result.politicianProfile && result.tokenOverlap >= 2)) || null;
}

async function buildWikidataEnrichment(candidate, match) {
  const payload = await fetchJson(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&languages=en&props=labels|claims|sitelinks&origin=*&ids=${encodeURIComponent(match.id)}`);
  const entity = payload.entities?.[match.id];

  if (!entity) {
    return null;
  }

  const wikipediaTitle = CURATED_TITLE_OVERRIDES[candidate.id] || entity.sitelinks?.enwiki?.title || null;
  const wikipediaSummary = await fetchWikipediaSummary(wikipediaTitle);
  const genderLabels = await fetchEntityLabels(parseEntityIds(entity, 'P21'));
  const occupationLabels = await fetchEntityLabels(parseEntityIds(entity, 'P106'));
  const positionLabels = await fetchEntityLabels(parseEntityIds(entity, 'P39'));
  const residenceLabels = await fetchEntityLabels(parseEntityIds(entity, 'P551'));
  const birthplaceLabels = await fetchEntityLabels(parseEntityIds(entity, 'P19'));
  const xHandle = parseStringClaim(entity, 'P2002');
  const officialWebsite = parseStringClaim(entity, 'P856');
  const wikimediaImage = entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value || null;

  return {
    found: true,
    provider: 'browser-wikipedia-wikidata',
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
    publicLinks: [
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
    ].filter(Boolean),
    sourceNote: 'Image and biography were matched directly from public Wikipedia and Wikidata sources in the browser.',
  };
}

async function fetchClientEnrichment(candidate) {
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

export async function getBrowserPublicProfile(candidate) {
  const cacheKey = candidate.id || `${normalizeName(candidate.fullName || candidate.name)}-${candidate.year || 'profile'}`;

  if (!enrichmentCache.has(cacheKey)) {
    enrichmentCache.set(
      cacheKey,
      fetchClientEnrichment(candidate).catch(() => ({
        found: false,
        provider: null,
        publicLinks: [],
        sourceNote: 'Live public-source enrichment is temporarily unavailable. Election disclosure data is still shown below.',
      }))
    );
  }

  return enrichmentCache.get(cacheKey);
}