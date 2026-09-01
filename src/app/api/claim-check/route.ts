import { LOCALE_LABELS } from '@/i18n/routing';
import { claimResponseSchema, claimRequestSchema, claimVerdictSchema } from '@/lib/ai/contracts';
import { generateStructured } from '@/lib/ai/generate';
import { groundingContext } from '@/lib/ai/grounding';
import { BASE_SYSTEM_INSTRUCTION, wrapUntrusted } from '@/lib/ai/prompt-guard';
import { createAiRoute } from '@/lib/api/handler';
import { sanitizeModelText } from '@/lib/sanitize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM = [
  BASE_SYSTEM_INSTRUCTION,
  'You classify a claim about Census 2027 against the grounding data.',
  'TRUE means the grounding data supports it. FALSE means the grounding data contradicts it.',
  'MISLEADING means it mixes something true with something wrong, or strips vital context.',
  'NOT_YET_NOTIFIED means the claim concerns a detail that has not been notified, such as the',
  'Phase II questions; use it rather than calling such a claim true or false.',
  'The rebuttal must be one or two sentences a person can forward to a family group.',
].join(' ');

/** @requirement REQ-4 Data privacy and misinformation */
export const POST = createAiRoute({
  bodySchema: claimRequestSchema,
  handle: async ({ claim, locale }) => {
    const verdict = await generateStructured({
      prompt: [
        groundingContext(),
        '',
        `Write reason and rebuttal in ${LOCALE_LABELS[locale]}.`,
        'Classify this forwarded message:',
        wrapUntrusted(claim),
      ].join('\n'),
      responseSchema: claimResponseSchema,
      schemaName: 'claim_verdict',
      validator: claimVerdictSchema,
      systemInstruction: SYSTEM,
      cacheKey: `claim:${locale}:${claim.trim().toLowerCase()}`,
    });
    return {
      ...verdict,
      reason: sanitizeModelText(verdict.reason),
      rebuttal: sanitizeModelText(verdict.rebuttal),
    };
  },
});
