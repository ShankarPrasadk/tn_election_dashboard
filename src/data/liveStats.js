/**
 * Compute live election stats from candidate directory entries (Supabase data).
 * Used to dynamically show criminal records, assets, education, and age stats
 * for 2026 instead of hardcoded "Pending filings".
 */

function classifyEducation(edu) {
  if (!edu || /awaiting|pending|sync|not available/i.test(edu)) return null;
  const e = edu.toLowerCase();
  if (/doctorate|ph\.?d|post.?doctoral/i.test(e)) return 'Doctorate';
  if (/post.?graduate|m\.?a|m\.?sc|m\.?b\.?a|m\.?tech|m\.?phil|m\.?e\b|masters/i.test(e)) return 'Post Graduate';
  if (/graduate|b\.?a|b\.?sc|b\.?com|b\.?e\b|b\.?tech|bachelor|engineering|mbbs|b\.?l\b|llb/i.test(e)) return 'Graduate';
  if (/12th|higher secondary|hsc|intermediate|pre.?university|plus.?two/i.test(e)) return '12th Pass';
  if (/10th|secondary|sslc|matric/i.test(e)) return '10th Pass';
  if (/8th|5th|literate|primary|middle/i.test(e)) return 'Below 10th';
  if (/illiterate|not literate/i.test(e)) return 'Illiterate';
  return 'Others';
}

function parseAge(ageText) {
  if (!ageText) return null;
  const m = String(ageText).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

function ageGroup(age) {
  if (age < 30) return '25-29';
  if (age < 40) return '30-39';
  if (age < 50) return '40-49';
  if (age < 60) return '50-59';
  if (age < 70) return '60-69';
  return '70+';
}

export function computeLiveStats(entries) {
  const raw2026 = entries.filter(e => e.year === 2026);
  if (raw2026.length === 0) return null;

  // Deduplicate: when ECI-sourced entries exist for a party+constituency,
  // drop stale BASE (party-announced) entries whose names may have changed.
  const grouped = {};
  for (const c of raw2026) {
    const key = `${(c.party || '').toLowerCase().trim()}|${(c.constituency || '').toLowerCase().trim()}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  }
  const candidates = [];
  for (const entries of Object.values(grouped)) {
    const eciEntries = entries.filter(e => e.source && e.source.url);
    if (eciEntries.length > 0) {
      candidates.push(...eciEntries);
    } else {
      candidates.push(...entries);
    }
  }

  // --- Criminal stats ---
  // Only count candidates where affidavit was actually processed (criminalCases is a number, not null)
  const withAffidavitData = candidates.filter(e => e.criminalCases != null);
  const withCases = withAffidavitData.filter(e => e.criminalCases > 0);
  const affidavitsSynced = withAffidavitData.length;

  // If very few affidavits synced, stats would be misleading — use total candidates as denominator
  const useFullBase = affidavitsSynced >= 50;
  const totalAnalyzed = useFullBase ? affidavitsSynced : candidates.length;
  const percentWithCases = totalAnalyzed > 0
    ? parseFloat(((withCases.length / totalAnalyzed) * 100).toFixed(1))
    : 0;

  const withSerious = withCases.filter(e => e.criminalCases >= 2);
  const percentSerious = totalAnalyzed > 0
    ? parseFloat(((withSerious.length / totalAnalyzed) * 100).toFixed(1))
    : 0;

  const totalCasesSum = withCases.reduce((s, e) => s + e.criminalCases, 0);
  const avgCases = withCases.length > 0
    ? parseFloat((totalCasesSum / withCases.length).toFixed(1))
    : 0;

  // Top parties — only among candidates with actual affidavit data
  const partyMap = {};
  for (const c of (useFullBase ? withAffidavitData : candidates)) {
    const p = c.party || 'IND';
    if (!partyMap[p]) partyMap[p] = { total: 0, withCases: 0 };
    partyMap[p].total++;
    if (c.criminalCases > 0) partyMap[p].withCases++;
  }
  const topParties = Object.entries(partyMap)
    .filter(([, v]) => v.total >= 3)
    .map(([party, v]) => ({
      party,
      percent: parseFloat(((v.withCases / v.total) * 100).toFixed(1)),
      count: v.withCases,
    }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 8);

  const criminal = {
    totalCandidatesAnalyzed: totalAnalyzed,
    affidavitsSynced,
    withCriminalCases: withCases.length,
    percentWithCases,
    withSeriousCases: withSerious.length,
    percentSerious,
    avgCases,
    topParties,
    isPartial: !useFullBase,
  };

  // --- Top criminals list ---
  const topCriminals = [...withCases]
    .sort((a, b) => b.criminalCases - a.criminalCases)
    .slice(0, 20)
    .map(c => ({
      id: c.id,
      name: c.name,
      party: c.party,
      constituency: c.constituency,
      criminalCases: { total: c.criminalCases, serious: Math.max(0, c.criminalCases - 1) },
    }));

  // --- Asset stats ---
  const withAssets = candidates.filter(e => e.assetsCrores != null && e.assetsCrores > 0);
  const assetValues = withAssets.map(e => e.assetsCrores).sort((a, b) => a - b);
  const assets = assetValues.length > 0 ? {
    avgAssets: parseFloat((assetValues.reduce((s, v) => s + v, 0) / assetValues.length).toFixed(2)),
    medianAssets: parseFloat(assetValues[Math.floor(assetValues.length / 2)].toFixed(2)),
    richest: parseFloat(assetValues[assetValues.length - 1].toFixed(2)),
  } : null;

  // --- Education distribution ---
  const eduCounts = {};
  for (const c of candidates) {
    const cat = classifyEducation(c.education);
    if (cat) {
      eduCounts[cat] = (eduCounts[cat] || 0) + 1;
    }
  }
  const educationOrder = ['Illiterate', 'Below 10th', '10th Pass', '12th Pass', 'Graduate', 'Post Graduate', 'Doctorate', 'Others'];
  const education = educationOrder
    .filter(level => eduCounts[level])
    .map(level => ({ level, count: eduCounts[level] }));

  // --- Age distribution ---
  const ageCounts = {};
  for (const c of candidates) {
    const age = parseAge(c.ageText);
    if (age && age > 18 && age < 120) {
      const group = ageGroup(age);
      ageCounts[group] = (ageCounts[group] || 0) + 1;
    }
  }
  const ageOrder = ['25-29', '30-39', '40-49', '50-59', '60-69', '70+'];
  const age = ageOrder
    .filter(g => ageCounts[g])
    .map(group => ({ group, count: ageCounts[group] }));

  return {
    criminal,
    assets,
    education: education.length > 0 ? education : null,
    age: age.length > 0 ? age : null,
    totalCandidates: candidates.length,
    topCriminals,
  };
}
