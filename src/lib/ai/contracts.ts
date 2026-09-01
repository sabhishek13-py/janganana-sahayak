import { z } from 'zod';

import { LOCALES } from '@/i18n/routing';

import type { JsonSchema } from './schema';

/** Shared request fields: a locale, so answers come back in the reader's language. */
export const localeField = z.enum(LOCALES);

export const askRequestSchema = z.object({
  question: z.string().min(3).max(500),
  locale: localeField,
});
export type AskRequest = z.infer<typeof askRequestSchema>;

export const askAnswerSchema = z.object({
  answer: z.string().min(1).max(2_000),
  /** True when the grounding data does not settle the question. */
  notYetNotified: z.boolean(),
  groundedIn: z.array(z.string().min(1)).max(6),
});
export type AskAnswer = z.infer<typeof askAnswerSchema>;

export const askResponseSchema: JsonSchema = {
  type: 'object',
  properties: {
    answer: { type: 'string' },
    notYetNotified: { type: 'boolean' },
    groundedIn: { type: 'array', items: { type: 'string' } },
  },
  required: ['answer', 'notYetNotified', 'groundedIn'],
  additionalProperties: false,
};

export const VERDICTS = ['TRUE', 'FALSE', 'MISLEADING', 'NOT_YET_NOTIFIED'] as const;

export const claimRequestSchema = z.object({
  claim: z.string().min(5).max(1_500),
  locale: localeField,
});
export type ClaimRequest = z.infer<typeof claimRequestSchema>;

export const claimVerdictSchema = z.object({
  verdict: z.enum(VERDICTS),
  reason: z.string().min(1).max(1_200),
  rebuttal: z.string().min(1).max(600),
  groundedIn: z.array(z.string().min(1)).max(6),
});
export type ClaimVerdict = z.infer<typeof claimVerdictSchema>;

export const claimResponseSchema: JsonSchema = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: [...VERDICTS] },
    reason: { type: 'string' },
    rebuttal: { type: 'string' },
    groundedIn: { type: 'array', items: { type: 'string' } },
  },
  required: ['verdict', 'reason', 'rebuttal', 'groundedIn'],
  additionalProperties: false,
};

export const CHART_IDS = ['literacy', 'urbanRural', 'decadalGrowth', 'population'] as const;

export const insightRequestSchema = z.object({
  question: z.string().min(3).max(400),
  locale: localeField,
});
export type InsightRequest = z.infer<typeof insightRequestSchema>;

export const insightAnswerSchema = z.object({
  answer: z.string().min(1).max(1_500),
  chartId: z.enum(CHART_IDS),
  isProjection: z.boolean(),
  groundedIn: z.array(z.string().min(1)).max(6),
});
export type InsightAnswer = z.infer<typeof insightAnswerSchema>;

export const insightResponseSchema: JsonSchema = {
  type: 'object',
  properties: {
    answer: { type: 'string' },
    chartId: { type: 'string', enum: [...CHART_IDS] },
    isProjection: { type: 'boolean' },
    groundedIn: { type: 'array', items: { type: 'string' } },
  },
  required: ['answer', 'chartId', 'isProjection', 'groundedIn'],
  additionalProperties: false,
};

export const explainRequestSchema = z.object({
  questionNumber: z.number().int().min(1).max(33),
  locale: localeField,
});
export type ExplainRequest = z.infer<typeof explainRequestSchema>;
