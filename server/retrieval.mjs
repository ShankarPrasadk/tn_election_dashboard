import { normalizeText } from '../src/data/candidateUtils.js';
import { searchCandidates } from './data-store.mjs';
import { evaluateQuestion } from './guardrails.mjs';

function buildCitation(candidate) {
  return {
    candidateId: candidate.id,
    label: `${candidate.name} (${candidate.party}, ${candidate.constituency}, ${candidate.year})`,
    sourceLabel: candidate.source?.label || 'Candidate directory',
    sourceUrl: candidate.source?.url || null,
  };
}

function buildCandidateFact(candidate) {
  const facts = [
    `${candidate.name} represented ${candidate.party} in ${candidate.constituency} during the ${candidate.year} assembly cycle.`,
  ];

  if (candidate.education) {
    facts.push(`Education listed: ${candidate.education}.`);
  }

  if (candidate.criminalCasesText) {
    facts.push(`Criminal case disclosure: ${candidate.criminalCasesText}.`);
  }

  if (candidate.assetsText) {
    facts.push(`Declared assets: ${candidate.assetsText}.`);
  }

  if (candidate.liabilitiesText) {
    facts.push(`Declared liabilities: ${candidate.liabilitiesText}.`);
  }

  return facts.join(' ');
}

export async function answerElectionQuestion(request) {
  const guardrail = evaluateQuestion(request.question);
  if (!guardrail.allowed) {
    return {
      status: 'blocked',
      answer: guardrail.reason,
      citations: [],
      matchedCandidates: [],
      guardrail,
      mode: 'deterministic-rag-preview',
    };
  }

  const retrieval = await searchCandidates({
    query: request.question,
    year: request.year,
    party: request.party,
    constituency: request.constituency,
    limit: request.maxCandidates,
    offset: 0,
  });

  if (!retrieval.items.length) {
    return {
      status: 'insufficient_data',
      answer: 'No grounded candidate records matched that question. Narrow the query by year, party, or constituency, or expand the underlying source corpus before answering.',
      citations: [],
      matchedCandidates: [],
      guardrail,
      mode: 'deterministic-rag-preview',
    };
  }

  const summary = retrieval.items
    .slice(0, request.maxCandidates)
    .map(buildCandidateFact)
    .join(' ');

  return {
    status: 'ok',
    answer: normalizeText(summary),
    citations: retrieval.items.slice(0, request.maxCandidates).map(buildCitation),
    matchedCandidates: retrieval.items.slice(0, request.maxCandidates).map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      year: candidate.year,
      party: candidate.party,
      constituency: candidate.constituency,
    })),
    guardrail,
    mode: 'deterministic-rag-preview',
    retrieval: {
      total: retrieval.total,
      queryScopedToFilters: Boolean(request.year || request.party || request.constituency),
    },
  };
}