/**
 * Hosts the app genuinely talks to. Kept here so the policy and the README
 * cannot drift apart.
 *
 * There is deliberately no script-host list. `script-src` below uses
 * `'strict-dynamic'`, and under CSP Level 3 that makes browsers ignore every
 * host source *and* `'self'` in that directive — a list there would read as
 * protection while doing nothing at all. Trust flows from the nonce instead:
 * `next/script` stamps it on the gtag and Maps loader tags, and scripts those
 * loaders then inject inherit it. Both are the vendors' own recommended setup.
 */
const GOOGLE_CONNECT_HOSTS = [
  'https://www.google-analytics.com',
  'https://region1.google-analytics.com',
  'https://maps.googleapis.com',
  'https://firebaseappcheck.googleapis.com',
  'https://content-firebaseappcheck.googleapis.com',
] as const;

const GOOGLE_IMAGE_HOSTS = [
  'https://maps.gstatic.com',
  'https://maps.googleapis.com',
  'https://www.google-analytics.com',
] as const;

/** Generates a fresh nonce per request using the Web Crypto API available in middleware. */
export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Strict, nonce-based Content-Security-Policy.
 * `style-src` keeps 'unsafe-inline' because Next.js injects inline style
 * attributes it does not nonce; every other directive is locked down.
 */
export function buildCsp(nonce: string, isDev: boolean): string {
  if (nonce === '') throw new Error('buildCsp needs a nonce: an empty one matches no script');

  // 'self' is listed for CSP Level 2 browsers, which ignore 'strict-dynamic'
  // and would otherwise fall back to blocking the app's own bundles.
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    ...(isDev ? ["'unsafe-eval'"] : []),
  ].join(' ');

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${GOOGLE_IMAGE_HOSTS.join(' ')}`,
    "font-src 'self' data:",
    `connect-src 'self' ${GOOGLE_CONNECT_HOSTS.join(' ')}`,
    "frame-src 'self' https://www.google.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}
