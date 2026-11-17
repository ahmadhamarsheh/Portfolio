import type { EmailMessage, EmailProvider } from '../contact/ports';

/** Adapter for the Resend REST API (https://resend.com/docs/api-reference/emails/send-email). */
export class ResendEmailProvider implements EmailProvider {
  static readonly endpoint = 'https://api.resend.com/emails';

  constructor(
    private readonly apiKey: string,
    private readonly fetchFn: typeof fetch = fetch,
  ) {
    if (!apiKey) throw new Error('ResendEmailProvider needs an API key.');
  }

  async send(message: EmailMessage): Promise<void> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
    if (message.idempotencyKey) headers['Idempotency-Key'] = message.idempotencyKey;

    // Call fetch unbound: `this.fetchFn(...)` would pass this adapter as `this`, and the
    // Workers runtime rejects that with "Illegal invocation".
    const fetchFn = this.fetchFn;
    const response = await fetchFn(ResendEmailProvider.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        from: message.from,
        to: [message.to],
        reply_to: message.replyTo,
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
    });

    // 409 with an idempotency key: Resend already accepted this email. A duplicate, not a failure.
    if (response.status === 409 && message.idempotencyKey) return;

    if (!response.ok) {
      // Never include the response body in errors: it can echo message content.
      throw new Error(`Resend responded with HTTP ${response.status}`);
    }
  }
}
