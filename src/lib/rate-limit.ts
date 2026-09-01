/** Refill-based token bucket. In-memory and process-local by design: the app stores no user data. */
export interface RateLimitDecision {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly retryAfterSeconds: number;
}

interface Bucket {
  tokens: number;
  lastRefillMs: number;
}

const MINUTE_MS = 60_000;
/** Hard ceiling on tracked keys so a flood of distinct IPs cannot exhaust memory. */
const MAX_TRACKED_KEYS = 10_000;

export class TokenBucketLimiter {
  readonly #buckets = new Map<string, Bucket>();

  constructor(
    private readonly capacity: number,
    private readonly refillPerMinute: number,
    private readonly now: () => number = Date.now,
  ) {
    if (capacity <= 0 || refillPerMinute <= 0) {
      throw new Error('Rate limiter needs a positive capacity and refill rate');
    }
  }

  take(key: string, cost = 1): RateLimitDecision {
    const nowMs = this.now();
    this.#evictIfCrowded(nowMs);
    const bucket = this.#refill(key, nowMs);

    if (bucket.tokens < cost) {
      const deficit = cost - bucket.tokens;
      const seconds = Math.ceil((deficit / this.refillPerMinute) * 60);
      return { allowed: false, remaining: Math.floor(bucket.tokens), retryAfterSeconds: seconds };
    }

    bucket.tokens -= cost;
    return { allowed: true, remaining: Math.floor(bucket.tokens), retryAfterSeconds: 0 };
  }

  #refill(key: string, nowMs: number): Bucket {
    const existing = this.#buckets.get(key);
    if (existing === undefined) {
      const fresh: Bucket = { tokens: this.capacity, lastRefillMs: nowMs };
      this.#buckets.set(key, fresh);
      return fresh;
    }
    const elapsedMinutes = (nowMs - existing.lastRefillMs) / MINUTE_MS;
    existing.tokens = Math.min(
      this.capacity,
      existing.tokens + elapsedMinutes * this.refillPerMinute,
    );
    existing.lastRefillMs = nowMs;
    return existing;
  }

  /** What a bucket's balance will be once time-based refill is applied. */
  #projectedTokens(bucket: Bucket, nowMs: number): number {
    const elapsedMinutes = (nowMs - bucket.lastRefillMs) / MINUTE_MS;
    return Math.min(this.capacity, bucket.tokens + elapsedMinutes * this.refillPerMinute);
  }

  /**
   * Makes room by forgetting the buckets closest to full — the ones whose
   * absence changes the least, since a full bucket is indistinguishable from a
   * new one.
   *
   * Both obvious alternatives are bypasses. Clearing the map hands every
   * throttled caller a fresh allowance at once; dropping the oldest entries
   * targets exactly the callers that have been throttled longest. Either way,
   * flooding the map with distinct keys becomes a way to reset the limiter, so
   * eviction has to be ordered by how much allowance a bucket still has.
   */
  #evictIfCrowded(nowMs: number): void {
    if (this.#buckets.size < MAX_TRACKED_KEYS) return;

    const byFullnessDescending = [...this.#buckets.entries()].sort(
      ([, a], [, b]) => this.#projectedTokens(b, nowMs) - this.#projectedTokens(a, nowMs),
    );
    for (const [key] of byFullnessDescending) {
      if (this.#buckets.size < MAX_TRACKED_KEYS) break;
      this.#buckets.delete(key);
    }
  }

  get size(): number {
    return this.#buckets.size;
  }
}

/**
 * How many proxies sit in front of this deployment and rewrite `x-forwarded-for`.
 * Vercel, Cloud Run and a single nginx all append exactly one hop, which is the
 * default. Only hops the platform itself adds may be counted here.
 */
const TRUSTED_PROXY_HOPS = Math.max(
  1,
  Number.parseInt(process.env.TRUSTED_PROXY_HOPS ?? '1', 10) || 1,
);

/** Rejects anything that is not a bare IPv4/IPv6 literal, so a key cannot be forged into a shape. */
const IP_LITERAL = /^[0-9a-fA-F:.]{3,45}$/;

/**
 * Best-effort client key.
 *
 * `x-forwarded-for` is a list the client starts and each proxy appends to, so
 * its *first* entry is whatever the caller typed — reading that would let anyone
 * mint a fresh full bucket per request and bypass the limiter entirely. The only
 * entries worth anything are the ones our own trusted hops appended, counted
 * back from the right. When nothing trustworthy is present the caller shares one
 * bucket, which throttles conservatively rather than not at all.
 */
export function clientKeyFromHeaders(headers: Headers): string {
  const hops = headers.get('x-forwarded-for')?.split(',') ?? [];
  const candidate = hops.at(-TRUSTED_PROXY_HOPS)?.trim();
  if (candidate !== undefined && IP_LITERAL.test(candidate)) return candidate;

  const realIp = headers.get('x-real-ip')?.trim();
  if (realIp !== undefined && IP_LITERAL.test(realIp)) return realIp;

  return 'unknown-client';
}
