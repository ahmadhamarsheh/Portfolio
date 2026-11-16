/**
 * Ports (interfaces) the contact use case depends on. Concrete adapters —
 * Resend, Turnstile, Cloudflare KV — are plugged in at the edge
 * (functions/api/contact.ts). Swapping a provider never touches the use case.
 */
export interface EmailMessage {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
  /** Same key ⇒ the provider sends at most one email (protects against double submits). */
  idempotencyKey?: string;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

export interface CaptchaVerifier {
  verify(token: string, remoteIp?: string): Promise<boolean>;
}

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}

export interface RateLimiter {
  consume(key: string): Promise<RateLimitDecision>;
}

export interface Logger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

/** Minimal key-value contract — satisfied by Cloudflare KV and by test fakes. */
export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export const silentLogger: Logger = {
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

/** Structured JSON logs — readable in Cloudflare's log stream. Never logs message bodies. */
export const consoleLogger: Logger = {
  info: (message, meta) => console.log(JSON.stringify({ level: 'info', message, ...meta })),
  warn: (message, meta) => console.warn(JSON.stringify({ level: 'warn', message, ...meta })),
  error: (message, meta) => console.error(JSON.stringify({ level: 'error', message, ...meta })),
};
