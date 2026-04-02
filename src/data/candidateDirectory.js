import { loadCuratedProfiles, findCandidateProfile } from './candidateProfiles';
import { generateCandidateAvatarUrl, generateCandidateId, getGenericCandidateBio, normalizeName } from './candidateUtils';

let cachedProfiles = null;

async function getCuratedProfiles() {
  if (!cachedProfiles) {
    cachedProfiles = await loadCuratedProfiles();
  }
  return cachedProfiles;
}

function findCuratedMatch(entry, profiles) {
  const direct = profiles.find((p) => p.id === entry.id);
  if (direct) return direct;

  const entryName = normalizeName(entry.name);
  const entryConstituency = normalizeName(entry.constituency);

  return profiles.find((profile) => {
    const sameName = normalizeName(profile.name) === entryName || normalizeName(profile.fullName) === entryName;
    const sameConstituency = !entryConstituency || normalizeName(profile.constituency) === entryConstituency;
    return sameName && sameConstituency;
  }) || null;
}

export function enrichCandidateEntry(entry, profiles) {
  const curatedProfile = findCuratedMatch(entry, profiles);
  return {
    ...entry,
    curatedProfileId: curatedProfile?.id || null,
    photo: curatedProfile?.photo || entry.photo || generateCandidateAvatarUrl(entry.name, entry.party),
    bio: curatedProfile?.bio || entry.bio || getGenericCandidateBio(entry),
    role: curatedProfile?.role || entry.role || (entry.year === 2026 ? 'Assembly Candidate' : `${entry.year} Candidate`),
    designation: curatedProfile?.designation || entry.designation || (entry.year === 2026 ? 'Assembly election candidate' : `${entry.year} Assembly election candidate`),
    tags: curatedProfile?.tags || entry.tags || [entry.party, `${entry.year}`],
  };
}

const directoryCache = {};

export async function loadCandidateDirectory(stateCode = 'TN') {
  const key = stateCode;
  if (!directoryCache[key]) {
    directoryCache[key] = (async () => {
      const filePath = stateCode === 'PY'
        ? '/data/py-candidate-directory.json'
        : '/data/tn-candidate-directory.json';

      try {
        const resp = await fetch(filePath);
        if (!resp.ok) {
          // PY directory may not exist yet — return empty
          return { generated: new Date().toISOString(), totalEntries: 0, entries: [] };
        }
        const json = await resp.json();
        const entries = json.entries || [];

        const profiles = await getCuratedProfiles();
        return {
          generated: json.generatedAt || new Date().toISOString(),
          totalEntries: entries.length,
          entries: entries.map((e) => enrichCandidateEntry(e, profiles)),
        };
      } catch {
        return { generated: new Date().toISOString(), totalEntries: 0, entries: [] };
      }
    })();
  }

  return directoryCache[key];
}

export function getCandidateRouteId(candidate) {
  return candidate.curatedProfileId || candidate.id || generateCandidateId(candidate.name, candidate.party, candidate.constituency, candidate.year);
}

export function findDirectoryCandidate(entries, id) {
  return entries.find((entry) => entry.id === id || entry.curatedProfileId === id) || null;
}