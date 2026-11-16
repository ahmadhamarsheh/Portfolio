import { validateContact, type ContactErrors } from '../../src/lib/contact/validation';
import { composeContactEmail } from './composeEmail';
import {
  silentLogger,
  type CaptchaVerifier,
  type EmailProvider,
  type Logger,
  type RateLimiter,
} from './ports';

/**
 * The contact use case — framework-free. It only knows its ports, so it is
 * tested with fakes and runs unchanged on Pages Functions or Workers.
 *
 * Order matters: cheap checks first (honeypot, validation), then the rate
 * limit (protects the captcha API and the email quota), then the captcha,
 * and only then sending.
 */
export interface ContactConfig {
  to: string;
  from: string;
  siteName: string;
}

export interface ContactDeps {
  email: EmailProvider;
  captcha: CaptchaVerifier;
  rateLimiter: RateLimiter;
  config: ContactConfig;
  logger?: Logger;
  /** Hashes a string (used for the idempotency key). Defaults to SHA-256 via Web Crypto. */
  hash?: (value: string) => Promise<string>;
}

export interface ContactRequest {
  body: Readonly<Record<string, unknown>>;
  ip: string;
}

export type ContactResponse =
  | { status: 200; body: { ok: true } }
  | { status: 400; body: { ok: false; error: 'validation'; fields: ContactErrors } }
  | { status: 403; body: { ok: false; error: 'captcha' } }
  | { status: 429; body: { ok: false; error: 'rate_limited' }; retryAfterSeconds: number }
  | { status: 502; body: { ok: false; error: 'delivery' } };

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function createContactHandler(deps: ContactDeps) {
  const logger = deps.logger ?? silentLogger;
  const hash = deps.hash ?? sha256;

  return async function handleContact(request: ContactRequest): Promise<ContactResponse> {
    const { body, ip } = request;

    // 1. Honeypot: humans never see the field. Pretend success so bots learn nothing.
    if (typeof body['website'] === 'string' && body['website'].trim() !== '') {
      logger.warn('contact.honeypot', { ip });
      return { status: 200, body: { ok: true } };
    }

    // 2. Validation — the same rules the browser applied.
    const result = validateContact(body);
    if (!result.ok) {
      return { status: 400, body: { ok: false, error: 'validation', fields: result.errors } };
    }

    // 3. Rate limit per client IP.
    const decision = await deps.rateLimiter.consume(`contact:${ip}`);
    if (!decision.allowed) {
      logger.warn('contact.rate_limited', { ip });
      return {
        status: 429,
        body: { ok: false, error: 'rate_limited' },
        retryAfterSeconds: decision.retryAfterSeconds,
      };
    }

    // 4. Captcha (Cloudflare Turnstile).
    const token = typeof body['token'] === 'string' ? body['token'] : '';
    if (!(await deps.captcha.verify(token, ip))) {
      logger.warn('contact.captcha_failed', { ip });
      return { status: 403, body: { ok: false, error: 'captcha' } };
    }

    // 5. Send. The idempotency key makes an accidental double submit send one email.
    const lang = body['lang'] === 'ar' ? 'ar' : 'en';
    const message = composeContactEmail(result.data, { ...deps.config, lang });
    message.idempotencyKey = await hash(
      [result.data.email, result.data.topic, result.data.message].join('\u0000'),
    );

    try {
      await deps.email.send(message);
    } catch (error) {
      logger.error('contact.delivery_failed', {
        reason: error instanceof Error ? error.message : 'unknown',
      });
      return { status: 502, body: { ok: false, error: 'delivery' } };
    }

    logger.info('contact.sent', { topic: result.data.topic, lang });
    return { status: 200, body: { ok: true } };
  };
}
