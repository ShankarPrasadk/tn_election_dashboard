import express from 'express';
import cors from 'cors';
import { ZodError } from 'zod';

import { getCandidateEnrichment } from './candidate-enrichment.mjs';
import { getCandidateById, listAvailableFilters, loadDataset, reloadDataset, searchCandidates } from './data-store.mjs';
import { fetchAllNews } from './news-fetcher.mjs';
import { answerElectionQuestion } from './retrieval.mjs';
import { askSchema, candidateSearchSchema, toValidationError } from './guardrails.mjs';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ── Bot/AI crawler blocking middleware ──
const BLOCKED_BOTS = /GPTBot|ChatGPT|CCBot|Google-Extended|anthropic|ClaudeBot|Bytespider|Scrapy|PetalBot|Diffbot|Omgilibot|img2dataset|Amazonbot|meta-externalagent|AI2Bot|PerplexityBot|YouBot|Timpibot|cohere-ai/i;

app.use((req, res, next) => {
  const ua = req.headers['user-agent'] || '';
  if (BLOCKED_BOTS.test(ua)) {
    res.status(403).json({ message: 'Access denied' });
    return;
  }
  next();
});

// ── Simple in-memory rate limiter (per IP, 60 requests/min) ──
const rateLimitMap = new Map();
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60 * 1000;

app.use('/api', (req, res, next) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || (now - entry.windowStart) > RATE_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
  } else {
    entry.count++;
    if (entry.count > RATE_LIMIT) {
      res.status(429).json({ message: 'Too many requests. Please try again later.' });
      return;
    }
  }
  next();
});

// Clean up rate limit map every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if ((now - entry.windowStart) > RATE_WINDOW_MS) rateLimitMap.delete(ip);
  }
}, 5 * 60 * 1000);

app.get('/api/health', async (_request, response, next) => {
  try {
    const dataset = await loadDataset();
    response.json({
      ok: true,
      generatedAt: dataset.generatedAt,
      countsByYear: dataset.countsByYear,
      total: dataset.entries.length,
      mode: 'rag-ready-backend',
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/filters', async (_request, response, next) => {
  try {
    response.json(await listAvailableFilters());
  } catch (error) {
    next(error);
  }
});

app.get('/api/candidates', async (request, response, next) => {
  try {
    const filters = candidateSearchSchema.parse(request.query);
    response.json(await searchCandidates(filters));
  } catch (error) {
    next(error);
  }
});

app.get('/api/candidates/:id', async (request, response, next) => {
  try {
    const candidate = await getCandidateById(request.params.id);
    if (!candidate) {
      response.status(404).json({ message: 'Candidate not found' });
      return;
    }

    response.json(candidate);
  } catch (error) {
    next(error);
  }
});

app.get('/api/candidates/:id/enrichment', async (request, response, next) => {
  try {
    const candidate = await getCandidateById(request.params.id);
    if (!candidate) {
      response.status(404).json({ message: 'Candidate not found' });
      return;
    }

    response.json(await getCandidateEnrichment(candidate));
  } catch (error) {
    next(error);
  }
});

// ── News endpoint with in-memory cache (10 min TTL) ──
let newsCache = { data: null, fetchedAt: 0 };
const NEWS_TTL_MS = 10 * 60 * 1000; // 10 minutes

app.get('/api/news', async (_request, response, next) => {
  try {
    const now = Date.now();
    if (newsCache.data && (now - newsCache.fetchedAt) < NEWS_TTL_MS) {
      response.json({ articles: newsCache.data, cached: true, fetchedAt: new Date(newsCache.fetchedAt).toISOString() });
      return;
    }

    const articles = await fetchAllNews();
    newsCache = { data: articles, fetchedAt: now };
    response.json({ articles, cached: false, fetchedAt: new Date(now).toISOString() });
  } catch (error) {
    // Return stale cache on error if available
    if (newsCache.data) {
      response.json({ articles: newsCache.data, cached: true, stale: true, fetchedAt: new Date(newsCache.fetchedAt).toISOString() });
      return;
    }
    next(error);
  }
});

app.post('/api/ask', async (request, response, next) => {
  try {
    const { messages } = request.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      response.status(400).json({ message: 'messages array is required' });
      return;
    }
    // Limit conversation length
    if (messages.length > 20) {
      response.status(400).json({ message: 'Too many messages. Please start a new conversation.' });
      return;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      response.status(503).json({ message: 'AI service is not configured. Please contact the administrator.' });
      return;
    }

    const systemPrompt = `You are the TN Election Dashboard AI Assistant — an expert on Tamil Nadu state assembly elections from 1952 to 2026.

You have deep knowledge of:
- All Tamil Nadu assembly elections (1952, 1957, 1962, 1967, 1971, 1977, 1980, 1984, 1989, 1991, 1996, 2001, 2006, 2011, 2016, 2021, 2026)
- Political parties: DMK, AIADMK, INC, BJP, TVK (Vijay's party), NTK (Seeman), PMK, VCK, CPI, CPI(M), DMDK, AMMK, MDMK, IUML, etc.
- Key leaders: M.K. Stalin, Edappadi K. Palaniswami (EPS), Vijay (TVK), Seeman (NTK), K. Annamalai (BJP TN), Udhayanidhi Stalin, and historical leaders like M.G. Ramachandran (MGR), J. Jayalalithaa, M. Karunanidhi, C.N. Annadurai, K. Kamaraj, C. Rajagopalachari
- Chief Ministers of Tamil Nadu from 1952 to present
- Alliance patterns (SPA/DMK alliance, NDA/AIADMK alliance), seat-sharing
- Anti-incumbency patterns in TN (power changed in 10 of 13 elections since 1967)
- Candidate criminal records, assets, education from election affidavits (via ECI, myneta.info, ADR)
- Constituency-level data, vote share trends, turnout statistics
- 2026 election: polling date April 23, 2026; 234 constituencies; ~5.67 crore voters
- Current alliances: SPA (DMK-led), NDA (AIADMK-led), TVK (independent), NTK (independent)

Rules:
1. Answer questions about Tamil Nadu elections accurately and concisely
2. If you don't know something specific, say so — don't make up data
3. For candidate-specific criminal/asset data, mention that data comes from self-sworn affidavits filed with ECI
4. Be politically neutral — don't endorse any party or candidate
5. Keep answers focused and relevant to what was asked
6. You can discuss election predictions, analysis, and political history
7. For non-election questions, politely redirect to election topics`;

    const openaiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: String(m.content || '').slice(0, 2000),
      })),
    ];

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openaiMessages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.json().catch(() => ({}));
      console.error('OpenAI API error:', openaiRes.status, err);
      if (openaiRes.status === 429) {
        response.status(429).json({ message: 'AI is busy right now. Please try again in a moment.' });
        return;
      }
      response.status(502).json({ message: 'AI service temporarily unavailable. Please try again.' });
      return;
    }

    const data = await openaiRes.json();
    const content = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    response.json({ content });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/reload', async (request, response, next) => {
  try {
    // Require admin secret for reload
    const secret = request.headers['x-admin-secret'] || request.query.secret;
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      response.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const dataset = await reloadDataset();
    response.json({ ok: true, total: dataset.entries.length, generatedAt: dataset.generatedAt });
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json(toValidationError(error));
    return;
  }

  // Log full error server-side only; never expose stack traces to client
  console.error(error);
  response.status(500).json({
    message: 'Internal server error',
  });
});

export default app;
