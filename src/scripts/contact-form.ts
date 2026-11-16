/**
 * Contact form enhancement:
 *  - instant validation with the same module the server uses,
 *  - Cloudflare Turnstile loaded only when the form comes into view,
 *  - JSON submission with clear, translated status messages.
 */
import {
  validateContact,
  type ContactErrorCode,
  type ContactField,
} from '@/lib/contact/validation';

interface Messages {
  validation: Record<ContactErrorCode, string>;
  sending: string;
  send: string;
  success: string;
  fix: string;
  generic: string;
  rate: string;
  captcha: string;
}

interface TurnstileApi {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId?: string): void;
  getResponse(widgetId?: string): string | undefined;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const FIELDS: ContactField[] = ['name', 'email', 'company', 'topic', 'message'];

let turnstileLoading: Promise<TurnstileApi> | undefined;

function loadTurnstile(): Promise<TurnstileApi> {
  turnstileLoading ??= new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const script = document.createElement('script');
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile'));
    script.onerror = () => reject(new Error('turnstile'));
    document.head.appendChild(script);
  });
  return turnstileLoading;
}

export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;

  const messages = JSON.parse(form.dataset['messages'] ?? '{}') as Messages;
  const status = form.querySelector<HTMLElement>('[data-status]');
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]');
  const captchaBox = form.querySelector<HTMLElement>('[data-turnstile]');
  const siteKey = form.dataset['sitekey'] ?? '';
  const lang = form.dataset['lang'] ?? 'en';
  let widgetId: string | undefined;

  const setStatus = (text: string, tone: 'info' | 'error' | 'success') => {
    if (!status) return;
    status.textContent = text;
    status.classList.toggle('text-danger', tone === 'error');
    status.classList.toggle('text-success', tone === 'success');
    status.classList.toggle('text-muted', tone === 'info');
  };

  const showErrors = (errors: Partial<Record<ContactField, ContactErrorCode>>) => {
    for (const field of FIELDS) {
      const input = form.elements.namedItem(field) as HTMLInputElement | null;
      const slot = form.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
      const code = errors[field];
      if (input) input.setAttribute('aria-invalid', code ? 'true' : 'false');
      if (slot) slot.textContent = code ? messages.validation[code] : '';
    }
  };

  const renderCaptcha = async () => {
    if (!captchaBox || widgetId !== undefined) return;
    try {
      const turnstile = await loadTurnstile();
      widgetId = turnstile.render(captchaBox, {
        sitekey: siteKey,
        action: 'contact',
        language: lang,
        appearance: 'interaction-only',
        theme: document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark',
      });
    } catch {
      /* If Turnstile can't load, the server rejects the message and we show the captcha error. */
    }
  };

  // Load the captcha only when the form is about to be used.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          void renderCaptcha();
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(form);
  } else {
    void renderCaptcha();
  }
  form.addEventListener('focusin', () => void renderCaptcha(), { once: true });

  // Clear a field's error as soon as the user fixes it.
  form.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    if (target.getAttribute('aria-invalid') !== 'true') return;
    const result = validateContact(Object.fromEntries(new FormData(form)));
    const field = target.name as ContactField;
    if (result.ok || !result.errors[field]) {
      target.setAttribute('aria-invalid', 'false');
      const slot = form.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
      if (slot) slot.textContent = '';
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const raw = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const result = validateContact(raw);

    if (!result.ok) {
      showErrors(result.errors);
      setStatus(messages.fix, 'error');
      const first = FIELDS.find((f) => result.errors[f]);
      if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    showErrors({});

    const token = raw['cf-turnstile-response'] ?? window.turnstile?.getResponse(widgetId) ?? '';

    if (submit) {
      submit.disabled = true;
      submit.textContent = messages.sending;
    }
    setStatus(messages.sending, 'info');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...result.data, website: raw['website'] ?? '', token, lang }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
        fields?: Partial<Record<ContactField, ContactErrorCode>>;
      };

      if (response.ok) {
        form.reset();
        setStatus(messages.success, 'success');
      } else if (response.status === 400 && body.fields) {
        showErrors(body.fields);
        setStatus(messages.fix, 'error');
      } else if (response.status === 429) {
        setStatus(messages.rate, 'error');
      } else if (response.status === 403 && body.error === 'captcha') {
        setStatus(messages.captcha, 'error');
      } else {
        setStatus(messages.generic, 'error');
      }
    } catch {
      setStatus(messages.generic, 'error');
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = messages.send;
      }
      if (widgetId !== undefined) window.turnstile?.reset(widgetId);
    }
  });
}
