import { loadCuratedProfiles, findCandidateProfile } from './candidateProfiles';
import { generateCandidateAvatarUrl, generateCandidateId, getGenericCandidateBio, normalizeName } from './candidateUtils';

let directoryPromise;
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
    designation: curatedProfile?.designation || entry.designation || (entry.year === 2026 ? '2026 Tamil Nadu Assembly election candidate' : `${entry.year} Tamil Nadu Assembly election candidate`),
    tags: curatedProfile?.tags || entry.tags || [entry.party, `${entry.year}`],
  };
}

export async function loadCandidateDirectory() {
  if (!directoryPromise) {
    directoryPromise = (async () => {
      // Primary: load from static JSON (freshest OCR-extracted data)
      const resp = await fetch('/data/tn-candidate-directory.json');
      const json = await resp.json();
      const entries = json.entries || [];

      const profiles = await getCuratedProfiles();
      return {
        generated: json.generatedAt || new Date().toISOString(),
        totalEntries: entries.length,
        entries: entries.map((e) => enrichCandidateEntry(e, profiles)),
      };
    })();
  }

  return directoryPromise;
}

export function getCandidateRouteId(candidate) {
  return candidate.curatedProfileId || candidate.id || generateCandidateId(candidate.name, candidate.party, candidate.constituency, candidate.year);
}

export function findDirectoryCandidate(entries, id) {
  return entries.find((entry) => entry.id === id || entry.curatedProfileId === id) || null;
}