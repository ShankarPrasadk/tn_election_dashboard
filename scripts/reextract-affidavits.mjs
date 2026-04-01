#!/usr/bin/env node
/**
 * Re-extract affidavit summaries from all cached OCR .txt files
 * and update the profile cache with corrected values.
 *
 * This script reads the fixed extractAffidavitSummary logic from
 * the pipeline and applies it to all existing OCR cache files.
 */
import fs from 'fs';
import path from 'path';

const cacheDir = '.cache/eci-2026';
const affidavitDir = path.join(cacheDir, 'affidavits');
const profileCachePath = path.join(cacheDir, 'profiles.json');

// ── Import extraction functions (inline to avoid module issues) ──

function extractAllAmountsFromText(text) {
  const amounts = [];
  // Match Rs/ரூ prefixed amounts
  for (const m of text.matchAll(/(?:Rs\.?|ரூ\.?)\s*([\d,]+(?:\/[\-–])?)/gi)) {
    const digits = m[1].replace(/[,\/\-–\s]/g, '');
    if (digits.length >= 3) {
      const val = parseInt(digits, 10);
      if (val > 0 && val < 1e12) amounts.push(val);
    }
  }
  // Also match Indian comma-formatted amounts without prefix
  for (const m of text.matchAll(/(?<!\d)([\d]{1,3}(?:,\d{2}){1,4}(?:,\d{3})?(?:\/[\-–])?)/g)) {
    const digits = m[1].replace(/[,\/\-–]/g, '');
    if (digits.length >= 5) {
      const val = parseInt(digits, 10);
      if (val > 0 && val < 1e12 && !amounts.includes(val)) amounts.push(val);
    }
  }
  return amounts;
}

function sumAmounts(values) {
  return values.reduce((total, v) => total + v, 0);
}

function extractAffidavitSummary(ocrText) {
  const normalized = String(ocrText || '')
    .replace(/\r\n/g, '\n')
    .replace(/₹/g, 'Rs. ')
    .replace(/\t/g, ' ');

  const partBIdx = normalized.search(
    /PART[\s-]*B|ABSTRACT\s*OF\s*THE\s*DETAILS|ப\s*-?\s*B|பகுதி[^\n]{0,20}இல்|சுருக்கம்/i
  );
  const partB = partBIdx >= 0 ? normalized.substring(partBIdx) : '';

  // ── Criminal cases ──
  let criminalCases = null;
  if (partB) {
    const enMatch = partB.match(/total\s*number\s*of\s*pending\s*criminal[^0-9]{0,30}(\d{1,3})/i)
      || partB.match(/pending\s*criminal[^0-9]{0,20}(\d{1,3})/i);
    if (enMatch) criminalCases = parseInt(enMatch[1], 10);
    if (criminalCases == null) {
      const tamCrim = partB.match(/குற்றவியல்[\s\S]{0,120}?(ஏதுமில்லை|ஈதுமில்லை|இல்லை|\d{1,3})/);
      if (tamCrim) criminalCases = /மில்லை|இல்லை/.test(tamCrim[1]) ? 0 : parseInt(tamCrim[1], 10);
    }
  }
  if (criminalCases == null) {
    if (/there\s*is\s*no.*?(?:pending\s*)?criminal\s*case/i.test(normalized) &&
        !/following\s*criminal\s*cases\s*are\s*pending/i.test(normalized)) {
      criminalCases = 0;
    } else if (/யாதொரு\s*குற்றவியல்[\s\S]{0,60}(ஏதுமில்லை|ஈதுமில்லை|இல்லை)/.test(normalized) &&
               !/நிலுவையிலுள்ள\s*குற்றவியல்[\s\S]{0,40}வழக்குகள்[\s\S]{0,100}\d/.test(normalized)) {
      criminalCases = 0;
    }
  }
  if (criminalCases != null && criminalCases > 50) criminalCases = null;

  // ── Assets ──
  let totalAssets = null;
  const src = partB || normalized;

  // MOVABLE
  let movable = 0;
  const movableEn = src.match(
    /Movable\s*Assets[\s\S]{0,60}Total\s*Value\s*\)?\s*([\s\S]{0,200}?)(?=\n\s*\n|B\.\s*|Immovable|ATTESTED)/i
  );
  if (movableEn) movable = sumAmounts(extractAllAmountsFromText(movableEn[1]));
  if (!movable) {
    const movableTam = src.match(
      /அசையும்[\s\S]{0,10}சொத்து([\s\S]{0,400}?)(?=அசையாச்|B\.\s*|Immovable)/i
    );
    if (movableTam) movable = sumAmounts(extractAllAmountsFromText(movableTam[1]));
  }

  // IMMOVABLE (header total, not sub-rows)
  let immovable = 0;
  const immovableEn = src.match(
    /Immovable\s*Assets[\s\S]{0,60}Total\s*Value\s*\)?\s*([\s\S]{0,200}?)(?=\n\s*\n|Self|Purchase|சுயமாக|தாமாக|கொள்முதல்)/i
  );
  if (immovableEn) immovable = sumAmounts(extractAllAmountsFromText(immovableEn[1]));
  if (!immovable) {
    const immovableTam = src.match(
      /அசையாச்[\s\S]{0,15}சொத்து([\s\S]{0,200}?)(?=\n\s*(?:I\.|i\.|1\.|சுயமாக|தாமாக|கொள்முதல்|Purchase|Self))/i
    );
    if (immovableTam) immovable = sumAmounts(extractAllAmountsFromText(immovableTam[1]));
    if (!immovable) {
      const marketVal = src.match(
        /(?:current\s*market\s*value|நடப்பு\s*சந்தை[\s\S]{0,20}(?:மதிப்பு|விலை))([\s\S]{0,200}?)(?=\n\s*\n|பூர்வீக|பரம்பரை|Inherited|கடன்\s*பொ|Liabilit)/i
      );
      if (marketVal) immovable = sumAmounts(extractAllAmountsFromText(marketVal[1]));
    }
  }

  if (movable + immovable > 0) totalAssets = movable + immovable;

  // ── Liabilities ──
  let totalLiabilities = null;
  const liabSection = src.match(
    /(?:9\.\s*Liabilities|கடன்\s*பொறுப்புகள்)([\s\S]*?)(?=10\.\s*Liabilit|பிரச்சனைக்குரிய|Highest\s*educational|உயரளவு\s*கல்வி)/i
  );
  if (liabSection) {
    totalLiabilities = sumAmounts(extractAllAmountsFromText(liabSection[1])) || null;
  } else {
    const loanLine = src.match(/(?:Loan\s*from\s*Bank|வங்கி[\s\S]{0,40}கடன்)[\s\S]{0,120}(?:Total\s*\)?\s*)?([\s\S]{0,200}?)(?=\n\s*\n)/i);
    if (loanLine) totalLiabilities = sumAmounts(extractAllAmountsFromText(loanLine[1])) || null;
  }

  // ── Education ──
  let education = null;
  const eduMatch = partB.match(
    /(?:Highest\s*educational|educational)\s*qualification[:\s-]*([\s\S]{3,400}?)(?=\n\s*\n|\bVERIFICATION\b|\bசரிபார்ப்பு\b)/i
  ) || normalized.match(
    /\(10\)\s*My\s*educational\s*qualification[\s\S]{0,30}?:\s*-?\s*([\s\S]{3,400}?)(?=\n\s*\(11\)|\n\s*PART[\s-]*B|\nM\.\w+KUMAR)/i
  );
  if (eduMatch) {
    const block = eduMatch[1].trim();
    const items = block.match(/\d+\.\s*[^\n]+/g);
    if (items?.length) {
      education = items[items.length - 1].replace(/^\d+\.\s*/, '').trim();
    } else {
      const firstLine = block.split('\n')[0].trim();
      if (firstLine.length > 3 && firstLine.length < 200) education = firstLine;
    }
  }
  if (!education) {
    const tamEdu = normalized.match(/கல்வித்\s*தகுதி[:\s-]*([\s\S]{3,300}?)(?=\n\s*\n|சரிபார்ப்பு)/);
    if (tamEdu) {
      const firstLine = tamEdu[1].trim().split('\n')[0].trim();
      if (firstLine.length > 3) education = firstLine;
    }
  }

  // ── Profession ──
  const selfProfMatch = normalized.match(/\(a\)\s*Self\s*:\s*([^\n(]{2,80})/i);
  const spouseProfMatch = normalized.match(/\(b\)\s*Spouse\s*:\s*([^\n(]{2,80})/i);

  const assetsText = totalAssets ? `Rs ${totalAssets}` : null;
  const liabilitiesText = totalLiabilities ? `Rs ${totalLiabilities}` : null;

  return {
    criminalCases,
    criminalCasesText: criminalCases != null ? `${criminalCases} declared criminal case${criminalCases === 1 ? '' : 's'}` : null,
    education,
    assetsText,
    liabilitiesText,
    selfProfession: selfProfMatch ? selfProfMatch[1].trim() : null,
    spouseProfession: spouseProfMatch ? spouseProfMatch[1].trim() : null,
  };
}

// ── Main ──
const profileCache = JSON.parse(fs.readFileSync(profileCachePath, 'utf8'));
const listingCache = JSON.parse(fs.readFileSync(path.join(cacheDir, 'listing.json'), 'utf8'));

const txtFiles = fs.readdirSync(affidavitDir).filter(f => f.endsWith('.txt'));
console.log(`Found ${txtFiles.length} OCR cache files`);
console.log(`Found ${listingCache.cards.length} listing cards`);
console.log(`Found ${Object.keys(profileCache).length} profile cache entries`);

// Build OCR cache key lookup
const ocrTextCache = new Map();
for (const file of txtFiles) {
  const key = file.replace('.txt', '');
  ocrTextCache.set(key, path.join(affidavitDir, file));
}

// Replicate the slugify/generateCandidateId from the pipeline
function normalizeText(t) {
  return String(t || '').replace(/\s+/g, ' ').trim();
}
function slugify(value) {
  return normalizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function generateCandidateId(name, party, constituency, year) {
  return slugify([name, party, constituency, year].filter(Boolean).join('-'));
}

// Process each listing card to find its profile and re-extract
let updated = 0;
let noProfile = 0;
let noOcr = 0;
let improved = 0;
let fixedValues = [];

for (const card of listingCache.cards) {
  const profileUrl = card.profileUrl;
  const profile = profileCache[profileUrl];
  if (!profile) {
    noProfile++;
    continue;
  }

  // Generate the OCR cache key (same as pipeline)
  const cacheKey = generateCandidateId(card.name, card.party, card.constituency, 'eci-2026');
  const ocrFilePath = ocrTextCache.get(cacheKey);

  if (!ocrFilePath) {
    noOcr++;
    continue;
  }

  const ocrText = fs.readFileSync(ocrFilePath, 'utf8');
  const newAffidavit = extractAffidavitSummary(ocrText);

  const oldAssets = profile.affidavit?.assetsText;
  const newAssets = newAffidavit.assetsText;

  const oldCr = oldAssets ? parseInt(oldAssets.replace(/[^\d]/g, ''), 10) / 1e7 : null;
  const newCr = newAssets ? parseInt(newAssets.replace(/[^\d]/g, ''), 10) / 1e7 : null;

  profile.affidavit = newAffidavit;
  updated++;

  if (oldCr !== null && newCr !== null && Math.abs(oldCr - newCr) > 0.01) {
    const change = `${card.name} (${card.party}): ${oldCr.toFixed(2)} → ${newCr.toFixed(2)} Cr`;
    if (oldCr > 50 && newCr <= 50) {
      improved++;
      fixedValues.push(change);
    } else if (oldCr > 0 && newCr / oldCr > 5) {
      console.log(`WARN: ${change}`);
    }
  }
}

console.log(`\n=== FIXED HIGH-VALUE CANDIDATES (was >50 Cr, now ≤50 Cr) ===`);
fixedValues.forEach(v => console.log(`  ✓ ${v}`));

// Show new top 20 asset values
const assetsList = [];
for (const [url, profile] of Object.entries(profileCache)) {
  if (profile.affidavit?.assetsText) {
    const val = parseInt(profile.affidavit.assetsText.replace(/[^\d]/g, ''), 10) / 1e7;
    assetsList.push({ name: profile.labels?.Name || '?', val });
  }
}
assetsList.sort((a, b) => b.val - a.val);
console.log(`\n=== NEW TOP 20 ASSET VALUES ===`);
assetsList.slice(0, 20).forEach(a => console.log(`  ${a.val.toFixed(2)} Cr | ${a.name}`));

console.log(`\n=== SUMMARY ===`);
console.log(`Updated: ${updated}`);
console.log(`No profile: ${noProfile}`);
console.log(`No OCR file: ${noOcr}`);
console.log(`Fixed inflated values: ${improved}`);

// Count affidavit stats
let withCriminal = 0, withAssets = 0, withEdu = 0;
for (const profile of Object.values(profileCache)) {
  if (profile.affidavit?.criminalCases != null) withCriminal++;
  if (profile.affidavit?.assetsText) withAssets++;
  if (profile.affidavit?.education) withEdu++;
}
console.log(`\nAffidavit coverage:`);
console.log(`  Criminal: ${withCriminal} / ${Object.keys(profileCache).length}`);
console.log(`  Assets: ${withAssets} / ${Object.keys(profileCache).length}`);
console.log(`  Education: ${withEdu} / ${Object.keys(profileCache).length}`);

fs.writeFileSync(profileCachePath, JSON.stringify(profileCache, null, 2));
console.log(`\nProfile cache updated: ${profileCachePath}`);
