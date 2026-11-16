import type { ContactInput, ContactTopic } from '../../src/lib/contact/validation';
import { escapeHtml, headerSafe, textToHtml } from '../security/sanitize';
import type { EmailMessage } from './ports';

const TOPIC_LABELS: Record<ContactTopic, string> = {
  role: 'Job / contract role',
  project: 'Freelance project',
  other: 'Other',
};

export interface ComposeOptions {
  to: string;
  from: string;
  siteName: string;
  lang: string;
}

/**
 * Builds the notification email. Every user-supplied value is escaped or header-safe.
 * Deterministic on purpose (no timestamps): the same input yields the same payload,
 * which the email provider's idempotency check relies on.
 */
export function composeContactEmail(input: ContactInput, options: ComposeOptions): EmailMessage {
  const topic = TOPIC_LABELS[input.topic];
  const subject = headerSafe(`[${options.siteName}] ${topic} — ${input.name}`);
  const rows: Array<[string, string]> = [
    ['Name', input.name],
    ['Email', input.email],
    ['Company', input.company || '—'],
    ['Topic', topic],
    ['Language', options.lang === 'ar' ? 'Arabic' : 'English'],
  ];

  const text = [...rows.map(([label, value]) => `${label}: ${value}`), '', input.message].join(
    '\n',
  );

  const html = [
    '<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#0b1220">',
    '<table cellpadding="4" style="border-collapse:collapse">',
    ...rows.map(
      ([label, value]) =>
        `<tr><td style="color:#475569">${escapeHtml(label)}</td><td><strong>${escapeHtml(value)}</strong></td></tr>`,
    ),
    '</table>',
    '<hr style="border:none;border-top:1px solid #d9e1ec;margin:16px 0">',
    textToHtml(input.message),
    '</div>',
  ].join('');

  return {
    to: options.to,
    from: options.from,
    replyTo: input.email,
    subject,
    text,
    html,
  };
}
