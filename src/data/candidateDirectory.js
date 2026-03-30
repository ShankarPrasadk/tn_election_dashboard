import { CANDIDATE_PROFILES, findCandidateProfile } from './candidateProfiles';
import { generateCandidateAvatarUrl, generateCandidateId, getGenericCandidateBio, normalizeName } from './candidateUtils';

let directoryPromise;

function findCuratedMatch(entry) {
  const direct = findCandidateProfile(entry.id);
  if (direct) {
    return direct;
  }

  const entryName = normalizeName(entry.name);
  const entryConstituency = normalizeName(entry.constituency);

  return CANDIDATE_PROFILES.find((profile) => {
    const sameName = normalizeName(profile.name) === entryName || normalizeName(profile.fullName) === entryName;
    const sameConstituency = !entryConstituency || normalizeName(profile.constituency) === entryConstituency;
    return sameName && sameConstituency;
  }) || null;
}

export function enrichCandidateEntry(entry) {
  const curatedProfile = findCuratedMatch(entry);
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
    directoryPromise = fetch('/data/tn-candidate-directory.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load candidate directory: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => ({
        ...data,
        entries: data.entries.map(enrichCandidateEntry),
      }));
  }

  return directoryPromise;
}

export function getCandidateRouteId(candidate) {
  return candidate.curatedProfileId || candidate.id || generateCandidateId(candidate.name, candidate.party, candidate.constituency, candidate.year);
}

export function findDirectoryCandidate(entries, id) {
  return entries.find((entry) => entry.id === id || entry.curatedProfileId === id) || null;
}