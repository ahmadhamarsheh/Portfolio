import type { EmailMessage, EmailProvider, Logger } from '../contact/ports';

/**
 * Development adapter: logs the email instead of sending it. Used when no
 * RESEND_API_KEY is configured (local dev, preview deployments).
 */
export class ConsoleEmailProvider implements EmailProvider {
  readonly sent: EmailMessage[] = [];

  constructor(private readonly logger: Logger) {}

  async send(message: EmailMessage): Promise<void> {
    this.sent.push(message);
    this.logger.info('email.console', {
      to: message.to,
      subject: message.subject,
      body: message.text,
    });
  }
}
