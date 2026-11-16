import { describe, expect, it } from 'vitest';
import { CONTACT_LIMITS, cleanText, textLength, validateContact } from '@/lib/contact/validation';

const valid = {
  name: 'Sara Haddad',
  email: 'Sara@Example.com',
  company: 'Acme',
  topic: 'project',
  message: 'We need a payment gateway integration for our store.',
};

describe('validateContact', () => {
  it('accepts a valid message and normalises it', () => {
    const result = validateContact({ ...valid, name: '  Sara   Haddad ' });
    expect(result).toEqual({
      ok: true,
      data: { ...valid, name: 'Sara Haddad', email: 'sara@example.com' },
    });
  });

  it('treats company as optional', () => {
    const result = validateContact({ ...valid, company: undefined });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.company).toBe('');
  });

  it.each([
    ['name', '', 'name.required'],
    ['name', 'x'.repeat(CONTACT_LIMITS.nameMax + 1), 'name.tooLong'],
    ['email', 'not-an-email', 'email.invalid'],
    ['email', 'a@b', 'email.invalid'],
    ['email', 'a b@example.com', 'email.invalid'],
    ['company', 'x'.repeat(CONTACT_LIMITS.companyMax + 1), 'company.tooLong'],
    ['topic', 'spam', 'topic.invalid'],
    ['message', 'too short', 'message.tooShort'],
    ['message', 'x'.repeat(CONTACT_LIMITS.messageMax + 1), 'message.tooLong'],
  ])('rejects %s = %j with %s', (field, value, code) => {
    const result = validateContact({ ...valid, [field]: value });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[field as keyof typeof result.errors]).toBe(code);
  });

  it('reports every invalid field at once', () => {
    const result = validateContact({});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(['email', 'message', 'name', 'topic']);
    }
  });

  it('ignores non-string input types instead of crashing', () => {
    const result = validateContact({ name: 42, email: {}, message: ['x'], topic: null });
    expect(result.ok).toBe(false);
  });

  it('counts Arabic text by characters, not bytes', () => {
    const arabic = 'نحتاج إلى ربط بوابة دفع لمتجرنا الإلكتروني';
    const result = validateContact({ ...valid, message: arabic });
    expect(result.ok).toBe(true);
    expect(textLength('مرحبا')).toBe(5);
  });
});

describe('cleanText', () => {
  it('strips control characters and collapses whitespace on single-line fields', () => {
    expect(cleanText('Ahmad\u0000\r\nHamarsheh\t ', { multiline: false })).toBe('Ahmad Hamarsheh');
  });

  it('keeps line breaks in multi-line fields but limits blank lines', () => {
    expect(cleanText('Hi\r\n\r\n\r\n\r\nThere\u0007', { multiline: true })).toBe('Hi\n\nThere');
  });

  it('returns an empty string for non-strings', () => {
    expect(cleanText(undefined, { multiline: false })).toBe('');
  });
});
