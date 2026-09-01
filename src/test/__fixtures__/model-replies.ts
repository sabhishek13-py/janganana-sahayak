import type { AskAnswer, ClaimVerdict, InsightAnswer } from '@/lib/ai/contracts';

/** Deterministic model replies. No test ever reaches the network. */
export const ASK_ANSWER: AskAnswer = {
  answer: 'Self-enumeration opens fifteen days before your area of houselisting begins.',
  notYetNotified: false,
  groundedIn: ['Self-enumeration: 15 days immediately before the Phase I window'],
};

export const ASK_NOT_NOTIFIED: AskAnswer = {
  answer: 'The Phase II questions have not been notified yet, so this cannot be answered.',
  notYetNotified: true,
  groundedIn: ['Phase II questions: NOT YET NOTIFIED'],
};

export const CLAIM_FALSE: ClaimVerdict = {
  verdict: 'FALSE',
  reason: 'No census enumerator asks for a bank account number or a one-time password.',
  rebuttal: 'This is a scam. The census never asks for bank details or an OTP.',
  groundedIn: ['Household assets. Not collected: No bank balance, no income figure'],
};

export const CLAIM_NOT_YET: ClaimVerdict = {
  verdict: 'NOT_YET_NOTIFIED',
  reason: 'The Phase II question wording has not been notified.',
  rebuttal: 'The Phase II questions are not published yet, so nobody can quote them.',
  groundedIn: ['Phase II questions: NOT YET NOTIFIED'],
};

export const INSIGHT_ANSWER: InsightAnswer = {
  answer: 'Kerala had the highest literacy rate in 2011, at 94.0 per cent.',
  chartId: 'literacy',
  isProjection: false,
  groundedIn: ['Kerala: literacy 94%'],
};

/** A reply that is well-formed JSON but violates the response schema. */
export const MALFORMED_ASK = { answer: 42, notYetNotified: 'no' };

export const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
