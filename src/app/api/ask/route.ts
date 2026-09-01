import { LOCALE_LABELS } from '@/i18n/routing';
import { askAnswerSchema, askRequestSchema, askResponseSchema } from '@/lib/ai/contracts';
import { generateStructured } from '@/lib/ai/generate';
import { groundingContext } from '@/lib/ai/grounding';
import { BASE_SYSTEM_INSTRUCTION, wrapUntrusted } from '@/lib/ai/prompt-guard';
import { createAiRoute } from '@/lib/api/handler';
import { sanitizeModelText } from '@/lib/sanitize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM = [
  BASE_SYSTEM_INSTRUCTION,
  'Answer only from the grounding data. If the answer is not in it, set notYetNotified to true',
  'and say that the detail has not been notified yet, rather than guessing.',
  'List in groundedIn the specific grounding lines you relied on.',
].join(' ');

/** @requirement REQ-3 Guide users through self-enumeration */
export const POST = createAiRoute({
  bodySchema: askRequestSchema,
  handle: async ({ question, locale }) => {
    const answer = await generateStructured({
      prompt: [
        groundingContext(),
        '',
        `Answer in ${LOCALE_LABELS[locale]}.`,
        'The visitor asked:',
        wrapUntrusted(question),
      ].join('\n'),
      responseSchema: askResponseSchema,
      schemaName: 'census_answer',
      validator: askAnswerSchema,
      systemInstruction: SYSTEM,
      cacheKey: `ask:${locale}:${question.trim().toLowerCase()}`,
    });
    return { ...answer, answer: sanitizeModelText(answer.answer) };
  },
});
