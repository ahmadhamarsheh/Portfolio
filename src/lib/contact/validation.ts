/**
 * Contact form validation — one module, used by the browser (instant feedback)
 * and by the server (the source of truth). No dependencies, no DOM, no Node
 * APIs, so it runs in the browser, in Cloudflare Workers and in unit tests.
 *
 * Errors are returned as codes; each UI translates them into its language.
 */
export const CONTACT_TOPICS = ['role', 'project', 'other'] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const CONTACT_LIMITS = {
  nameMax: 100,
  emailMax: 254,
  companyMax: 120,
  messageMin: 20,
  messageMax: 4000,
} as const;

export interface ContactInput {
  name: string;
  email: string;
  company: string;
  topic: ContactTopic;
  message: string;
}

export type ContactField = keyof ContactInput;

export type ContactErrorCode =
  | 'name.required'
  | 'name.tooLong'
  | 'email.invalid'
  | 'company.tooLong'
  | 'topic.invalid'
  | 'message.tooShort'
  | 'message.tooLong';

export type ContactErrors = Partial<Record<ContactField, ContactErrorCode>>;

export type ValidationResult =
  { ok: true; data: ContactInput } | { ok: false; errors: ContactErrors };

// Pragmatic email check: one "@", no spaces or angle brackets, a dot in the domain.
const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:".]+(\.[^\s@<>()[\]\\,;:".]+)+$/;

// C0/C1 control characters, except tab (\t) and line feed (\n).
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_AND_NEWLINES = /[\u0000-\u001F\u007F-\u009F]/g;

/** Unicode-aware length (counts code points, so Arabic and emoji count correctly). */
export const textLength = (value: string): number => [...value].length;

/** Normalises user text: NFC, no control characters, trimmed. */
export function cleanText(value: unknown, options: { multiline: boolean }): string {
  if (typeof value !== 'string') return '';
  const normalised = value.normalize('NFC').replace(/\r\n?/g, '\n');
  if (options.multiline) {
    return normalised
      .replace(CONTROL_CHARS, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
  return normalised.replace(CONTROL_CHARS_AND_NEWLINES, ' ').replace(/\s+/g, ' ').trim();
}

export function isContactTopic(value: unknown): value is ContactTopic {
  return typeof value === 'string' && (CONTACT_TOPICS as readonly string[]).includes(value);
}

export function validateContact(raw: Readonly<Record<string, unknown>>): ValidationResult {
  const name = cleanText(raw['name'], { multiline: false });
  const email = cleanText(raw['email'], { multiline: false }).toLowerCase();
  const company = cleanText(raw['company'], { multiline: false });
  const message = cleanText(raw['message'], { multiline: true });
  const topic = raw['topic'];

  const errors: ContactErrors = {};

  if (!name) errors.name = 'name.required';
  else if (textLength(name) > CONTACT_LIMITS.nameMax) errors.name = 'name.tooLong';

  if (textLength(email) > CONTACT_LIMITS.emailMax || !EMAIL_PATTERN.test(email)) {
    errors.email = 'email.invalid';
  }

  if (textLength(company) > CONTACT_LIMITS.companyMax) errors.company = 'company.tooLong';

  if (!isContactTopic(topic)) errors.topic = 'topic.invalid';

  if (textLength(message) < CONTACT_LIMITS.messageMin) errors.message = 'message.tooShort';
  else if (textLength(message) > CONTACT_LIMITS.messageMax) errors.message = 'message.tooLong';

  if (Object.keys(errors).length > 0 || !isContactTopic(topic)) {
    return { ok: false, errors };
  }

  return { ok: true, data: { name, email, company, topic, message } };
}
