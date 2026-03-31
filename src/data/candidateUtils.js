export const PARTY_IMAGE_BACKGROUNDS = {
  DMK: 'e11d48',
  AIADMK: '16a34a',
  BJP: 'f97316',
  TVK: '0284c7',
  NTK: '06b6d4',
  VCK: '7c3aed',
  PMK: 'eab308',
  'CPI(M)': 'b91c1c',
  CPI: 'dc2626',
  DMDK: '8b5cf6',
  INC: '3b82f6',
  IUML: '059669',
  AMMK: '65a30d',
  MDMK: '0ea5e9',
};

export function normalizeText(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeName(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function slugify(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateCandidateId(name, party, constituency, year) {
  return slugify([name, party, constituency, year].filter(Boolean).join('-'));
}

export function generateCandidateAvatarUrl(name, party) {
  const encoded = encodeURIComponent(normalizeText(name || 'Candidate'));
  const background = PARTY_IMAGE_BACKGROUNDS[party] || '6b7280';
  return `https://ui-avatars.com/api/?name=${encoded}&background=${background}&color=fff&size=256&font-size=0.35&bold=true`;
}

export function parseIndianCurrencyToCrores(value) {
  const text = String(value || '');

  // Extract only the rupee amount before the "~" summary suffix
  // e.g. "Rs 26,18,977 ~ 26 Lacs+" → extract "26,18,977"
  const beforeTilde = text.split('~')[0];
  const digits = beforeTilde.replace(/[^\d.]/g, '');
  if (!digits) {
    return null;
  }

  const rupees = Number(digits);
  if (!Number.isFinite(rupees) || rupees <= 0) {
    return null;
  }

  return Number((rupees / 10000000).toFixed(2));
}

export function getGenericCandidateBio(candidate) {
  if (!candidate) {
    return '';
  }

  if (candidate.year === 2026) {
    return `${candidate.name} is the ${candidate.party} candidate for ${candidate.constituency}${candidate.district ? ` in ${candidate.district} district` : ''} for the 2026 Tamil Nadu Assembly election. This profile is generated from public candidate listings and will show deeper biographical material as more verified public data becomes available.`;
  }

  const criminalSummary = candidate.criminalCasesText || (candidate.criminalCases == null ? 'criminal-case data not available' : `${candidate.criminalCases} declared criminal cases`);
  const educationSummary = candidate.education || 'education not disclosed';
  const assetSummary = candidate.assetsText || 'assets not disclosed';

  return `${candidate.name} contested from ${candidate.constituency} on the ${candidate.party} ticket in the ${candidate.year} Tamil Nadu Assembly election. Public affidavit summaries report ${criminalSummary.toLowerCase()}, education listed as ${educationSummary}, and declared assets of ${assetSummary}.`;
}