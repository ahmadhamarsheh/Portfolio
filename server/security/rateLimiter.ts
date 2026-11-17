import type { KeyValueStore, RateLimitDecision, RateLimiter } from '../contact/ports';

export interface RateLimitOptions {
  /** Allowed requests per window. */
  limit: number;
  /** Window length in seconds. */
  windowSeconds: number;
  now?: () => number;
}

/**
 * Fixed-window limiter on a key-value store (Cloudflare KV in production).
 * KV is eventually consistent, so the limit is approximate under bursts.
 * That is acceptable for a contact form, where Turnstile is the primary bot defence.
 */
export class KvRateLimiter implements RateLimiter {
  constructor(
    private readonly store: KeyValueStore,
    private readonly options: RateLimitOptions,
  ) {}

  async consume(key: string): Promise<RateLimitDecision> {
    const nowMs = (this.options.now ?? Date.now)();
    const { limit, windowSeconds } = this.options;
    const windowIndex = Math.floor(nowMs / 1000 / windowSeconds);
    const windowEnd = (windowIndex + 1) * windowSeconds;
    const retryAfterSeconds = Math.max(1, Math.ceil(windowEnd - nowMs / 1000));
    const storeKey = `rl:${key}:${windowIndex}`;

    const count = Number.parseInt((await this.store.get(storeKey)) ?? '0', 10) || 0;
    if (count >= limit) return { allowed: false, retryAfterSeconds };

    // KV requires a TTL of at least 60 seconds.
    await this.store.put(storeKey, String(count + 1), {
      expirationTtl: Math.max(60, windowSeconds * 2),
    });
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

/** In-memory store for tests and local development (per-isolate, not shared). */
export class MemoryKeyValueStore implements KeyValueStore {
  private readonly data = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.data.get(key) ?? null;
  }

  async put(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }
}
