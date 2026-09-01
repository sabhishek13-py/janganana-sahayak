import 'server-only';

import type { z } from 'zod';

import { LruCache } from '@/lib/lru-cache';
import { sanitizeModelText } from '@/lib/sanitize';

import { AiResponseInvalidError, getGroqClient, GROQ_MODEL } from './client';
import { BASE_SYSTEM_INSTRUCTION } from './prompt-guard';
import type { JsonSchema } from './schema';

/** Collapses repeated identical prompts (e.g. the same rumour pasted twice). */
const responseCache = new LruCache<string>(200);

export interface StructuredRequest<TResult> {
  readonly prompt: string;
  /** JSON Schema, which constrains generation. */
  readonly responseSchema: JsonSchema;
  /** A name for the schema, required by the API and shown in its errors. */
  readonly schemaName: string;
  /** Zod schema, which validates what actually came back. Belt and braces. */
  readonly validator: z.ZodType<TResult>;
  readonly systemInstruction?: string;
  readonly cacheKey?: string;
  readonly temperature?: number;
}

async function callStructuredModel<TResult>(request: StructuredRequest<TResult>): Promise<string> {
  const completion = await getGroqClient().chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: request.systemInstruction ?? BASE_SYSTEM_INSTRUCTION },
      { role: 'user', content: request.prompt },
    ],
    // `strict` turns this into constrained decoding rather than a request the
    // model may ignore, so the reply cannot be shaped wrongly in the first place.
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: request.schemaName,
        strict: true,
        // The SDK types `schema` as an open record. `JsonSchema` is deliberately
        // narrower than that, so it is widened here at the boundary rather than
        // loosened at its definition.
        schema: request.responseSchema as unknown as Record<string, unknown>,
      },
    },
    temperature: request.temperature ?? 0.2,
    n: 1,
  });
  return completion.choices[0]?.message.content ?? '';
}

function parseStructured<TResult>(raw: string, validator: z.ZodType<TResult>): TResult {
  let candidate: unknown;
  try {
    candidate = JSON.parse(raw);
  } catch {
    throw new AiResponseInvalidError('response was not valid JSON');
  }
  const parsed = validator.safeParse(candidate);
  if (!parsed.success) {
    throw new AiResponseInvalidError(parsed.error.issues.map((issue) => issue.message).join('; '));
  }
  return parsed.data;
}

/**
 * Structured Groq call. The model is constrained by `responseSchema`, and the
 * reply is then parsed with Zod before any caller can render it — an
 * unparseable answer raises `AiResponseInvalidError` rather than reaching the UI.
 *
 * The Zod pass is not redundant with constrained decoding: it is the only check
 * that survives a provider change, a schema the model half-honours, or a field
 * whose type is right but whose value is not one the app can render.
 */
export async function generateStructured<TResult>(
  request: StructuredRequest<TResult>,
): Promise<TResult> {
  const cached = request.cacheKey === undefined ? undefined : responseCache.get(request.cacheKey);
  const raw = cached ?? (await callStructuredModel(request));
  const validated = parseStructured(raw, request.validator);
  if (request.cacheKey !== undefined && cached === undefined) {
    responseCache.set(request.cacheKey, raw);
  }
  return validated;
}

export interface StreamRequest {
  readonly prompt: string;
  readonly systemInstruction?: string;
  readonly temperature?: number;
}

/**
 * Streaming plain-language explanation.
 *
 * Sanitising each chunk on its own would be wrong twice over: `sanitizeModelText`
 * trims, so the space separating two chunks disappears and words are glued
 * together, and the length cap would apply per chunk rather than per answer.
 * Instead the raw text is accumulated, sanitised as a whole, and only the newly
 * revealed suffix is emitted — so the reader still gets a stream, and the
 * guarantee is the one the caller expects: what arrives is exactly
 * `sanitizeModelText` of the complete reply.
 */
export async function* generateTextStream(request: StreamRequest): AsyncGenerator<string> {
  const stream = await getGroqClient().chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: request.systemInstruction ?? BASE_SYSTEM_INSTRUCTION },
      { role: 'user', content: request.prompt },
    ],
    temperature: request.temperature ?? 0.3,
    stream: true,
    n: 1,
  });

  let raw = '';
  let emitted = '';
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta.content;
    if (text === undefined || text === null || text.length === 0) continue;
    raw += text;
    const clean = sanitizeModelText(raw);
    // Sanitising is prefix-stable apart from the trailing trim, so the common
    // case is a pure append. Anything else means earlier output was rewritten,
    // which cannot be un-sent; hold it back and let the next chunk settle it.
    if (clean.length > emitted.length && clean.startsWith(emitted)) {
      yield clean.slice(emitted.length);
      emitted = clean;
    }
  }
}

export function clearAiResponseCache(): void {
  responseCache.clear();
}
