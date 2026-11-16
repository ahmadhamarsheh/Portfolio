const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes text for safe insertion into HTML (the notification email). */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

/**
 * Makes a value safe for an email header (e.g. the subject): no CR/LF, so it
 * can't inject extra headers; collapsed whitespace; bounded length.
 */
export function headerSafe(value: string, maxLength = 120): string {
  const flat = value
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return [...flat].slice(0, maxLength).join('');
}

/** Turns plain text into HTML paragraphs with escaped content and preserved line breaks. */
export function textToHtml(value: string): string {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('');
}
