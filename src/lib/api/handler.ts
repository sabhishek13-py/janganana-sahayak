import 'server-only';

import type { z } from 'zod';

import { AiNotConfiguredError, AiResponseInvalidError } from '@/lib/ai/client';
import { serverEnv } from '@/lib/env';
import { clientKeyFromHeaders, TokenBucketLimiter } from '@/lib/rate-limit';

import { verifyAppCheck } from './app-check';

const limiter = new TokenBucketLimiter(
  serverEnv.RATE_LIMIT_CAPACITY,
  serverEnv.RATE_LIMIT_REFILL_PER_MINUTE,
);

const MAX_BODY_BYTES = 8_000;

const jsonError = (
  status: number,
  error: string,
  extraHeaders: Record<string, string> = {},
): Response =>
  Response.json({ error }, { status, headers: { 'cache-control': 'no-store', ...extraHeaders } });

export interface AiRouteConfig<TBody, TResult> {
  readonly bodySchema: z.ZodType<TBody>;
  readonly handle: (body: TBody) => Promise<TResult>;
}

async function readValidatedBody<TBody>(
  request: Request,
  schema: z.ZodType<TBody>,
): Promise<{ ok: true; body: TBody } | { ok: false; response: Response }> {
  // Cheap rejection first, so an oversized body is refused before it is buffered.
  const declared = Number(request.headers.get('content-length') ?? Number.NaN);
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return { ok: false, response: jsonError(413, 'Request body is too large.') };
  }

  const raw = await request.text();
  // `String.length` counts UTF-16 code units; every Indic script in this app
  // encodes to three bytes per character, so measuring the encoded size is the
  // only way this limit means what it says.
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return { ok: false, response: jsonError(413, 'Request body is too large.') };
  }
  let candidate: unknown;
  try {
    candidate = JSON.parse(raw);
  } catch {
    return { ok: false, response: jsonError(400, 'Request body must be JSON.') };
  }
  const parsed = schema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, response: jsonError(400, 'Request body failed validation.') };
  }
  return { ok: true, body: parsed.data };
}

function mapError(error: unknown): Response {
  if (error instanceof AiNotConfiguredError) {
    return jsonError(503, 'The AI assistant is not configured on this deployment.');
  }
  if (error instanceof AiResponseInvalidError) {
    return jsonError(502, 'The assistant returned an unusable answer. Please try again.');
  }
  console.error('AI route failed', error);
  return jsonError(500, 'Something went wrong. Please try again.');
}

export type Guarded<TBody> = { ok: true; body: TBody } | { ok: false; response: Response };

/**
 * Rate limiting, App Check and body validation, in that order. Both the JSON and
 * the streaming routes go through this, so a new route cannot skip a check.
 */
export async function guardRequest<TBody>(
  request: Request,
  schema: z.ZodType<TBody>,
): Promise<Guarded<TBody>> {
  const decision = limiter.take(clientKeyFromHeaders(request.headers));
  if (!decision.allowed) {
    return {
      ok: false,
      response: jsonError(429, 'Too many requests. Please wait a moment.', {
        'retry-after': String(decision.retryAfterSeconds),
      }),
    };
  }

  const appCheck = await verifyAppCheck(request.headers);
  if (appCheck.outcome === 'REJECTED') {
    return { ok: false, response: jsonError(403, 'App Check verification failed.') };
  }

  return readValidatedBody(request, schema);
}

/** Builds a JSON POST handler from a validated body and a handler function. */
export function createAiRoute<TBody, TResult>(config: AiRouteConfig<TBody, TResult>) {
  return async function POST(request: Request): Promise<Response> {
    const guarded = await guardRequest(request, config.bodySchema);
    if (!guarded.ok) return guarded.response;

    try {
      const result = await config.handle(guarded.body);
      return Response.json(result, { headers: { 'cache-control': 'no-store' } });
    } catch (error) {
      return mapError(error);
    }
  };
}

export { mapError as mapAiRouteError };

export { limiter as aiRouteLimiter };
