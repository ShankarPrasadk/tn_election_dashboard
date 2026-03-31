import { loadCuratedProfiles, findCandidateProfile } from './candidateProfiles';
import { generateCandidateAvatarUrl, generateCandidateId, getGenericCandidateBio, normalizeName } from './candidateUtils';
import { supabase } from '../lib/supabase';

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

// Convert Supabase snake_case row to app camelCase
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
      // Load candidates from Supabase
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw new Error(`Failed to load candidates: ${error.message}`);

      const profiles = await getCuratedProfiles();
      const entries = data.map(rowToCandidate).map((e) => enrichCandidateEntry(e, profiles));

      return {
        generated: new Date().toISOString(),
        totalEntries: entries.length,
        entries,
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