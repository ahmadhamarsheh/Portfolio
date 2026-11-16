/**
 * POST /api/contact — Cloudflare Pages Function.
 *
 * This file is the composition root: it reads configuration, wires concrete
 * adapters into the framework-free use case, and translates HTTP. All
 * business rules live in /server and /src/lib/contact.
 */
import { createContactHandler } from '../../server/contact/handleContact';
import { consoleLogger } from '../../server/contact/ports';
import { ConsoleEmailProvider } from '../../server/email/ConsoleEmailProvider';
import { ResendEmailProvider } from '../../server/email/ResendEmailProvider';
import { KvRateLimiter, MemoryKeyValueStore } from '../../server/security/rateLimiter';
import { TurnstileVerifier } from '../../server/security/TurnstileVerifier';

interface Env {
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
  /** Comma-separated extra origins allowed to post (e.g. a custom domain). */
  ALLOWED_ORIGINS?: string;
  RATE_LIMIT_KV?: KVNamespace;
}

const MAX_BODY_BYTES = 16 * 1024;
const RATE_LIMIT = { limit: 5, windowSeconds: 600 }; // 5 messages per 10 minutes per IP
const fallbackStore = new MemoryKeyValueStore();

function json(status: number, body: unknown, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extra,
    },
  });
}

function isAllowedOrigin(request: Request, env: Env): boolean {
  const origin = request.headers.get('Origin');
  if (!origin) return false;
  const allowed = new Set([new URL(request.url).origin]);
  for (const entry of (env.ALLOWED_ORIGINS ?? '').split(',')) {
    if (entry.trim()) allowed.add(entry.trim().replace(/\/$/, ''));
  }
  return allowed.has(origin);
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!isAllowedOrigin(request, env)) return json(403, { ok: false, error: 'origin' });

  const contentType = request.headers.get('Content-Type') ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return json(415, { ok: false, error: 'unsupported_media_type' });
  }

  const declaredLength = Number(request.headers.get('Content-Length') ?? '0');
  if (declaredLength > MAX_BODY_BYTES) return json(413, { ok: false, error: 'too_large' });

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return json(413, { ok: false, error: 'too_large' });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: 'invalid_json' });
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return json(400, { ok: false, error: 'invalid_json' });
  }

  if (!env.TURNSTILE_SECRET_KEY || !env.CONTACT_TO_EMAIL) {
    consoleLogger.error('contact.misconfigured', {
      turnstile: Boolean(env.TURNSTILE_SECRET_KEY),
      to: Boolean(env.CONTACT_TO_EMAIL),
    });
    return json(503, { ok: false, error: 'unavailable' });
  }

  if (!env.RATE_LIMIT_KV) consoleLogger.warn('contact.rate_limit_memory_fallback');
  if (!env.RESEND_API_KEY) consoleLogger.warn('contact.email_console_fallback');

  const handle = createContactHandler({
    email: env.RESEND_API_KEY
      ? new ResendEmailProvider(env.RESEND_API_KEY)
      : new ConsoleEmailProvider(consoleLogger),
    captcha: new TurnstileVerifier(env.TURNSTILE_SECRET_KEY, { expectedAction: 'contact' }),
    rateLimiter: new KvRateLimiter(env.RATE_LIMIT_KV ?? fallbackStore, RATE_LIMIT),
    config: {
      to: env.CONTACT_TO_EMAIL,
      from: env.CONTACT_FROM_EMAIL ?? 'Portfolio <onboarding@resend.dev>',
      siteName: 'Portfolio',
    },
    logger: consoleLogger,
  });

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const result = await handle({ body: body as Record<string, unknown>, ip });
  const extra: Record<string, string> =
    result.status === 429 ? { 'Retry-After': String(result.retryAfterSeconds) } : {};
  return json(result.status, result.body, extra);
};

export const onRequest: PagesFunction<Env> = async () =>
  json(405, { ok: false, error: 'method_not_allowed' }, { Allow: 'POST' });
