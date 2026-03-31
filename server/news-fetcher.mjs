/**
 * News fetcher for TN Election Dashboard
 * Fetches news from Google News RSS and caches in Supabase
 */

// ── All party names & abbreviations contesting 2026 ──
const PARTY_KEYWORDS = {
  DMK: ['DMK', 'Dravida Munnetra Kazhagam', 'M.K. Stalin', 'MK Stalin', 'Udhayanidhi'],
  AIADMK: ['AIADMK', 'ADMK', 'All India Anna Dravida', 'Edappadi', 'EPS', 'Palaniswami'],
  BJP: ['BJP', 'Bharatiya Janata', 'Annamalai', 'K Annamalai'],
  PMK: ['PMK', 'Pattali Makkal', 'Anbumani', 'Ramadoss'],
  DMDK: ['DMDK', 'Desiya Murpokku', 'Vijayakanth', 'Premalatha'],
  TVK: ['TVK', 'Tamilaga Vettri Kazhagam', 'Vijay', 'Actor Vijay'],
  NTK: ['NTK', 'Naam Tamilar', 'Seeman'],
  AMMK: ['AMMK', 'Amma Makkal', 'TTV Dhinakaran', 'Dhinakaran'],
  VCK: ['VCK', 'Viduthalai Chiruthaigal', 'Thirumavalavan'],
  MDMK: ['MDMK', 'Marumalarchi', 'Vaiko'],
  CPI: ['CPI ', 'Communist Party of India'],
  IUML: ['IUML', 'Indian Union Muslim League'],
  IND: ['Independent candidate'],
  BSP: ['BSP', 'Bahujan Samaj'],
  'Naam Indiar Party': ['Naam Indiar'],
  'National People\'s Party': ['National People'],
  'Samata Party': ['Samata Party'],
  'Ganasangam': ['Ganasangam'],
};

// Topics to search for (election-relevant)
const SEARCH_QUERIES = [
  '"Tamil Nadu election" 2026',
  '"TN election" 2026',
  'DMK AIADMK Tamil Nadu',
  'BJP Tamil Nadu election',
  'TVK Vijay Tamil Nadu',
  'NTK Seeman Tamil Nadu',
  'PMK DMDK Tamil Nadu election',
  'Tamil Nadu election commission',
  'Tamil Nadu election crime police',
  'Tamil Nadu constituency election 2026',
  'Tamil Nadu voter election booth',
];

// Category detection keywords
const CATEGORY_PATTERNS = {
  crime: /\b(crime|criminal|arrest|murder|fraud|scam|corruption|bribe|extortion|assault|robbery|theft|cheathing|forgery|fir|chargesheet)\b/i,
  police: /\b(police|cop|inspector|constable|DGP|SP|DSP|IPS|law.?enforcement|raid|seiz)\b/i,
  commission: /\b(election commission|ECI|SEC|TNSEC|model code|code of conduct|nomination|affidavit|ballot|EVM|VVPAT|voter.?list|voter.?id)\b/i,
  election: /\b(election|poll|vote|voting|campaign|rally|manifesto|alliance|coalition|seat.?sharing|constituency|candidate|ticket|hustings|canvass)\b/i,
};

function detectCategory(text) {
  for (const [cat, pattern] of Object.entries(CATEGORY_PATTERNS)) {
    if (pattern.test(text)) return cat;
  }
  return 'general';
}

function detectParties(text) {
  const found = [];
  const upper = text.toUpperCase();
  for (const [party, keywords] of Object.entries(PARTY_KEYWORDS)) {
    for (const kw of keywords) {
      if (upper.includes(kw.toUpperCase())) {
        found.push(party);
        break;
      }
    }
  }
  return found;
}

/**
 * Parse Google News RSS XML into article objects
 */
function parseRssXml(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = (block.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
    const link = (block.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '';
    const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '';
    const source = (block.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1] || '';
    const description = (block.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || '';

    // Clean HTML entities and tags from snippet
    const snippet = description
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
      .slice(0, 300);

    const cleanTitle = title
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    if (cleanTitle && link) {
      const combined = `${cleanTitle} ${snippet}`;
      items.push({
        title: cleanTitle,
        snippet,
        source: source || 'Google News',
        url: link.trim(),
        published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        category: detectCategory(combined),
        matched_parties: detectParties(combined),
      });
    }
  }
  return items;
}

/**
 * Fetch news from Google News RSS for a query
 */
async function fetchGoogleNewsRSS(query) {
  const encoded = encodeURIComponent(query);
  const url = `https://news.google.com/rss/search?q=${encoded}&hl=en-IN&gl=IN&ceid=IN:en`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; TNElectionDashboard/1.0)',
    },
  });

  if (!response.ok) {
    console.error(`RSS fetch failed for "${query}": ${response.status}`);
    return [];
  }

  const xml = await response.text();
  return parseRssXml(xml);
}

/**
 * Fetch news from all queries, deduplicate, and return
 */
export async function fetchAllNews() {
  const allArticles = [];
  const seenUrls = new Set();

  // Fetch all queries in parallel (batches of 3 to be polite)
  for (let i = 0; i < SEARCH_QUERIES.length; i += 3) {
    const batch = SEARCH_QUERIES.slice(i, i + 3);
    const results = await Promise.all(batch.map(q => fetchGoogleNewsRSS(q)));
    for (const articles of results) {
      for (const article of articles) {
        if (!seenUrls.has(article.url)) {
          seenUrls.add(article.url);
          allArticles.push(article);
        }
      }
    }
  }

  // Sort by published date descending
  allArticles.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

  return allArticles;
}

export { detectCategory, detectParties, PARTY_KEYWORDS };
