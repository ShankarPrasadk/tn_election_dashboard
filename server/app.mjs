import express from 'express';
import cors from 'cors';
import { ZodError } from 'zod';

import { getCandidateEnrichment } from './candidate-enrichment.mjs';
import { getCandidateById, listAvailableFilters, loadDataset, reloadDataset, searchCandidates } from './data-store.mjs';
import { answerElectionQuestion } from './retrieval.mjs';
import { askSchema, candidateSearchSchema, toValidationError } from './guardrails.mjs';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

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

app.post('/api/ask', async (request, response, next) => {
  try {
    const payload = askSchema.parse(request.body);
    response.json(await answerElectionQuestion(payload));
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/reload', async (_request, response, next) => {
  try {
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

  console.error(error);
  response.status(500).json({
    message: 'Internal server error',
  });
});

export default app;
