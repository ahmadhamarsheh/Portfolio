import { beforeEach, describe, expect, it } from 'vitest';
import { createContactHandler, type ContactDeps } from '../../server/contact/handleContact';
import type {
  CaptchaVerifier,
  EmailMessage,
  EmailProvider,
  RateLimiter,
} from '../../server/contact/ports';

class FakeEmail implements EmailProvider {
  sent: EmailMessage[] = [];
  fail = false;
  async send(message: EmailMessage) {
    if (this.fail) throw new Error('provider down');
    this.sent.push(message);
  }
}

class FakeCaptcha implements CaptchaVerifier {
  constructor(public pass = true) {}
  calls = 0;
  async verify() {
    this.calls += 1;
    return this.pass;
  }
}

class FakeLimiter implements RateLimiter {
  constructor(public allowed = true) {}
  keys: string[] = [];
  async consume(key: string) {
    this.keys.push(key);
    return { allowed: this.allowed, retryAfterSeconds: this.allowed ? 0 : 120 };
  }
}

const body = {
  name: 'Sara',
  email: 'sara@example.com',
  company: '',
  topic: 'role',
  message: 'Hello Ahmad, we are hiring a senior backend engineer.',
  website: '',
  token: 'token-123',
  lang: 'en',
};

describe('createContactHandler', () => {
  let email: FakeEmail;
  let captcha: FakeCaptcha;
  let limiter: FakeLimiter;
  let deps: ContactDeps;

  beforeEach(() => {
    email = new FakeEmail();
    captcha = new FakeCaptcha();
    limiter = new FakeLimiter();
    deps = {
      email,
      captcha,
      rateLimiter: limiter,
      config: {
        to: 'me@example.com',
        from: 'Portfolio <noreply@example.com>',
        siteName: 'Portfolio',
      },
      hash: async (v) => `hash:${v.length}`,
    };
  });

  it('sends one email with the visitor as reply-to and an idempotency key', async () => {
    const result = await createContactHandler(deps)({ body, ip: '1.2.3.4' });
    expect(result).toEqual({ status: 200, body: { ok: true } });
    expect(email.sent).toHaveLength(1);
    expect(email.sent[0]).toMatchObject({
      to: 'me@example.com',
      replyTo: 'sara@example.com',
      subject: '[Portfolio] Job / contract role from Sara',
    });
    expect(email.sent[0]?.idempotencyKey).toMatch(/^hash:/);
    expect(limiter.keys).toEqual(['contact:1.2.3.4']);
  });

  it('silently accepts honeypot submissions without sending or calling the captcha', async () => {
    const result = await createContactHandler(deps)({
      body: { ...body, website: 'http://spam' },
      ip: 'x',
    });
    expect(result.status).toBe(200);
    expect(email.sent).toHaveLength(0);
    expect(captcha.calls).toBe(0);
  });

  it('returns field errors for invalid input before touching the rate limiter', async () => {
    const result = await createContactHandler(deps)({ body: { ...body, email: 'nope' }, ip: 'x' });
    expect(result).toEqual({
      status: 400,
      body: { ok: false, error: 'validation', fields: { email: 'email.invalid' } },
    });
    expect(limiter.keys).toHaveLength(0);
  });

  it('returns 429 with Retry-After seconds when rate limited', async () => {
    limiter.allowed = false;
    const result = await createContactHandler(deps)({ body, ip: 'x' });
    expect(result.status).toBe(429);
    if (result.status === 429) expect(result.retryAfterSeconds).toBe(120);
    expect(captcha.calls).toBe(0);
  });

  it('returns 403 when the captcha fails', async () => {
    captcha.pass = false;
    const result = await createContactHandler(deps)({ body, ip: 'x' });
    expect(result).toEqual({ status: 403, body: { ok: false, error: 'captcha' } });
    expect(email.sent).toHaveLength(0);
  });

  it('returns 502 when the email provider fails', async () => {
    email.fail = true;
    const result = await createContactHandler(deps)({ body, ip: 'x' });
    expect(result).toEqual({ status: 502, body: { ok: false, error: 'delivery' } });
  });

  it('escapes HTML and blocks header injection in the email', async () => {
    await createContactHandler(deps)({
      body: {
        ...body,
        name: 'Eve\r\nBcc: victim@example.com',
        message: '<script>alert(1)</script> hello there friend',
      },
      ip: 'x',
    });
    const sent = email.sent[0];
    expect(sent?.subject).not.toMatch(/[\r\n]/);
    expect(sent?.html).not.toContain('<script>');
    expect(sent?.html).toContain('&lt;script&gt;');
  });
});
