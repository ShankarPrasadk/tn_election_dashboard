import { z } from 'zod';

const blockedTopics = [
  'caste',
  'religion',
  'muslim',
  'hindu',
  'christian',
  'health condition',
  'medical condition',
  'sexuality',
  'mental illness',
  'diagnosis',
];

const electionKeywords = [
  'candidate',
  'election',
  'party',
  'constituency',
  'manifesto',
  'criminal',
  'assets',
  'affidavit',
  'assembly',
  'tamil nadu',
  'dmk',
  'aiadmk',
  'bjp',
  'inc',
  'ntk',
  'tvk',
];

export const askSchema = z.object({
  question: z.string().trim().min(8).max(500),
  year: z.coerce.number().int().min(2006).max(2026).optional(),
  party: z.string().trim().max(100).optional(),
  constituency: z.string().trim().max(100).optional(),
  maxCandidates: z.coerce.number().int().min(1).max(10).default(5),
});

export const candidateSearchSchema = z.object({
  query: z.string().trim().max(200).optional(),
  year: z.coerce.number().int().min(2006).max(2026).optional(),
  party: z.string().trim().max(100).optional(),
  constituency: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export function evaluateQuestion(question) {
  const normalized = question.toLowerCase();
  const hits = blockedTopics.filter((topic) => normalized.includes(topic));
  if (hits.length) {
    return {
      allowed: false,
      reason: 'This API only supports factual election queries grounded in public sources and blocks sensitive personal inference requests.',
      blockedTopics: hits,
    };
  }

  const isElectionScoped = electionKeywords.some((keyword) => normalized.includes(keyword));
  if (!isElectionScoped) {
    return {
      allowed: false,
      reason: 'Ask about candidates, parties, constituencies, affidavits, assets, liabilities, or election history.',
      blockedTopics: [],
    };
  }

  return {
    allowed: true,
    reason: null,
    blockedTopics: [],
  };
}

export function toValidationError(error) {
  return {
    message: 'Invalid request payload',
    issues: error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  };
}