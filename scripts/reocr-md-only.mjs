#!/usr/bin/env node
/**
 * Re-OCR candidates that only have Docling .md files (no Tesseract .txt).
 * Downloads PDFs from cached pdfTokens, runs Tesseract, creates .txt cache files.
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const cacheDir = '.cache/eci-2026';
const affidavitDir = path.join(cacheDir, 'affidavits');
const profileCachePath = path.join(cacheDir, 'profiles.json');
const listingCachePath = path.join(cacheDir, 'listing.json');
const tempDir = path.join(cacheDir, 'temp-ocr');

const TESSERACT = '/opt/homebrew/bin/tesseract';
const PDFTOPPM = '/opt/homebrew/Cellar/poppler/26.03.0/bin/pdftoppm';
const PDFINFO = '/opt/homebrew/Cellar/poppler/26.03.0/bin/pdfinfo';
const ECI_BASE_URL = 'https://affidavit.eci.gov.in';

// Load caches
const profileCache = JSON.parse(fs.readFileSync(profileCachePath, 'utf8'));
const listingCache = JSON.parse(fs.readFileSync(listingCachePath, 'utf8'));

function normalizeText(t) { return String(t || '').replace(/\s+/g, ' ').trim(); }
function slugify(value) {
  return normalizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function generateCandidateId(name, party, constituency, year) {
  return slugify([name, party, constituency, year].filter(Boolean).join('-'));
}

// Find MD-only candidates
const mdFiles = fs.readdirSync(affidavitDir).filter(f => f.endsWith('.md'));
const mdOnly = mdFiles.filter(f => {
  const txtFile = f.replace('.md', '.txt');
  return !fs.existsSync(path.join(affidavitDir, txtFile));
});
console.log(`MD-only candidates: ${mdOnly.length}`);

// Match each MD-only file to a listing card + pdfToken
const toProcess = [];
for (const mdFile of mdOnly) {
  const cacheKey = mdFile.replace('.md', '');

  // Find matching listing card
  const card = listingCache.cards.find(c => {
    const k = generateCandidateId(c.name, c.party, c.constituency, 'eci-2026');
    return k === cacheKey;
  });

  if (!card) continue;

  const profile = profileCache[card.profileUrl];
  const pdfToken = profile?.pdfToken;
  if (!pdfToken) continue;

  toProcess.push({ cacheKey, card, pdfToken });
}
console.log(`Candidates with pdfToken to re-OCR: ${toProcess.length}`);

// Process each
fs.mkdirSync(tempDir, { recursive: true });
let success = 0;
let failed = 0;

for (let i = 0; i < toProcess.length; i++) {
  const { cacheKey, card, pdfToken } = toProcess[i];
  const pdfPath = path.join(tempDir, `${cacheKey}.pdf`);
  const txtPath = path.join(affidavitDir, `${cacheKey}.txt`);

  try {
    // Download PDF
    const pdfUrl = pdfToken.startsWith('http')
      ? pdfToken
      : `${ECI_BASE_URL}/affidavit-pdf-download/${pdfToken}`;

    console.log(`[${i + 1}/${toProcess.length}] ${card.name} (${card.party.substring(0, 20)})`);

    const res = await fetch(pdfUrl, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; TN-Election-Dashboard/1.0)' },
    });
    if (!res.ok) {
      console.log(`  SKIP: HTTP ${res.status}`);
      failed++;
      continue;
    }

    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(pdfPath, buf);

    // Get page count
    let pageCount;
    try {
      const infoOut = execSync(`"${PDFINFO}" "${pdfPath}" 2>/dev/null`, { encoding: 'utf8' });
      const m = infoOut.match(/Pages:\s*(\d+)/);
      pageCount = m ? parseInt(m[1], 10) : null;
    } catch { pageCount = null; }

    // OCR last 8 pages
    const startPage = pageCount && pageCount > 8 ? pageCount - 7 : 1;
    const workDir = path.join(tempDir, cacheKey);
    fs.mkdirSync(workDir, { recursive: true });

    // Convert to images
    const fromFlag = startPage > 1 ? `-f ${startPage}` : '';
    execSync(`"${PDFTOPPM}" ${fromFlag} -r 200 -png "${pdfPath}" "${workDir}/page"`, { timeout: 120000 });

    // OCR each page
    const images = fs.readdirSync(workDir).filter(f => f.endsWith('.png')).sort();
    let fullText = '';
    for (const img of images) {
      try {
        const stdout = execSync(
          `"${TESSERACT}" "${path.join(workDir, img)}" stdout --oem 3 -l tam+eng`,
          { encoding: 'utf8', timeout: 60000, maxBuffer: 10 * 1024 * 1024 }
        );
        fullText += `${stdout}\n\n`;
      } catch { /* skip corrupt page */ }
    }

    if (fullText.trim()) {
      fs.writeFileSync(txtPath, fullText, 'utf8');
      success++;
      console.log(`  OK (${images.length} pages, ${fullText.length} chars)`);
    } else {
      console.log(`  EMPTY OCR`);
      failed++;
    }

    // Cleanup
    fs.rmSync(workDir, { recursive: true, force: true });
    fs.rmSync(pdfPath, { force: true });

    // Rate limit
    await new Promise(r => setTimeout(r, 500));
  } catch (err) {
    console.log(`  ERROR: ${err.message}`);
    failed++;
    try { fs.rmSync(path.join(tempDir, cacheKey), { recursive: true, force: true }); } catch {}
    try { fs.rmSync(pdfPath, { force: true }); } catch {}
  }
}

console.log(`\n=== DONE ===`);
console.log(`Success: ${success}`);
console.log(`Failed: ${failed}`);
