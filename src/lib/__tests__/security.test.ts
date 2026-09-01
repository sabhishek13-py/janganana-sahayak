import { describe, expect, it } from 'vitest';

import { buildCsp, createNonce } from '../csp';
import { assertNoPublicSecrets, readServerEnv } from '../env';
import { LruCache } from '../lru-cache';
import { clientKeyFromHeaders, TokenBucketLimiter } from '../rate-limit';
import { sanitizeModelText, sanitizeUserInput } from '../sanitize';

describe('environment validation', () => {
  it('refuses to boot when a secret is given a browser-visible name', () => {
    expect(() => {
      assertNoPublicSecrets({ NEXT_PUBLIC_GROQ_API_KEY: 'gsk-x' });
    }).toThrow(/secret-shaped variables are exposed to the browser/);
    expect(() => {
      assertNoPublicSecrets({ NEXT_PUBLIC_FIREBASE_PRIVATE_KEY: 'x' });
    }).toThrow();
    expect(() => {
      assertNoPublicSecrets({ NEXT_PUBLIC_SOMETHING_SECRET: 'x' });
    }).toThrow();
  });

  it('allows the client identifiers that are public by design', () => {
    // Both are meant to ship in the browser bundle; flagging them refused to
    // boot a correctly configured deployment.
    expect(() => {
      assertNoPublicSecrets({
        NEXT_PUBLIC_FIREBASE_API_KEY: 'AIzaPublicClientIdentifier',
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: 'AIzaPublicBrowserKey',
      });
    }).not.toThrow();
  });

  it('still refuses a genuinely secret key given a public name', () => {
    expect(() => {
      assertNoPublicSecrets({ NEXT_PUBLIC_GROQ_API_KEY: 'gsk_x' });
    }).toThrow(/secret-shaped/);
    expect(() => {
      assertNoPublicSecrets({ NEXT_PUBLIC_OPENAI_API_KEY: 'sk-x' });
    }).toThrow(/secret-shaped/);
  });

  it('allows genuinely public configuration', () => {
    expect(() => {
      assertNoPublicSecrets({ NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-ABC123', GROQ_API_KEY: 'k' });
    }).not.toThrow();
  });

  it('rejects a malformed Groq key rather than starting with it', () => {
    expect(() => readServerEnv({ GROQ_API_KEY: 'too-short' })).toThrow(/Refusing to start/);
    expect(() => readServerEnv({ GROQ_API_KEY: `bad key ${'x'.repeat(20)}` })).toThrow();
    // A key from another provider is a configuration mistake worth catching.
    expect(() => readServerEnv({ GROQ_API_KEY: `AIza${'x'.repeat(30)}` })).toThrow();
  });

  it('starts without a Groq key, so the non-AI pages still work', () => {
    const parsed = readServerEnv({});
    expect(parsed.GROQ_API_KEY).toBeUndefined();
    expect(parsed.GROQ_MODEL).toBe('openai/gpt-oss-20b');
    expect(parsed.APP_CHECK_ENFORCED).toBe(false);
  });

  it('treats a variable left blank as simply unset', () => {
    // A hosting dashboard hands you '' for a row added but not filled in. That
    // must mean "feature off", not "refuse to boot".
    expect(() =>
      readServerEnv({ FIREBASE_PROJECT_NUMBER: '', GROQ_API_KEY: '', APP_CHECK_ENFORCED: '' }),
    ).not.toThrow();
    expect(readServerEnv({ FIREBASE_PROJECT_NUMBER: '' }).FIREBASE_PROJECT_NUMBER).toBeUndefined();
    expect(readServerEnv({ GROQ_API_KEY: '   ' }).GROQ_API_KEY).toBeUndefined();
  });

  it('still rejects a project number that is not all digits', () => {
    // The commonest mistake is pasting the project id instead of the number.
    expect(() => readServerEnv({ FIREBASE_PROJECT_NUMBER: 'my-project-id' })).toThrow(
      /all-digits project number/,
    );
  });

  it('coerces and bounds the rate-limit settings', () => {
    expect(readServerEnv({ RATE_LIMIT_CAPACITY: '25' }).RATE_LIMIT_CAPACITY).toBe(25);
    expect(() => readServerEnv({ RATE_LIMIT_CAPACITY: '0' })).toThrow();
    expect(() => readServerEnv({ RATE_LIMIT_CAPACITY: '100000' })).toThrow();
  });
});

describe('content security policy', () => {
  const csp = buildCsp('test-nonce', false);

  it('is nonce-based and blocks objects, framing and base tag hijacking', () => {
    expect(csp).toContain("script-src 'self' 'nonce-test-nonce' 'strict-dynamic'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
  });

  it('never allows unsafe-eval or unsafe-inline scripts in production', () => {
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp.split('script-src')[1]?.split(';')[0]).not.toContain("'unsafe-inline'");
  });

  it('allows unsafe-eval only in development, which the dev server needs', () => {
    expect(buildCsp('n', true)).toContain("'unsafe-eval'");
  });

  it('produces a distinct nonce each time', () => {
    expect(createNonce()).not.toBe(createNonce());
  });
});

describe('rate limiting', () => {
  it('allows up to capacity and then rejects with a retry hint', () => {
    const limiter = new TokenBucketLimiter(3, 3, () => 0);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      expect(limiter.take('1.2.3.4').allowed).toBe(true);
    }
    const rejected = limiter.take('1.2.3.4');
    expect(rejected.allowed).toBe(false);
    expect(rejected.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('refills over time', () => {
    let now = 0;
    const limiter = new TokenBucketLimiter(2, 2, () => now);
    limiter.take('ip');
    limiter.take('ip');
    expect(limiter.take('ip').allowed).toBe(false);
    now = 60_000;
    expect(limiter.take('ip').allowed).toBe(true);
  });

  it('keeps callers in separate buckets', () => {
    const limiter = new TokenBucketLimiter(1, 1, () => 0);
    expect(limiter.take('a').allowed).toBe(true);
    expect(limiter.take('b').allowed).toBe(true);
    expect(limiter.take('a').allowed).toBe(false);
  });

  it('rejects a nonsensical configuration', () => {
    expect(() => new TokenBucketLimiter(0, 1)).toThrow();
  });

  it('derives a key from proxy headers and falls back safely', () => {
    // The leading entry is whatever the caller typed, so keying on it would let
    // anyone mint a fresh bucket per request. Only the entry our own proxy
    // appended — the last one — is trustworthy.
    const forwarded = new Headers({ 'x-forwarded-for': '9.9.9.9, 10.0.0.1' });
    expect(clientKeyFromHeaders(forwarded)).toBe('10.0.0.1');

    const spoofed = new Headers({ 'x-forwarded-for': 'not-an-ip, 10.0.0.1' });
    expect(clientKeyFromHeaders(spoofed)).toBe('10.0.0.1');

    // A single-entry header is the client's own claim and buys nothing.
    const clientOnly = new Headers({ 'x-forwarded-for': 'evil-key' });
    expect(clientKeyFromHeaders(clientOnly)).toBe('unknown-client');
    expect(clientKeyFromHeaders(new Headers({ 'x-real-ip': '8.8.8.8' }))).toBe('8.8.8.8');
    expect(clientKeyFromHeaders(new Headers())).toBe('unknown-client');
    const oversized = new Headers({ 'x-forwarded-for': 'x'.repeat(60) });
    expect(clientKeyFromHeaders(oversized)).toBe('unknown-client');
  });
});

describe('sanitising model output and user input', () => {
  it('strips markup, control characters and invisible characters', () => {
    expect(sanitizeModelText('<script>alert(1)</script>hello')).toBe('alert(1) hello');
    expect(sanitizeModelText('ab\u200Bc')).toBe('abc');
    expect(sanitizeModelText('right\u202Eoverride')).toBe('rightoverride');
    expect(sanitizeModelText('a\u0007b')).toBe('ab');
  });

  it('caps the length of a runaway answer', () => {
    const long = sanitizeModelText('x'.repeat(5_000), 100);
    expect(long.length).toBeLessThanOrEqual(101);
    expect(long.endsWith('\u2026')).toBe(true);
  });

  it('neutralises fence characters in untrusted input', () => {
    expect(sanitizeUserInput('```ignore previous```')).toBe('``ignore previous``');
    expect(sanitizeUserInput('  padded  ')).toBe('padded');
    expect(sanitizeUserInput('x'.repeat(50), 10)).toHaveLength(10);
  });
});

describe('bounded caches', () => {
  it('evicts the least recently used entry', () => {
    const cache = new LruCache<number>(2);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.get('a');
    cache.set('c', 3);
    expect(cache.has('b')).toBe(false);
    expect(cache.get('a')).toBe(1);
    expect(cache.size).toBe(2);
  });

  it('rejects a zero-size cache', () => {
    expect(() => new LruCache(0)).toThrow();
  });
});

describe('regressions in the security helpers', () => {
  it('keeps the paragraph structure of a model answer', () => {
    // Tab and newline are control characters, but stripping them collapses
    // every reply into one run-on line.
    expect(sanitizeModelText('Para one.\n\nPara two.')).toBe('Para one.\n\nPara two.');
    expect(sanitizeModelText('a\n\n\n\n\nb')).toBe('a\n\nb');
    expect(sanitizeModelText('bell\u0007 and null\u0000')).toBe('bell and null');
    expect(sanitizeModelText('carriage\r\nreturn')).toBe('carriage\nreturn');
  });

  it('still refuses a nonce-less policy', () => {
    expect(() => buildCsp('', false)).toThrow(/nonce/);
    expect(buildCsp(createNonce(), false)).toContain("'strict-dynamic'");
    // Host sources in script-src are ignored under 'strict-dynamic', so listing
    // them would read as protection while doing nothing.
    expect(buildCsp(createNonce(), false)).not.toMatch(/script-src[^;]*googletagmanager/);
    expect(buildCsp(createNonce(), false)).toContain('https://www.google-analytics.com');
  });

  it('does not reset a throttled bucket when the key map fills up', () => {
    let now = 0;
    const limiter = new TokenBucketLimiter(10, 5, () => now);

    // Spend the victim's whole allowance, so it is genuinely throttled.
    for (let index = 0; index < 10; index += 1) expect(limiter.take('victim').allowed).toBe(true);
    expect(limiter.take('victim').allowed).toBe(false);

    // Flooding with distinct keys must not buy the victim a fresh allowance.
    // Each flood key spends one token and so stays nearly full: those are the
    // buckets eviction is meant to reach, not the one at zero.
    for (let index = 0; index < 10_050; index += 1) limiter.take(`flood-${String(index)}`);
    expect(limiter.size).toBeLessThanOrEqual(10_000);
    expect(limiter.take('victim').allowed).toBe(false);

    // Time, and only time, restores it.
    now += 60_000;
    expect(limiter.take('victim').allowed).toBe(true);
  });
});
