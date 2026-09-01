import path from 'node:path';

import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Non-CSP security headers. The Content-Security-Policy itself is emitted from
 * `src/middleware.ts` because it carries a per-request nonce, which a static
 * header cannot express. See README "Security model".
 */
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  {
    key: 'Permissions-Policy',
    // microphone: Indic voice input (REQ-6). geolocation: district finder (REQ-2).
    value:
      'camera=(), payment=(), usb=(), interest-cohort=(), microphone=(self), geolocation=(self)',
  },
] as const;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // A stray lockfile in the parent directory otherwise wins the workspace-root inference.
  outputFileTracingRoot: path.join(import.meta.dirname),
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  experimental: { optimizePackageImports: ['lucide-react', 'recharts'] },
  images: { formats: ['image/avif', 'image/webp'] },
  headers() {
    return Promise.resolve([{ source: '/:path*', headers: [...securityHeaders] }]);
  },
};

export default withNextIntl(nextConfig);
