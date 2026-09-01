import 'server-only';

import Groq from 'groq-sdk';

import { serverEnv } from '@/lib/env';

/** Thrown when no Groq key is configured; routes translate this to a 503, not a 500. */
export class AiNotConfiguredError extends Error {
  constructor() {
    super('Groq is not configured on this deployment');
    this.name = 'AiNotConfiguredError';
  }
}

/** Thrown when the model replies with something that fails its response schema. */
export class AiResponseInvalidError extends Error {
  constructor(readonly detail: string) {
    super(`Model response failed schema validation: ${detail}`);
    this.name = 'AiResponseInvalidError';
  }
}

let cachedClient: Groq | undefined;

/** Server-only Groq client. The API key never leaves this process. */
export function getGroqClient(): Groq {
  const apiKey = serverEnv.GROQ_API_KEY;
  if (apiKey === undefined) throw new AiNotConfiguredError();
  cachedClient ??= new Groq({ apiKey });
  return cachedClient;
}

export const GROQ_MODEL = serverEnv.GROQ_MODEL;

/** Test seam: drops the memoised client so a fresh key is picked up. */
export function resetGroqClient(): void {
  cachedClient = undefined;
}
