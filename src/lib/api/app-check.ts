import 'server-only';

import { createRemoteJWKSet, jwtVerify } from 'jose';

import { serverEnv } from '@/lib/env';

const APP_CHECK_ISSUER = 'https://firebaseappcheck.googleapis.com';
const JWKS = createRemoteJWKSet(new URL(`${APP_CHECK_ISSUER}/v1/jwks`));

export const APP_CHECK_HEADER = 'x-firebase-appcheck';

export type AppCheckOutcome = 'VERIFIED' | 'NOT_ENFORCED' | 'REJECTED';

export interface AppCheckResult {
  readonly outcome: AppCheckOutcome;
  readonly reason?: string;
}

const notEnforced = (reason: string): AppCheckResult => ({ outcome: 'NOT_ENFORCED', reason });

/**
 * Verifies a Firebase App Check token against Google's published JWKS, so only
 * attested instances of this app can spend model quota. Verification is skipped
 * (and said to be skipped) when the deployment has not configured App Check.
 */
export async function verifyAppCheck(headers: Headers): Promise<AppCheckResult> {
  const projectNumber = serverEnv.FIREBASE_PROJECT_NUMBER;
  if (!serverEnv.APP_CHECK_ENFORCED) return notEnforced('APP_CHECK_ENFORCED is false');
  if (projectNumber === undefined) return notEnforced('FIREBASE_PROJECT_NUMBER is not set');

  const token = headers.get(APP_CHECK_HEADER);
  if (token === null || token.length === 0) {
    return { outcome: 'REJECTED', reason: 'missing App Check token' };
  }

  try {
    await jwtVerify(token, JWKS, {
      issuer: `${APP_CHECK_ISSUER}/${projectNumber}`,
      audience: `projects/${projectNumber}`,
      algorithms: ['RS256'],
    });
    return { outcome: 'VERIFIED' };
  } catch {
    // The reason is deliberately generic: it is returned to an unauthenticated caller.
    return { outcome: 'REJECTED', reason: 'App Check token failed verification' };
  }
}
