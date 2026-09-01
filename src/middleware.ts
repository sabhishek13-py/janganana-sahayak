import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

import { routing } from '@/i18n/routing';
import { buildCsp, createNonce } from '@/lib/csp';

const handleIntl = createIntlMiddleware(routing);

/**
 * Emits the per-request CSP nonce and delegates locale routing to next-intl.
 * The policy is set on the request as well as the response: Next.js reads it
 * from the request to stamp the same nonce onto its own inline scripts.
 */
export default function middleware(request: NextRequest) {
  const nonce = createNonce();
  const csp = buildCsp(nonce, process.env.NODE_ENV === 'development');

  request.headers.set('x-nonce', nonce);
  request.headers.set('content-security-policy', csp);

  const response = handleIntl(request);
  response.headers.set('content-security-policy', csp);
  response.headers.set('x-nonce', nonce);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
