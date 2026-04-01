#!/usr/bin/env node
/**
 * Batch OCR: re-process all cached ECI profiles with Tesseract OCR.
 * Updates profiles.json with new affidavit extraction data.
 * 
 * Usage: node scripts/batch-ocr-affidavits.mjs [--limit N] [--concurrency N]
 */
import fs from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  generateCandidateId,
  normalizeText,
  parseIndianCurrencyToCrores,
} from '../src/data/candidateUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execFileAsync = promisify(execFile);

const cacheDir = path.resolve(__dirname, '../.cache/eci-2026');
const profileCachePath = path.join(cacheDir, 'profiles.json');
const affidavitCacheDir = path.join(cacheDir, 'affidavits');
const tempDir = path.join(os.tmpdir(), 'tn-batch-ocr');
const ECI_BASE_URL = 'https://affidavit.eci.gov.in';

const args = process.argv.slice(2);
const limitArg = args.indexOf('--limit');
const concArg = args.indexOf('--concurrency');
const LIMIT = limitArg >= 0 ? parseInt(args[limitArg + 1], 10) : Infinity;
const CONCURRENCY = concArg >= 0 ? parseInt(args[concArg + 1], 10) : 2;
const FORCE_REPROCESS = args.includes('--force');

// ──── Extraction functions (same as generate-candidate-directory.mjs) ────
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
    .replace(/\r\n/g, '\n').replace(/₹/g, 'Rs. ').replace(/\t/g, ' ');

  const partBIdx = normalized.search(
    /PART[\s-]*B|ABSTRACT\s*OF\s*THE\s*DETAILS|ப\s*-?\s*B|பகுதி[^\n]{0,20}இல்|சுருக்கம்/i
  );
  const partB = partBIdx >= 0 ? normalized.substring(partBIdx) : '';

  // Criminal
  let criminalCases = null;
  if (partB) {
    const en = partB.match(/total\s*number\s*of\s*pending\s*criminal[^0-9]{0,30}(\d{1,3})/i)
      || partB.match(/pending\s*criminal[^0-9]{0,20}(\d{1,3})/i);
    if (en) criminalCases = parseInt(en[1], 10);
    if (criminalCases == null) {
      const tam = partB.match(/குற்றவியல்[\s\S]{0,120}?(ஏதுமில்லை|ஈதுமில்லை|இல்லை|\d{1,3})/);
      if (tam) criminalCases = /மில்லை|இல்லை/.test(tam[1]) ? 0 : parseInt(tam[1], 10);
    }
  }
  if (criminalCases == null) {
    if (/there\s*is\s*no.*?(?:pending\s*)?criminal\s*case/i.test(normalized) && !/following\s*criminal\s*cases\s*are\s*pending/i.test(normalized)) criminalCases = 0;
    else if (/யாதொரு\s*குற்றவியல்[\s\S]{0,60}(ஏதுமில்லை|ஈதுமில்லை|இல்லை)/.test(normalized)) criminalCases = 0;
  }
  if (criminalCases != null && criminalCases > 50) criminalCases = null;

  // Assets
  const src = partB || normalized;
  let movable = 0;
  const movEn = src.match(/Movable\s*Assets[\s\S]{0,60}Total\s*Value\s*\)?\s*([\s\S]{0,200}?)(?=\n\s*\n|B\.\s*|Immovable|ATTESTED)/i);
  if (movEn) movable = sumAmounts(extractAllAmountsFromText(movEn[1]));
  if (!movable) { const movTam = src.match(/அசையும்[\s\S]{0,10}சொத்து([\s\S]{0,400}?)(?=அசையாச்|B\.\s*|Immovable)/i); if (movTam) movable = sumAmounts(extractAllAmountsFromText(movTam[1])); }

  let saAmt = 0;
  const saEn = src.match(/Self[\-\s]*acquired\s*assets[\s\S]{0,60}Total\s*Value\s*\)?\s*([\s\S]{0,200}?)(?=\n\s*\n|Inherited|பூர்வீக|Liabilit|கடன்)/i);
  if (saEn) saAmt = sumAmounts(extractAllAmountsFromText(saEn[1]));
  if (!saAmt) { const saTam = src.match(/(?:சுயமாக|தாமாக)[\s\S]{0,60}(?:சொத்து|மதிப்பு|வாங்கிய)([\s\S]{0,300}?)(?=பூர்வீக|பரம்பரை|Inherited|கடன்\s*பொ|Liabilit)/i); if (saTam) saAmt = sumAmounts(extractAllAmountsFromText(saTam[1])); }

  let inhAmt = 0;
  const inhEn = src.match(/Inherited\s*assets[\s\S]{0,60}Total\s*Value\s*\)?\s*([\s\S]{0,200}?)(?=\n\s*\n|9\.\s*Liabilit|கடன்\s*பொறுப்பு|Highest|உயரளவு)/i);
  if (inhEn) inhAmt = sumAmounts(extractAllAmountsFromText(inhEn[1]));
  if (!inhAmt) { const inhTam = src.match(/(?:பூர்வீக|பரம்பரை)[\s\S]{0,30}(?:சொத்து|மதிப்பு)([\s\S]{0,500}?)(?=கடன்\s*பொ|Liabilit|Highest|உயரளவு|10\.\s*|பணை|ML\s|\n\s*\n\s*\n)/i); if (inhTam) inhAmt = sumAmounts(extractAllAmountsFromText(inhTam[1])); }
  const totalAssets = (movable + saAmt + inhAmt) || null;

  // Liabilities
  let totalLiabilities = null;
  const liabSec = src.match(/(?:9\.\s*Liabilities|கடன்\s*பொறுப்புகள்)([\s\S]*?)(?=10\.\s*Liabilit|பிரச்சனைக்குரிய|Highest\s*educational|உயரளவு\s*கல்வி)/i);
  if (liabSec) totalLiabilities = sumAmounts(extractAllAmountsFromText(liabSec[1])) || null;

  // Education
  let education = null;
  const eduEn = partB.match(/(?:Highest\s*educational|educational)\s*qualification[:\s-]*([\s\S]{3,400}?)(?=\n\s*\n|\bVERIFICATION\b|\bசரிபார்ப்பு\b)/i)
    || normalized.match(/\(10\)\s*My\s*educational\s*qualification[\s\S]{0,30}?:\s*-?\s*([\s\S]{3,400}?)(?=\n\s*\(11\)|\n\s*PART[\s-]*B|\nM\.\w+KUMAR)/i);
  if (eduEn) {
    const items = eduEn[1].match(/\d+\.\s*[^\n]+/g);
    if (items?.length) education = items[items.length - 1].replace(/^\d+\.\s*/, '').trim();
    if (!education) { const fl = eduEn[1].trim().split('\n')[0].trim(); if (fl.length > 3 && fl.length < 200) education = fl; }
  }
  if (!education) {
    const tamEdu = normalized.match(/கல்வித்\s*தகுதி[:\s-]*([\s\S]{3,300}?)(?=\n\s*\n|சரிபார்ப்பு)/);
    if (tamEdu) { const fl = tamEdu[1].trim().split('\n')[0].trim(); if (fl.length > 3) education = fl; }
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

// ──── OCR pipeline ────
async function ocrPdf(pdfPath, cacheKey) {
  const ocrCachePath = path.join(affidavitCacheDir, `${cacheKey}.txt`);

  if (!FORCE_REPROCESS) {
    try {
      return await fs.readFile(ocrCachePath, 'utf8');
    } catch { /* no cache */ }
  }

  const workDir = path.join(tempDir, cacheKey);
  await fs.mkdir(workDir, { recursive: true });

  try {
    // Get page count and only OCR last 8 pages (Part B is at the end)
    let firstPage = 1;
    try {
      const { stdout: info } = await execFileAsync('pdfinfo', [pdfPath], { timeout: 10000 });
      const pagesMatch = info.match(/Pages:\s*(\d+)/);
      if (pagesMatch) {
        const total = parseInt(pagesMatch[1], 10);
        if (total > 8) firstPage = total - 7;
      }
    } catch { /* pdfinfo might not be available, process all pages */ }

    const pdftoppmArgs = ['-r', '200', '-png'];
    if (firstPage > 1) pdftoppmArgs.push('-f', String(firstPage));
    pdftoppmArgs.push(pdfPath, path.join(workDir, 'page'));

    await execFileAsync('pdftoppm', pdftoppmArgs, { timeout: 300000 }).catch(() => {});
    const files = (await fs.readdir(workDir)).filter(f => f.endsWith('.png')).sort();
    if (!files.length) return null;

    let text = '';
    for (const f of files) {
      try {
        const { stdout } = await execFileAsync('tesseract', [path.join(workDir, f), '-', '--oem', '3', '-l', 'tam+eng'], {
          timeout: 60000, maxBuffer: 10 * 1024 * 1024,
        });
        text += stdout + '\n\n';
      } catch { /* skip corrupt page */ }
    }
    if (!text.trim()) return null;

    await fs.writeFile(ocrCachePath, text, 'utf8');
    return text;
  } finally {
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function processProfile(url, profile) {
  if (!profile.pdfToken) return null;

  const cacheKey = url.replace(/.*\//, '').replace(/[^a-zA-Z0-9-]/g, '') || 'unknown';

  // Download PDF
  const pdfPath = path.join(tempDir, `${cacheKey}.pdf`);
  try {
    const pdfUrl = profile.pdfToken.startsWith('http')
      ? profile.pdfToken
      : `${ECI_BASE_URL}/affidavit-pdf-download/${profile.pdfToken}`;
    const response = await fetch(pdfUrl, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; TN-Election-Dashboard/1.0)' },
    });
    if (!response.ok) return null;
    await fs.writeFile(pdfPath, Buffer.from(await response.arrayBuffer()));
  } catch {
    return null;
  }

  try {
    const ocrText = await ocrPdf(pdfPath, cacheKey);
    if (!ocrText) return null;
    return extractAffidavitSummary(ocrText);
  } catch (err) {
    console.warn(`  OCR failed for ${profile.labels?.Name || cacheKey}: ${err.message}`);
    return null;
  } finally {
    await fs.rm(pdfPath, { force: true }).catch(() => {});
  }
}

// ──── Main ────
async function main() {
  await fs.mkdir(affidavitCacheDir, { recursive: true });
  await fs.mkdir(tempDir, { recursive: true });

  const profiles = JSON.parse(readFileSync(profileCachePath, 'utf8'));
  const entries = Object.entries(profiles).filter(([, p]) => p.pdfToken);

  // Skip profiles that already have .txt cache files
  const toProcess = [];
  for (const [url, prof] of entries) {
    const cacheKey = url.replace(/.*\//, '').replace(/[^a-zA-Z0-9-]/g, '') || 'unknown';
    const txtPath = path.join(affidavitCacheDir, `${cacheKey}.txt`);
    if (!FORCE_REPROCESS && existsSync(txtPath)) {
      // Already processed — just re-extract from cached text
      const ocrText = readFileSync(txtPath, 'utf8');
      const affidavit = extractAffidavitSummary(ocrText);
      profiles[url].affidavit = affidavit;
    } else {
      toProcess.push([url, prof]);
    }
  }

  const total = Math.min(toProcess.length, LIMIT);
  console.log(`Profiles with PDF: ${entries.length}`);
  console.log(`Already cached .txt: ${entries.length - toProcess.length}`);
  console.log(`To process: ${total} (concurrency: ${CONCURRENCY})`);

  let completed = 0;
  let withCriminal = 0;
  let withAssets = 0;
  let failed = 0;

  // Process with concurrency
  const batch = toProcess.slice(0, total);
  let idx = 0;

  async function worker() {
    while (idx < batch.length) {
      const i = idx++;
      const [url, prof] = batch[i];
      const name = prof.labels?.Name || 'Unknown';

      try {
        const t0 = Date.now();
        const affidavit = await processProfile(url, prof);
        const elapsed = ((Date.now() - t0) / 1000).toFixed(0);

        if (affidavit) {
          profiles[url].affidavit = affidavit;
          if (affidavit.criminalCases != null) withCriminal++;
          if (affidavit.assetsText) withAssets++;
          completed++;
          console.log(`[${completed}/${total}] ${name.padEnd(25)} ${elapsed}s | Crim:${String(affidavit.criminalCases ?? '-').padEnd(3)} | Assets:${affidavit.assetsText ? '✓' : '-'} | Edu:${affidavit.education ? '✓' : '-'}`);
        } else {
          failed++;
          completed++;
          console.log(`[${completed}/${total}] ${name.padEnd(25)} ${elapsed}s | FAILED`);
        }
      } catch (err) {
        failed++;
        completed++;
        console.log(`[${completed}/${total}] ${name.padEnd(25)} | ERROR: ${err.message}`);
      }

      // Save progress every 10 candidates
      if (completed % 10 === 0) {
        await fs.writeFile(profileCachePath, JSON.stringify(profiles, null, 2) + '\n', 'utf8');
      }
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, batch.length) }, () => worker());
  await Promise.all(workers);

  // Final save
  await fs.writeFile(profileCachePath, JSON.stringify(profiles, null, 2) + '\n', 'utf8');

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`Done! Processed: ${completed}, Failed: ${failed}`);
  console.log(`With criminal cases: ${withCriminal}`);
  console.log(`With assets data: ${withAssets}`);
  console.log(`Updated profiles.json`);
}

main().catch(err => { console.error(err); process.exitCode = 1; });
