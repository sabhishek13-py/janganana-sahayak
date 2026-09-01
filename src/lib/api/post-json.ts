import type { z } from 'zod';

import { appCheckHeaders } from '@/lib/firebase';

/**
 * Posts JSON to one of this app's own AI routes and validates the reply.
 * The server has already validated it; parsing again means a malformed or
 * tampered response can never reach a component's render path.
 */
export async function postJson<TResult>(
  url: string,
  body: unknown,
  schema: z.ZodType<TResult>,
): Promise<TResult> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(await appCheckHeaders()) },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${url} failed: ${String(response.status)}`);
  return schema.parse(await response.json());
}
