import { describe, expect, it, vi } from 'vitest';
import { ResendEmailProvider } from '../../server/email/ResendEmailProvider';
import { KvRateLimiter, MemoryKeyValueStore } from '../../server/security/rateLimiter';
import { TurnstileVerifier } from '../../server/security/TurnstileVerifier';
import { escapeHtml, headerSafe, textToHtml } from '../../server/security/sanitize';

/**
 * Behaves like the Workers runtime's fetch: it throws "Illegal invocation" when it is
 * called as a method of some other object (e.g. `this.fetchFn(...)`).
 */
function workersLikeFetch(body: object = {}) {
  return function (this: unknown): Promise<Response> {
    if (this !== undefined && this !== globalThis) {
      throw new TypeError('Illegal invocation: function called with incorrect `this` reference.');
    }
    return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
  } as unknown as typeof fetch;
}

const message = {
  to: 'me@example.com',
  from: 'Portfolio <noreply@example.com>',
  replyTo: 'sara@example.com',
  subject: 'Hi',
  text: 'Hello',
  html: '<p>Hello</p>',
  idempotencyKey: 'abc',
};

describe('ResendEmailProvider', () => {
  it('posts the message with auth and idempotency headers', async () => {
    const fetchFn = vi.fn(async () => new Response('{"id":"1"}', { status: 200 }));
    await new ResendEmailProvider('re_test', fetchFn as unknown as typeof fetch).send(message);

    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer re_test',
      'Idempotency-Key': 'abc',
    });
    expect(JSON.parse(String(init.body))).toMatchObject({
      to: ['me@example.com'],
      reply_to: 'sara@example.com',
    });
  });

  it('treats a 409 idempotency conflict as already sent', async () => {
    const fetchFn = vi.fn(async () => new Response('', { status: 409 }));
    await expect(
      new ResendEmailProvider('k', fetchFn as unknown as typeof fetch).send(message),
    ).resolves.toBeUndefined();
  });

  it('throws on other errors without leaking the response body', async () => {
    const fetchFn = vi.fn(async () => new Response('secret details', { status: 500 }));
    await expect(
      new ResendEmailProvider('k', fetchFn as unknown as typeof fetch).send(message),
    ).rejects.toThrow('Resend responded with HTTP 500');
  });

  it('refuses to start without an API key', () => {
    expect(() => new ResendEmailProvider('')).toThrow();
  });

  it('calls fetch unbound, as the Workers runtime requires', async () => {
    await expect(
      new ResendEmailProvider('k', workersLikeFetch({ id: '1' })).send(message),
    ).resolves.toBeUndefined();
  });
});

describe('TurnstileVerifier', () => {
  const ok = (body: object) =>
    vi.fn(async () => new Response(JSON.stringify(body), { status: 200 }));

  it('accepts a successful verification with the expected action', async () => {
    const verifier = new TurnstileVerifier('secret', {
      expectedAction: 'contact',
      fetchFn: ok({ success: true, action: 'contact' }) as unknown as typeof fetch,
    });
    await expect(verifier.verify('token', '1.2.3.4')).resolves.toBe(true);
  });

  it('rejects a token issued for another action', async () => {
    const verifier = new TurnstileVerifier('secret', {
      expectedAction: 'contact',
      fetchFn: ok({ success: true, action: 'login' }) as unknown as typeof fetch,
    });
    await expect(verifier.verify('token')).resolves.toBe(false);
  });

  it('rejects empty tokens without a network call', async () => {
    const fetchFn = vi.fn();
    const verifier = new TurnstileVerifier('secret', {
      fetchFn: fetchFn as unknown as typeof fetch,
    });
    await expect(verifier.verify('')).resolves.toBe(false);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('fails closed when the network fails', async () => {
    const fetchFn = vi.fn(async () => {
      throw new Error('offline');
    });
    const verifier = new TurnstileVerifier('secret', {
      fetchFn: fetchFn as unknown as typeof fetch,
    });
    await expect(verifier.verify('token')).resolves.toBe(false);
  });

  it('calls fetch unbound, as the Workers runtime requires', async () => {
    const verifier = new TurnstileVerifier('secret', {
      expectedAction: 'contact',
      fetchFn: workersLikeFetch({ success: true, action: 'contact' }),
    });
    await expect(verifier.verify('token')).resolves.toBe(true);
  });
});

describe('KvRateLimiter', () => {
  it('allows up to the limit per window, then blocks with Retry-After', async () => {
    let now = 1_000_000;
    const limiter = new KvRateLimiter(new MemoryKeyValueStore(), {
      limit: 2,
      windowSeconds: 600,
      now: () => now,
    });

    expect((await limiter.consume('ip')).allowed).toBe(true);
    expect((await limiter.consume('ip')).allowed).toBe(true);
    const blocked = await limiter.consume('ip');
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);

    expect((await limiter.consume('other-ip')).allowed).toBe(true);

    now += 600_000; // next window
    expect((await limiter.consume('ip')).allowed).toBe(true);
  });
});

describe('sanitize', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;',
    );
  });

  it('removes line breaks from header values and bounds their length', () => {
    expect(headerSafe('a\r\nb')).toBe('a b');
    expect(headerSafe('x'.repeat(500), 10)).toHaveLength(10);
  });

  it('converts paragraphs and line breaks to safe HTML', () => {
    expect(textToHtml('one\ntwo\n\n<three>')).toBe('<p>one<br>two</p><p>&lt;three&gt;</p>');
  });
});
