import type { CaptchaVerifier } from '../contact/ports';

interface SiteverifyResponse {
  success: boolean;
  hostname?: string;
  action?: string;
  'error-codes'?: string[];
}

/** Adapter for Cloudflare Turnstile server-side validation (siteverify). */
export class TurnstileVerifier implements CaptchaVerifier {
  static readonly endpoint = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

  constructor(
    private readonly secret: string,
    private readonly options: { expectedAction?: string; fetchFn?: typeof fetch } = {},
  ) {
    if (!secret) throw new Error('TurnstileVerifier needs a secret key.');
  }

  async verify(token: string, remoteIp?: string): Promise<boolean> {
    // Tokens are at most 2048 characters; reject obviously bad input without a network call.
    if (!token || token.length > 2048) return false;

    const form = new FormData();
    form.append('secret', this.secret);
    form.append('response', token);
    if (remoteIp) form.append('remoteip', remoteIp);

    try {
      const fetchFn = this.options.fetchFn ?? fetch;
      const response = await fetchFn(TurnstileVerifier.endpoint, { method: 'POST', body: form });
      if (!response.ok) return false;
      const result = (await response.json()) as SiteverifyResponse;
      if (!result.success) return false;
      if (
        this.options.expectedAction &&
        result.action &&
        result.action !== this.options.expectedAction
      ) {
        return false;
      }
      return true;
    } catch {
      return false; // fail closed
    }
  }
}
