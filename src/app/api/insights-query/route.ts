import { CENSUS_2011_BASELINES_TEXT } from '@/features/insights/lib/baseline-context';
import { LOCALE_LABELS } from '@/i18n/routing';
import {
  insightAnswerSchema,
  insightRequestSchema,
  insightResponseSchema,
} from '@/lib/ai/contracts';
import { generateStructured } from '@/lib/ai/generate';
import { groundingContext } from '@/lib/ai/grounding';
import { BASE_SYSTEM_INSTRUCTION, wrapUntrusted } from '@/lib/ai/prompt-guard';
import { createAiRoute } from '@/lib/api/handler';
import { sanitizeModelText } from '@/lib/sanitize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM = [
  BASE_SYSTEM_INSTRUCTION,
  'You answer questions about Census 2011 baseline figures and pick the chart that shows the answer.',
  'Any statement about 2027 is a projection: set isProjection to true and say so in the answer.',
  'Never state a 2027 figure as if it were official.',
].join(' ');

/** @requirement REQ-5 Visualise census data meaningfully */
export const POST = createAiRoute({
  bodySchema: insightRequestSchema,
  handle: async ({ question, locale }) => {
    const answer = await generateStructured({
      prompt: [
        groundingContext(),
        '',
        CENSUS_2011_BASELINES_TEXT,
        '',
        `Answer in ${LOCALE_LABELS[locale]}.`,
        'The visitor asked:',
        wrapUntrusted(question),
      ].join('\n'),
      responseSchema: insightResponseSchema,
      schemaName: 'insight_answer',
      validator: insightAnswerSchema,
      systemInstruction: SYSTEM,
      cacheKey: `insight:${locale}:${question.trim().toLowerCase()}`,
    });
    return { ...answer, answer: sanitizeModelText(answer.answer) };
  },
});
