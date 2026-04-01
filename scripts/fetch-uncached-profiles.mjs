#!/usr/bin/env node
/**
 * Fetch ECI profiles for uncached listing cards.
 * Downloads profile details + affidavit PDFs → Tesseract OCR → cache.
 *
 * Usage:
 *   node scripts/fetch-uncached-profiles.mjs              # all uncached
 *   node scripts/fetch-uncached-profiles.mjs --major-only  # DMK,AIADMK,TVK,BJP,INC,DMDK,PMK,VCK,MDMK,CPI,CPI(M),IUML
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  generateCandidateId,
  normalizeName,
  normalizeText,
} from '../src/data/candidateUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cacheDir = path.resolve(__dirname, '../.cache/eci-2026');
const listingCachePath = path.join(cacheDir, 'listing.json');
const profileCachePath = path.join(cacheDir, 'profiles.json');
const affidavitCacheDir = path.join(cacheDir, 'affidavits');
const tempOcrDir = path.join(os.tmpdir(), 'tn-election-dashboard-ocr');
const execFileAsync = promisify(execFile);

const ECI_BASE_URL = 'https://affidavit.eci.gov.in';
const OCR_TIMEOUT_MS = 120000;

const MAJOR_PARTIES = new Set([
  'dmk', 'dravida munnetra kazhagam',
  'aiadmk', 'all india anna dravida munnetra kazhagam',
  'tvk', 'tamilaga vettri kazhagam',
  'bjp', 'bharatiya janata party',
  'inc', 'indian national congress', 'congress',
  'dmdk', 'desiya murpokku dravida kazhagam',
  'pmk', 'pattali makkal katchi',
  'vck', 'viduthalai chiruthaigal katchi',
  'mdmk', 'marumalarchi dravida munnetra kazhagam',
  'cpi', 'communist party of india',
  'cpi(m)', 'cpim', 'cpi m', 'communist party of india marxist', 'communist party of india (marxist)',
  'iuml', 'indian union muslim league',
  'ammk', 'amma makkal munnetra kazagam',
]);

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function readJson(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function decodeEntities(value) {
  return String(value || '')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

function stripTags(value) {
  return normalizeText(decodeEntities(String(value || '').replace(/<br\s*\/?/gi, ', ').replace(/<[^>]+>/g, ' ')));
}

function extractLabelValuePairs(html) {
  const pairs = {};
  const matches = html.matchAll(/<label[^>]*>\s*<p>([^<:]+):?\s*<\/p>\s*<\/label>\s*<div class=["']col-sm-6["']>\s*<p>([\s\S]*?)<\/p>/gi);
  for (const match of matches) {
    const label = normalizeText(match[1]);
    const value = stripTags(match[2]);
    if (label && value) pairs[label] = value;
  }
  return pairs;
}

function extractInputValue(html, id) {
  const byIdFirst = html.match(new RegExp(`<input[^>]*id=["']${id}["'][^>]*value=["']([^"']*)["']`, 'i'));
  if (byIdFirst) return decodeEntities(byIdFirst[1]);
  const byValueFirst = html.match(new RegExp(`<input[^>]*value=["']([^"']*)["'][^>]*id=["']${id}["']`, 'i'));
  return byValueFirst ? decodeEntities(byValueFirst[1]) : null;
}

async function fetchTextWithRetry(url, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; TN-Election-Dashboard/1.0)' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(1000 * attempt);
    }
  }
  throw lastError;
}

// ── Affidavit extraction (copied from main pipeline) ──

function extractAllAmountsFromText(text) {
  const amounts = [];
  for (const m of text.matchAll(/([\d,]+(?:\/[\-–])?)/g)) {
    const digits = m[1].replace(/[,\/\-–]/g, '');
    if (digits.length >= 5) {
      const val = parseInt(digits, 10);
      if (val > 0) amounts.push(val);
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

  let totalAssets = null;
  const src = partB || normalized;
  let movable = 0;
  const movableEn = src.match(/Movable\s*Assets[\s\S]{0,60}Total\s*Value\s*\)?\s*([\s\S]{0,200}?)(?=\n\s*\n|B\.\s*|Immovable|ATTESTED)/i);
  if (movableEn) movable = sumAmounts(extractAllAmountsFromText(movableEn[1]));
  if (!movable) {
    const movableTam = src.match(/அசையும்[\s\S]{0,10}சொத்து([\s\S]{0,400}?)(?=அசையாச்|B\.\s*|Immovable)/i);
    if (movableTam) movable = sumAmounts(extractAllAmountsFromText(movableTam[1]));
  }

  let saAmount = 0;
  const saEn = src.match(/Self[\-\s]*acquired\s*assets[\s\S]{0,60}Total\s*Value\s*\)?\s*([\s\S]{0,200}?)(?=\n\s*\n|Inherited|பூர்வீக|Liabilit|கடன்)/i);
  if (saEn) saAmount = sumAmounts(extractAllAmountsFromText(saEn[1]));
  if (!saAmount) {
    const saTam = src.match(/(?:சுயமாக|தாமாக)[\s\S]{0,60}(?:சொத்து|மதிப்பு|வாங்கிய)([\s\S]{0,300}?)(?=பூர்வீக|பரம்பரை|Inherited|கடன்\s*பொ|Liabilit)/i);
    if (saTam) saAmount = sumAmounts(extractAllAmountsFromText(saTam[1]));
  }

  let inhAmount = 0;
  const inhEn = src.match(/Inherited\s*assets[\s\S]{0,60}Total\s*Value\s*\)?\s*([\s\S]{0,200}?)(?=\n\s*\n|9\.\s*Liabilit|கடன்\s*பொறுப்பு|Highest|உயரளவு)/i);
  if (inhEn) inhAmount = sumAmounts(extractAllAmountsFromText(inhEn[1]));
  if (!inhAmount) {
    const inhTam = src.match(/(?:பூர்வீக|பரம்பரை)[\s\S]{0,30}(?:சொத்து|மதிப்பு)([\s\S]{0,500}?)(?=கடன்\s*பொ|Liabilit|Highest|உயரளவு|10\.\s*|பணை|ML\s|\n\s*\n\s*\n)/i);
    if (inhTam) inhAmount = sumAmounts(extractAllAmountsFromText(inhTam[1]));
  }

  const immovable = saAmount + inhAmount;
  if (movable + immovable > 0) totalAssets = movable + immovable;

  let totalLiabilities = null;
  const liabSection = src.match(/(?:9\.\s*Liabilities|கடன்\s*பொறுப்புகள்)([\s\S]*?)(?=10\.\s*Liabilit|பிரச்சனைக்குரிய|Highest\s*educational|உயரளவு\s*கல்வி)/i);
  if (liabSection) totalLiabilities = sumAmounts(extractAllAmountsFromText(liabSection[1])) || null;
  else {
    const loanLine = src.match(/(?:Loan\s*from\s*Bank|வங்கி[\s\S]{0,40}கடன்)[\s\S]{0,120}(?:Total\s*\)?\s*)?([\s\S]{0,200}?)(?=\n\s*\n)/i);
    if (loanLine) totalLiabilities = sumAmounts(extractAllAmountsFromText(loanLine[1])) || null;
  }

  let education = null;
  const eduMatch = partB.match(
    /(?:Highest\s*educational|educational)\s*qualification[:\s-]*([\s\S]{3,400}?)(?=\n\s*\n|\bVERIFICATION\b|\bசரிபார்ப்பு\b)/i
  ) || normalized.match(
    /\(10\)\s*My\s*educational\s*qualification[\s\S]{0,30}?:\s*-?\s*([\s\S]{3,400}?)(?=\n\s*\(11\)|\n\s*PART[\s-]*B|\nM\.\w+KUMAR)/i
  );
  if (eduMatch) {
    const block = eduMatch[1].trim();
    const items = block.match(/\d+\.\s*[^\n]+/g);
    if (items?.length) education = items[items.length - 1].replace(/^\d+\.\s*/, '').trim();
    else {
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

async function runTesseractOnPdf(pdfPath, cacheKey) {
  await fs.mkdir(affidavitCacheDir, { recursive: true });
  await fs.mkdir(tempOcrDir, { recursive: true });

  const ocrCachePath = path.join(affidavitCacheDir, `${cacheKey}.txt`);
  try {
    return await fs.readFile(ocrCachePath, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const workDir = path.join(tempOcrDir, cacheKey);
  await fs.mkdir(workDir, { recursive: true });

  try {
    let firstPage = 1;
    try {
      const { stdout: info } = await execFileAsync('pdfinfo', [pdfPath], { timeout: 10000 });
      const pagesMatch = info.match(/Pages:\s*(\d+)/);
      if (pagesMatch) {
        const total = parseInt(pagesMatch[1], 10);
        if (total > 8) firstPage = total - 7;
      }
    } catch { /* pdfinfo not available */ }

    const imgPrefix = path.join(workDir, 'page');
    const pdftoppmArgs = ['-r', '200', '-png'];
    if (firstPage > 1) pdftoppmArgs.push('-f', String(firstPage));
    pdftoppmArgs.push(pdfPath, imgPrefix);
    await execFileAsync('pdftoppm', pdftoppmArgs, { timeout: OCR_TIMEOUT_MS }).catch(() => {});

    const files = await fs.readdir(workDir);
    const imgFiles = files.filter((f) => f.endsWith('.png')).sort();
    if (imgFiles.length === 0) return null;

    let fullText = '';
    for (const img of imgFiles) {
      try {
        const { stdout } = await execFileAsync('tesseract', [path.join(workDir, img), '-', '--oem', '3', '-l', 'tam+eng'], {
          timeout: 60000,
          maxBuffer: 10 * 1024 * 1024,
        });
        fullText += `${stdout}\n\n`;
      } catch { /* skip corrupt page */ }
    }
    if (!fullText.trim()) return null;

    await fs.writeFile(ocrCachePath, fullText, 'utf8');
    return fullText;
  } finally {
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function fetchAffidavitSummary(pdfToken, cacheKey) {
  if (!pdfToken) return null;

  const pdfPath = path.join(tempOcrDir, `${cacheKey}.pdf`);
  const pdfUrl = pdfToken.startsWith('http') ? pdfToken : `${ECI_BASE_URL}/affidavit-pdf-download/${pdfToken}`;
  const response = await fetch(pdfUrl, {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; TN-Election-Dashboard/1.0)' },
  });
  if (!response.ok) return null;

  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(pdfPath, Buffer.from(arrayBuffer));

  try {
    const ocrText = await runTesseractOnPdf(pdfPath, cacheKey);
    return ocrText ? extractAffidavitSummary(ocrText) : null;
  } catch {
    return null;
  } finally {
    await fs.rm(pdfPath, { force: true }).catch(() => {});
  }
}

// ── Main ──

async function main() {
  const majorOnly = process.argv.includes('--major-only');

  const listing = await readJson(listingCachePath);
  const profileCache = await readJson(profileCachePath);

  const uncached = listing.cards.filter((card) => !profileCache[card.profileUrl]);

  let targets;
  if (majorOnly) {
    targets = uncached.filter((card) => {
      const partyKey = normalizeName(card.party).replace(/\s+/g, ' ').trim();
      return MAJOR_PARTIES.has(partyKey);
    });
    console.log(`Major-party uncached: ${targets.length} of ${uncached.length} total uncached`);
  } else {
    targets = uncached;
    console.log(`All uncached: ${targets.length}`);
  }

  if (!targets.length) {
    console.log('Nothing to fetch.');
    return;
  }

  // Party breakdown
  const byParty = {};
  for (const card of targets) {
    byParty[card.party] = (byParty[card.party] || 0) + 1;
  }
  console.log('Party breakdown:', JSON.stringify(byParty, null, 2));

  let fetched = 0;
  let failed = 0;
  let ocrDone = 0;

  for (const card of targets) {
    const idx = `[${fetched + failed + 1}/${targets.length}]`;
    try {
      const html = await fetchTextWithRetry(card.profileUrl, 3);
      const labels = extractLabelValuePairs(html);
      const affidavitId = extractInputValue(html, 'candidate_affidavit_idHidden') || null;
      const pdfToken = affidavitId ? extractInputValue(html, `pdfUrl${affidavitId}`) : null;
      const cacheKey = generateCandidateId(card.name, card.party, card.constituency, 'eci-2026');
      const affidavit = await fetchAffidavitSummary(pdfToken, cacheKey);

      profileCache[card.profileUrl] = {
        labels,
        affidavitId,
        pdfToken,
        affidavit,
        fetchedAt: new Date().toISOString(),
      };

      fetched++;
      if (affidavit) ocrDone++;
      console.log(`${idx} ✓ ${card.name} (${card.party}, ${card.constituency})${affidavit ? ' [OCR]' : pdfToken ? ' [no OCR]' : ' [no PDF]'}`);

      // Save profile cache every 10 fetches
      if (fetched % 10 === 0) {
        await writeJson(profileCachePath, profileCache);
        console.log(`  ... saved cache (${fetched} fetched, ${ocrDone} OCR'd)`);
      }

      // Rate limit: 500ms between fetches (polite)
      await sleep(500);
    } catch (error) {
      failed++;
      console.warn(`${idx} ✗ ${card.name} (${card.party}): ${error.message}`);
    }
  }

  // Final save
  await writeJson(profileCachePath, profileCache);
  console.log(`\nDone: ${fetched} fetched, ${ocrDone} OCR'd, ${failed} failed`);
  console.log(`Total cached profiles: ${Object.keys(profileCache).length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
