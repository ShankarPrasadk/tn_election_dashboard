import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

import { CANDIDATES_2026 } from '../src/data/candidates2026.js';
import { CONSTITUENCY_DATA } from '../src/data/electionData.js';
import {
  generateCandidateAvatarUrl,
  generateCandidateId,
  normalizeName,
  normalizeText,
  parseIndianCurrencyToCrores,
} from '../src/data/candidateUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.resolve(__dirname, '../public/data/tn-candidate-directory.json');
const cacheDir = path.resolve(__dirname, '../.cache/eci-2026');
const listingCachePath = path.join(cacheDir, 'listing.json');
const profileCachePath = path.join(cacheDir, 'profiles.json');
const affidavitCacheDir = path.join(cacheDir, 'affidavits');
const tempDoclingDir = path.join(os.tmpdir(), 'tn-election-dashboard-docling');
const execFileAsync = promisify(execFile);

const ECI_BASE_URL = 'https://affidavit.eci.gov.in';
const ECI_LISTING_URL = `${ECI_BASE_URL}/candidate-affidavit`;
const ECI_STATE_NAME = 'Tamil Nadu';
const DOCILING_TIMEOUT_MS = 180000;
const PARTY_ALIASES = {
  AIADMK: ['aiadmk', 'all india anna dravida munnetra kazhagam'],
  AMMK: ['ammk', 'amma makkal munnetra kazagam'],
  BJP: ['bjp', 'bharatiya janata party'],
  CPI: ['cpi', 'communist party of india'],
  'CPI(M)': ['cpi m', 'cpim', 'communist party of india marxist', 'communist party of india (marxist)'],
  DMDK: ['dmdk', 'desiya murpokku dravida kazhagam'],
  DMK: ['dmk', 'dravida munnetra kazhagam'],
  INC: ['inc', 'congress', 'indian national congress'],
  IUML: ['iuml', 'indian union muslim league'],
  MDMK: ['mdmk', 'marumalarchi dravida munnetra kazhagam'],
  NTK: ['ntk', 'naam tamilar katchi'],
  PMK: ['pmk', 'pattali makkal katchi'],
  TVK: ['tvk', 'tamilaga vettri kazhagam'],
  VCK: ['vck', 'viduthalai chiruthaigal katchi'],
  IND: ['ind', 'independent'],
};

const YEAR_SOURCES = [
  { year: 2006, baseUrl: 'https://www.myneta.info/tn2006' },
  { year: 2011, baseUrl: 'https://www.myneta.info/tamilnadu2011' },
  { year: 2016, baseUrl: 'https://www.myneta.info/tamilnadu2016' },
  { year: 2021, baseUrl: 'https://www.myneta.info/TamilNadu2021' },
];

let profileCachePromise;

const constituencyLookup = new Map(
  CONSTITUENCY_DATA.map((item) => [normalizeText(item.name).toLowerCase(), item])
);

async function sleep(milliseconds) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function ensureCacheDirectories() {
  await fs.mkdir(cacheDir, { recursive: true });
  await fs.mkdir(affidavitCacheDir, { recursive: true });
  await fs.mkdir(tempDoclingDir, { recursive: true });
}

async function readJsonIfExists(filePath, fallbackValue) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return fallbackValue;
    }

    throw error;
  }
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const itemIndex = currentIndex;
      currentIndex += 1;
      results[itemIndex] = await mapper(items[itemIndex], itemIndex);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function fetchTextWithRetry(url, attempts = 4) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; TN-Election-Dashboard/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(500 * attempt);
      }
    }
  }

  throw lastError;
}

async function withBrowserPage(task) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (compatible; TN-Election-Dashboard/1.0)',
  });

  try {
    return await task(page);
  } finally {
    await page.close();
    await browser.close();
  }
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

function normalizeConstituencyKey(value) {
  return normalizeText(value).toUpperCase().replace(/\s+/g, ' ');
}

function toTitleCase(value) {
  return normalizeText(value).replace(/\w\S*/g, (word) => {
    // Keep short connectors lowercase, uppercase rest
    if (['of', 'and', 'the', 'in'].includes(word.toLowerCase())) return word.toLowerCase();
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).replace(/\(\w/g, (match) => match.toUpperCase());
}

function normalizePartyKey(value) {
  return normalizeName(value).replace(/\s+/g, ' ').trim();
}

function getPartyAliasSet(party) {
  const aliases = PARTY_ALIASES[party] || [];
  return new Set([normalizePartyKey(party), ...aliases.map((value) => normalizePartyKey(value))].filter(Boolean));
}

function normalizePartyName(rawParty) {
  const key = normalizePartyKey(rawParty);
  for (const [canonical, aliases] of Object.entries(PARTY_ALIASES)) {
    const aliasKeys = aliases.map((value) => normalizePartyKey(value));
    if (normalizePartyKey(canonical) === key || aliasKeys.includes(key)) {
      return canonical;
    }
  }
  return normalizeText(rawParty);
}

function extractInputValue(html, id) {
  const byIdFirst = html.match(new RegExp(`<input[^>]*id=["']${id}["'][^>]*value=["']([^"']*)["']`, 'i'));
  if (byIdFirst) {
    return decodeEntities(byIdFirst[1]);
  }

  const byValueFirst = html.match(new RegExp(`<input[^>]*value=["']([^"']*)["'][^>]*id=["']${id}["']`, 'i'));
  return byValueFirst ? decodeEntities(byValueFirst[1]) : null;
}

function extractLabelValuePairs(html) {
  const pairs = {};
  const matches = html.matchAll(/<label[^>]*>\s*<p>([^<:]+):?\s*<\/p>\s*<\/label>\s*<div class=["']col-sm-6["']>\s*<p>([\s\S]*?)<\/p>/gi);

  for (const match of matches) {
    const label = normalizeText(match[1]);
    const value = stripTags(match[2]);
    if (label && value) {
      pairs[label] = value;
    }
  }

  return pairs;
}

function extractEciCards(html, listingUrl) {
  const cardRegex = /<img[^>]+src="([^"]*candprofile[^"]*)"[^>]*>[\s\S]{0,2600}?<h4[^>]*>(.*?)<\/h4>[\s\S]{0,700}?<strong>Party :<\/strong>\s*([^<]+)<\/p>[\s\S]{0,250}?<strong>Status :<\/strong>\s*<strong><font[^>]*>([^<]+)<\/font><\/strong>[\s\S]{0,250}?<strong>State :<\/strong>\s*([^<]+)<\/p>[\s\S]{0,250}?<strong>Constituency :<\/strong>\s*([^<]+)<\/p>[\s\S]{0,900}?<a href="(https:\/\/affidavit\.eci\.gov\.in\/show-profile\/[^"]+)"/gi;
  const cards = [];

  for (const match of html.matchAll(cardRegex)) {
    cards.push({
      photo: normalizeText(match[1]),
      name: stripTags(match[2]),
      party: stripTags(match[3]),
      status: stripTags(match[4]),
      state: stripTags(match[5]),
      constituency: stripTags(match[6]),
      profileUrl: normalizeText(match[7]),
      listingUrl,
    });
  }

  return cards;
}

function extractCurrencyAfterLabel(text, labelPatterns) {
  for (const pattern of labelPatterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const value = normalizeText(match[1])
        .replace(/^[:\-–]+\s*/, '')
        .replace(/^[|]+\s*/, '')
        .replace(/\s*[|].*$/, '');

      const digits = value.replace(/[^\d]/g, '');
      if ((/\b(?:rs|inr)\b/i.test(value) || digits.length >= 5) && !/^\d+\.?\s/i.test(value)) {
        return value;
      }
    }
  }

  return null;
}

function extractTextAfterLabel(text, labelPatterns) {
  for (const pattern of labelPatterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const value = normalizeText(match[1]).replace(/\s*[|].*$/, '');
      if (value) {
        return value;
      }
    }
  }

  return null;
}

function extractAffidavitSummary(markdown) {
  const normalized = normalizeText(String(markdown || '')
    .replace(/\r/g, '\n')
    .replace(/\n+/g, '\n')
    .replace(/₹/g, 'Rs. '));

  const criminalCount = extractTextAfterLabel(normalized, [
    /pending criminal cases[^\d]{0,30}(\d{1,2})/i,
    /criminal cases[^\d]{0,20}(\d{1,2})/i,
    /number of pending criminal cases[^\d]{0,30}(\d{1,2})/i,
  ]);
  const criminalCases = criminalCount != null ? Number(criminalCount) : null;

  return {
    criminalCases,
    criminalCasesText: criminalCases != null ? `${criminalCases} declared criminal case${criminalCases === 1 ? '' : 's'}` : null,
    education: extractTextAfterLabel(normalized, [
      /educational qualification[^A-Za-z0-9]{0,30}([^\n]{3,120})/i,
      /highest school\/university education[^A-Za-z0-9]{0,30}([^\n]{3,120})/i,
      /highest educational qualification[^A-Za-z0-9]{0,30}([^\n]{3,120})/i,
    ]),
    assetsText: extractCurrencyAfterLabel(normalized, [
      /total assets[^\dR]{0,30}((?:Rs\.?|INR)?\s?[\d,]+(?:\.\d+)?[^\n]{0,40})/i,
      /total value of movable assets[^\dR]{0,30}((?:Rs\.?|INR)?\s?[\d,]+(?:\.\d+)?[^\n]{0,40})/i,
      /movable assets[^\dR]{0,30}((?:Rs\.?|INR)?\s?[\d,]+(?:\.\d+)?[^\n]{0,40})/i,
    ]),
    liabilitiesText: extractCurrencyAfterLabel(normalized, [
      /total liabilities[^\dR]{0,30}((?:Rs\.?|INR)?\s?[\d,]+(?:\.\d+)?[^\n]{0,40})/i,
      /liabilities[^\dR]{0,30}((?:Rs\.?|INR)?\s?[\d,]+(?:\.\d+)?[^\n]{0,40})/i,
      /dues[^\dR]{0,30}((?:Rs\.?|INR)?\s?[\d,]+(?:\.\d+)?[^\n]{0,40})/i,
    ]),
    selfProfession: extractTextAfterLabel(normalized, [
      /self profession[^A-Za-z0-9]{0,20}([^\n]{3,120})/i,
    ]),
    spouseProfession: extractTextAfterLabel(normalized, [
      /spouse profession[^A-Za-z0-9]{0,20}([^\n]{3,120})/i,
    ]),
  };
}

async function resolvePythonBin() {
  const candidates = [
    process.env.DOCLING_PYTHON,
    process.env.PYTHON_BIN,
    path.resolve(__dirname, '../../.venv/bin/python'),
    'python3',
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      if (candidate.includes(path.sep)) {
        await fs.access(candidate);
        return candidate;
      }

      const { stdout } = await execFileAsync('sh', ['-lc', `command -v ${candidate}`], { timeout: 10000 });
      if (stdout.trim()) {
        return candidate;
      }
    } catch {
      // Try the next candidate.
    }
  }

  return null;
}

async function runDoclingOnPdf(pdfPath, cacheKey) {
  await ensureCacheDirectories();

  const markdownPath = path.join(affidavitCacheDir, `${cacheKey}.md`);
  try {
    return await fs.readFile(markdownPath, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  const pythonBin = await resolvePythonBin();
  if (!pythonBin) {
    return null;
  }

  const script = [
    'from docling.document_converter import DocumentConverter',
    'import pathlib, sys',
    'result = DocumentConverter().convert(sys.argv[1])',
    'pathlib.Path(sys.argv[2]).write_text(result.document.export_to_markdown(), encoding="utf-8")',
  ].join('; ');

  await execFileAsync(
    pythonBin,
    ['-c', script, pdfPath, markdownPath],
    { timeout: DOCILING_TIMEOUT_MS, maxBuffer: 40 * 1024 * 1024 }
  );

  return fs.readFile(markdownPath, 'utf8');
}

async function fetchAffidavitSummary(pdfToken, cacheKey) {
  if (!pdfToken) {
    return null;
  }

  await ensureCacheDirectories();

  const pdfPath = path.join(tempDoclingDir, `${cacheKey}.pdf`);
  const pdfUrl = `${ECI_BASE_URL}/affidavit-pdf-download/${pdfToken}`;
  const response = await fetch(pdfUrl, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; TN-Election-Dashboard/1.0)',
    },
  });

  if (!response.ok) {
    return null;
  }

  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(pdfPath, Buffer.from(arrayBuffer));

  try {
    const markdown = await runDoclingOnPdf(pdfPath, cacheKey);
    return markdown ? extractAffidavitSummary(markdown) : null;
  } catch {
    return null;
  }
}

async function loadProfileCache() {
  if (!profileCachePromise) {
    profileCachePromise = readJsonIfExists(profileCachePath, {});
  }

  return profileCachePromise;
}

async function fetch2026ListingCards() {
  if (!process.env.REFRESH_ECI_2026) {
    const cached = await readJsonIfExists(listingCachePath, null);
    if (cached?.cards?.length) {
      return cached.cards;
    }
  }

  const firstHtml = await fetchTextWithRetry(ECI_LISTING_URL, 4);
  const pageNumbers = [...firstHtml.matchAll(/candidate-affidavit\?page=(\d+)/g)].map((match) => Number(match[1]));
  const maxPage = Math.max(1, ...pageNumbers);
  const pageLimit = process.env.ECI_PAGE_LIMIT ? Math.min(maxPage, Number(process.env.ECI_PAGE_LIMIT)) : maxPage;
  const pages = Array.from({ length: pageLimit }, (_, index) => index + 1);

  const results = await mapWithConcurrency(pages, 8, async (pageNumber) => {
    const listingUrl = pageNumber === 1 ? ECI_LISTING_URL : `${ECI_LISTING_URL}?page=${pageNumber}`;
    const html = pageNumber === 1 ? firstHtml : await fetchTextWithRetry(listingUrl, 4);
    return extractEciCards(html, listingUrl).filter((card) => card.state === ECI_STATE_NAME);
  });

  const cards = results.flat();
  await writeJson(listingCachePath, {
    fetchedAt: new Date().toISOString(),
    totalPages: pageLimit,
    cards,
  });

  return cards;
}

async function fetch2026ProfileDetail(card) {
  const cache = await loadProfileCache();
  if (!process.env.REFRESH_ECI_2026 && cache[card.profileUrl]) {
    return cache[card.profileUrl];
  }

  try {
    const html = await fetchTextWithRetry(card.profileUrl, 3);
    const labels = extractLabelValuePairs(html);
    const affidavitId = extractInputValue(html, 'candidate_affidavit_idHidden') || null;
    const pdfToken = affidavitId ? extractInputValue(html, `pdfUrl${affidavitId}`) : null;
    const cacheKey = generateCandidateId(card.name, card.party, card.constituency, 'eci-2026');
    const affidavit = await fetchAffidavitSummary(pdfToken, cacheKey);

    const detail = {
      labels,
      affidavitId,
      pdfToken,
      affidavit,
      fetchedAt: new Date().toISOString(),
    };

    cache[card.profileUrl] = detail;
    await writeJson(profileCachePath, cache);
    return detail;
  } catch (error) {
    console.warn(`Skipping profile fetch for ${card.name} (${card.constituency}): ${error.cause?.code || error.message}`);
    return { labels: {}, affidavit: {} };
  }
}

async function loadExistingHistoricalEntries() {
  const existing = await readJsonIfExists(outputPath, null);
  if (!existing?.entries?.length) {
    return [];
  }

  return existing.entries.filter((entry) => entry.year !== 2026);
}

function nameTokens(value) {
  return normalizeName(value).split(/\s+/).filter((token) => token.length > 1);
}

function fuzzyNameMatch(nameA, nameB) {
  const tokensA = nameTokens(nameA);
  const tokensB = nameTokens(nameB);
  if (!tokensA.length || !tokensB.length) {
    return false;
  }

  const shared = tokensA.filter((token) => tokensB.some((other) => other.includes(token) || token.includes(other)));
  return shared.length >= Math.min(tokensA.length, tokensB.length, 2);
}

function match2026Card(entry, cardsByConstituency) {
  const constituencyKey = normalizeConstituencyKey(entry.constituency);
  const candidates = cardsByConstituency.get(constituencyKey) || [];
  if (!candidates.length) {
    return null;
  }

  const nameKey = normalizeName(entry.name);
  const partyAliases = getPartyAliasSet(entry.party);

  const exact = candidates.find((card) => normalizeName(card.name) === nameKey && partyAliases.has(normalizePartyKey(card.party)));
  if (exact) {
    return exact;
  }

  const exactName = candidates.find((card) => normalizeName(card.name) === nameKey);
  if (exactName) {
    return exactName;
  }

  const substringMatch = candidates.find((card) => normalizeName(card.name).includes(nameKey) || nameKey.includes(normalizeName(card.name)));
  if (substringMatch) {
    return substringMatch;
  }

  const fuzzyWithParty = candidates.find((card) => fuzzyNameMatch(entry.name, card.name) && partyAliases.has(normalizePartyKey(card.party)));
  if (fuzzyWithParty) {
    return fuzzyWithParty;
  }

  return candidates.find((card) => fuzzyNameMatch(entry.name, card.name)) || null;
}

function parseCriminalCases(value) {
  const match = String(value || '').match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

function extractDetailField(html, pattern) {
  const match = html.match(pattern);
  return match ? stripTags(match[1]) : null;
}

async function fetchHistoricalCandidateDetail(detailUrl) {
  if (!detailUrl) {
    return null;
  }

  const html = await fetchTextWithRetry(detailUrl, 3);

  const photoMatch = html.match(/<img[^>]+src="(https?:\/\/[^"]*images_candidate[^"]+)"/i)
    || html.match(/<img[^>]+src="([^"]*images_candidate[^"]+)"/i);
  let photo = null;
  if (photoMatch) {
    const src = photoMatch[1];
    photo = src.startsWith('http') ? src : `https://myneta.info${src.startsWith('/') ? '' : '/'}${src}`;
  }

  return {
    ageText: extractDetailField(html, /<b>\s*Age:\s*<\/b>\s*([^<]+)/i),
    voterEnrollment: extractDetailField(html, /<b>\s*Name Enrolled as Voter in:\s*<\/b>\s*([^<]+)/i),
    selfProfession: extractDetailField(html, /<b>\s*Self Profession:\s*<\/b>\s*([^<]+)/i),
    spouseProfession: extractDetailField(html, /<b>\s*Spouse Profession:\s*<\/b>\s*([^<]+)/i),
    photo,
  };
}

async function fetchHistoricalYear(config) {
  const firstPageUrl = `${config.baseUrl}/index.php?action=summary&subAction=candidates_analyzed&sort=candidate`;
  const firstHtml = await fetchTextWithRetry(firstPageUrl);
  const pageMatch = firstHtml.match(/of <strong>(\d+)<\/strong> pages/i);
  const totalPages = pageMatch ? Number(pageMatch[1]) : 1;

  return withBrowserPage(async (page) => {
    const entries = [];

    for (let pageIndex = 1; pageIndex <= totalPages; pageIndex += 1) {
      const url = pageIndex === 1
        ? firstPageUrl
        : `${config.baseUrl}/index.php?action=summary&subAction=candidates_analyzed&sort=candidate&page=${pageIndex}`;

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
      await page.waitForSelector('table tr td', { timeout: 120000 });

      const rows = await page.evaluate(() => {
        const tables = [...document.querySelectorAll('table')];
        const targetTable = tables.find((table) => {
          const headers = [...table.querySelectorAll('th')].map((cell) => cell.textContent.replace(/\s+/g, ' ').trim());
          return headers.includes('Sno')
            && headers.some((value) => value.startsWith('Candidate'))
            && headers.includes('Constituency')
            && headers.includes('Party')
            && headers.includes('Liabilities');
        });

        if (!targetTable) {
          return [];
        }

        return [...targetTable.querySelectorAll('tr')]
          .map((row) => [...row.querySelectorAll('td, th')].map((cell) => cell.textContent.replace(/\s+/g, ' ').trim()))
          .filter((cells) => cells.length >= 8 && cells[0].toLowerCase() !== 'sno')
          .map((cells) => ({
            serial: cells[0],
            name: cells[1],
            constituency: cells[2],
            party: cells[3],
            criminalCasesText: cells[4],
            education: cells[5],
            assetsText: cells[6],
            liabilitiesText: cells[7],
          }));
      });

      const detailedRows = await page.evaluate(() => {
        const tables = [...document.querySelectorAll('table')];
        const targetTable = tables.find((table) => {
          const headers = [...table.querySelectorAll('th')].map((cell) => cell.textContent.replace(/\s+/g, ' ').trim());
          return headers.includes('Sno')
            && headers.some((value) => value.startsWith('Candidate'))
            && headers.includes('Constituency')
            && headers.includes('Party')
            && headers.includes('Liabilities');
        });

        if (!targetTable) {
          return [];
        }

        return [...targetTable.querySelectorAll('tr')]
          .map((row) => {
            const cells = [...row.querySelectorAll('td')];
            if (cells.length < 8) {
              return null;
            }

            const anchor = cells[1]?.querySelector('a');

            return {
              serial: cells[0]?.textContent.replace(/\s+/g, ' ').trim(),
              name: cells[1]?.textContent.replace(/\s+/g, ' ').trim(),
              constituency: cells[2]?.textContent.replace(/\s+/g, ' ').trim(),
              party: cells[3]?.textContent.replace(/\s+/g, ' ').trim(),
              criminalCasesText: cells[4]?.textContent.replace(/\s+/g, ' ').trim(),
              education: cells[5]?.textContent.replace(/\s+/g, ' ').trim(),
              assetsText: cells[6]?.textContent.replace(/\s+/g, ' ').trim(),
              liabilitiesText: cells[7]?.textContent.replace(/\s+/g, ' ').trim(),
              detailUrl: anchor ? new URL(anchor.getAttribute('href'), window.location.href).href : null,
            };
          })
          .filter((row) => row && row.serial?.toLowerCase() !== 'sno');
      });

      if (process.env.DEBUG_CANDIDATES) {
        console.log(`Historical scrape ${config.year} page ${pageIndex}/${totalPages}: ${rows.length} rows`);
      }

      const normalizedRows = detailedRows.length > 0 ? detailedRows : rows;
      const enrichedEntries = await mapWithConcurrency(normalizedRows, 8, async (row) => {
        const constituencyInfo = constituencyLookup.get(normalizeText(row.constituency).toLowerCase()) || {};
        const detail = await fetchHistoricalCandidateDetail(row.detailUrl);

        return {
          id: generateCandidateId(row.name, row.party, row.constituency, config.year),
          year: config.year,
          name: row.name,
          party: row.party,
          constituency: row.constituency,
          district: constituencyInfo.district || null,
          reserved: constituencyInfo.reserved || null,
          status: 'Historical Candidate',
          criminalCases: parseCriminalCases(row.criminalCasesText),
          criminalCasesText: row.criminalCasesText,
          education: row.education,
          assetsText: row.assetsText,
          liabilitiesText: row.liabilitiesText,
          assetsCrores: parseIndianCurrencyToCrores(row.assetsText),
          liabilitiesCrores: parseIndianCurrencyToCrores(row.liabilitiesText),
          ageText: detail?.ageText || null,
          voterEnrollment: detail?.voterEnrollment || null,
          selfProfession: detail?.selfProfession || null,
          spouseProfession: detail?.spouseProfession || null,
          photo: detail?.photo || generateCandidateAvatarUrl(row.name, row.party),
          source: {
            label: 'Myneta summary',
            url,
            detailUrl: row.detailUrl || null,
          },
        };
      });

      entries.push(...enrichedEntries);
    }

    return entries;
  });
}

async function build2026Entries() {
  const baseEntries = [];

  CANDIDATES_2026.forEach((seat) => {
    Object.entries(seat.candidates).forEach(([party, name]) => {
      if (!name || normalizeText(name).toUpperCase() === 'TBD') {
        return;
      }

      baseEntries.push({
        id: generateCandidateId(name, party, seat.constituency, 2026),
        year: 2026,
        name,
        party,
        constituency: seat.constituency,
        district: seat.district,
        reserved: seat.reserved || null,
        status: 'Upcoming Candidate',
        criminalCases: null,
        criminalCasesText: 'Awaiting final affidavit sync',
        education: 'Awaiting final affidavit sync',
        assetsText: 'Awaiting final affidavit sync',
        liabilitiesText: 'Awaiting final affidavit sync',
        assetsCrores: null,
        liabilitiesCrores: null,
        ageText: null,
        voterEnrollment: null,
        selfProfession: null,
        spouseProfession: null,
        photo: generateCandidateAvatarUrl(name, party),
        source: {
          label: '2026 constituency sheet',
          url: null,
          detailUrl: null,
        },
      });
    });
  });

  const cards = await fetch2026ListingCards();
  const cardsByConstituency = cards.reduce((accumulator, card) => {
    const key = normalizeConstituencyKey(card.constituency);
    if (!accumulator.has(key)) {
      accumulator.set(key, []);
    }

    accumulator.get(key).push(card);
    return accumulator;
  }, new Map());

  const matchedCards = new Set();

  const enrichedBase = await mapWithConcurrency(baseEntries, 3, async (entry) => {
    const card = match2026Card(entry, cardsByConstituency);
    if (!card) {
      return entry;
    }

    matchedCards.add(card);

    try {
      const detail = await fetch2026ProfileDetail(card);
      const labels = detail.labels || {};
      const affidavit = detail.affidavit || {};
      const assetsText = affidavit.assetsText || entry.assetsText;
      const liabilitiesText = affidavit.liabilitiesText || entry.liabilitiesText;
      const criminalCasesText = affidavit.criminalCasesText || entry.criminalCasesText;

      return {
        ...entry,
        status: card.status ? `Affidavit ${card.status}` : entry.status,
        criminalCases: affidavit.criminalCases ?? entry.criminalCases,
        criminalCasesText,
        education: affidavit.education || labels['Educational Qualification'] || entry.education,
        assetsText,
        liabilitiesText,
        assetsCrores: parseIndianCurrencyToCrores(assetsText),
        liabilitiesCrores: parseIndianCurrencyToCrores(liabilitiesText),
        ageText: labels.Age || entry.ageText,
        voterEnrollment: labels['Name Enrolled as Voter in'] || entry.voterEnrollment,
        selfProfession: affidavit.selfProfession || labels['Self Profession'] || entry.selfProfession,
        spouseProfession: affidavit.spouseProfession || labels['Spouse Profession'] || entry.spouseProfession,
        photo: card.photo || entry.photo,
        source: {
          label: 'Election Commission of India affidavit portal',
          url: card.listingUrl,
          detailUrl: card.profileUrl,
          affidavitPdfUrl: detail.pdfToken ? `${ECI_BASE_URL}/affidavit-pdf-download/${detail.pdfToken}` : null,
        },
      };
    } catch (error) {
      console.warn(`Skipping enrichment for ${entry.name}: ${error.cause?.code || error.message}`);
      return { ...entry, photo: card.photo || entry.photo };
    }
  });

  // Add unmatched ECI cards as new entries using listing card data (photos + basic info)
  // Profile details are only fetched for already-cached profiles to avoid slow ECI fetching
  const unmatchedCards = cards.filter((card) => !matchedCards.has(card));
  const profileCache = await loadProfileCache();
  const unmatchedEntries = await mapWithConcurrency(unmatchedCards, 3, async (card) => {
    const constituencyInfo = constituencyLookup.get(normalizeText(card.constituency).toLowerCase()) || {};
    const partyAbbr = Object.entries(PARTY_ALIASES).find(
      ([, aliases]) => aliases.some((alias) => normalizePartyKey(alias) === normalizePartyKey(card.party))
    )?.[0] || card.party;

    // Use cached profile if available, otherwise skip slow fetch
    const cachedDetail = profileCache[card.profileUrl];
    const labels = cachedDetail?.labels || {};
    const affidavit = cachedDetail?.affidavit || {};

    return {
      id: generateCandidateId(card.name, partyAbbr, card.constituency, 2026),
      year: 2026,
      name: card.name,
      party: partyAbbr,
      constituency: card.constituency,
      district: constituencyInfo.district || null,
      reserved: constituencyInfo.reserved || null,
      status: card.status ? `Affidavit ${card.status}` : 'ECI Filed Candidate',
      criminalCases: affidavit.criminalCases ?? null,
      criminalCasesText: affidavit.criminalCasesText || 'Awaiting final affidavit sync',
      education: affidavit.education || labels['Educational Qualification'] || 'Awaiting final affidavit sync',
      assetsText: affidavit.assetsText || 'Awaiting final affidavit sync',
      liabilitiesText: affidavit.liabilitiesText || 'Awaiting final affidavit sync',
      assetsCrores: parseIndianCurrencyToCrores(affidavit.assetsText),
      liabilitiesCrores: parseIndianCurrencyToCrores(affidavit.liabilitiesText),
      ageText: labels.Age || null,
      voterEnrollment: labels['Name Enrolled as Voter in'] || null,
      selfProfession: affidavit.selfProfession || labels['Self Profession'] || null,
      spouseProfession: affidavit.spouseProfession || labels['Spouse Profession'] || null,
      photo: card.photo || generateCandidateAvatarUrl(card.name, partyAbbr),
      source: {
        label: 'Election Commission of India affidavit portal',
        url: card.listingUrl,
        detailUrl: card.profileUrl,
      },
    };
  });

  console.log(`2026 entries: ${enrichedBase.length} base + ${unmatchedEntries.length} ECI-only (${matchedCards.size} matched)`);
  return [...enrichedBase, ...unmatchedEntries];
}

async function loadElectionResults() {
  // Load authoritative election results from therdhal data (2016, 2021)
  const resultsByYear = new Map();

  for (const year of [2016, 2021]) {
    const filePath = path.resolve(__dirname, `../.cache/therdhal/elections-${year}.json`);
    try {
      const data = JSON.parse(await fs.readFile(filePath, 'utf8'));

      // Build lookup: constituency name → { winner, candidates[] }
      const byConstituency = new Map();
      for (const [, constituency] of Object.entries(data.constituencies)) {
        const key = normalizeConstituencyKey(constituency.name);
        byConstituency.set(key, {
          name: constituency.name,
          district: constituency.district,
          type: constituency.type,
          totalVotes: constituency.total_votes,
          electors: typeof constituency.electors === 'object' ? constituency.electors[year] : constituency.electors,
          turnout: constituency.turnout_percent,
          candidates: constituency.candidates || [],
        });
      }

      resultsByYear.set(year, byConstituency);
      console.log(`Election results ${year}: ${byConstituency.size} constituencies loaded`);
    } catch (error) {
      console.warn(`Could not load election results for ${year}:`, error.message);
    }
  }

  return resultsByYear;
}

function matchElectionResult(entry, resultsByYear) {
  const yearResults = resultsByYear.get(entry.year);
  if (!yearResults) return null;

  const key = normalizeConstituencyKey(entry.constituency);
  const constituency = yearResults.get(key);
  if (!constituency) return null;

  // Find this candidate in the results
  const match = constituency.candidates.find((c) =>
    fuzzyNameMatch(entry.name, c.name)
  );

  return { constituency, candidate: match || null };
}

async function main() {
  await ensureCacheDirectories();

  const historicalResults = process.env.REUSE_EXISTING_HISTORICAL
    ? await loadExistingHistoricalEntries()
    : [];

  if (!historicalResults.length) {
    for (const source of YEAR_SOURCES) {
      historicalResults.push(...await fetchHistoricalYear(source));
    }
  }

  // Load therdhal election results for accurate winner/votes data
  const resultsByYear = await loadElectionResults();

  const rawEntries = [...historicalResults, ...await build2026Entries()];

  // Post-processing: fix assets, normalize parties/constituencies, enrich with election results
  const processed = rawEntries.map((entry) => {
    const normalizedParty = normalizePartyName(entry.party);
    const normalizedConstituency = toTitleCase(entry.constituency);

    // Re-compute assetsCrores/liabilitiesCrores from text (fixes the conversion bug)
    const assetsCrores = parseIndianCurrencyToCrores(entry.assetsText);
    const liabilitiesCrores = parseIndianCurrencyToCrores(entry.liabilitiesText);

    // Enrich with election results for historical entries (always re-evaluate using therdhal data)
    let status = 'Historical Candidate';
    let votes = null;
    let voteShare = null;
    let margin = null;

    if (entry.year === 2026) {
      status = entry.status;
    } else {
      const result = matchElectionResult(entry, resultsByYear);
      if (result?.candidate) {
        status = result.candidate.winner ? 'Won' : 'Lost';
        votes = result.candidate.votes;
        voteShare = result.candidate.vote_share;
        margin = result.candidate.margin || null;
      } else if (result?.constituency) {
        // Constituency found but candidate not matched — mark as Lost
        status = 'Lost';
      }
    }

    return {
      ...entry,
      party: normalizedParty,
      constituency: normalizedConstituency,
      id: generateCandidateId(entry.name, normalizedParty, normalizedConstituency, entry.year),
      assetsCrores,
      liabilitiesCrores,
      status,
      votes,
      voteShare,
      margin,
    };
  });

  // Deduplicate entries by (name, party, constituency, year)
  const seen = new Set();
  const entries = processed.filter((entry) => {
    const key = `${normalizeName(entry.name)}|${normalizePartyKey(entry.party)}|${normalizeConstituencyKey(entry.constituency)}|${entry.year}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((left, right) => right.year - left.year || left.name.localeCompare(right.name));

  const deduped = processed.length - entries.length;
  if (deduped > 0) console.log(`Removed ${deduped} duplicate entries`);

  // Stats
  const wonCount = entries.filter((e) => e.status === 'Won').length;
  const lostCount = entries.filter((e) => e.status === 'Lost').length;
  const withVotes = entries.filter((e) => e.votes).length;
  console.log(`Status: ${wonCount} Won, ${lostCount} Lost, ${withVotes} with vote data`);

  const payload = {
    generatedAt: new Date().toISOString(),
    countsByYear: entries.reduce((accumulator, entry) => {
      accumulator[entry.year] = (accumulator[entry.year] || 0) + 1;
      return accumulator;
    }, {}),
    entries,
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${entries.length} candidate records to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});