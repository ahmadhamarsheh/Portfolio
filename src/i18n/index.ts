import { defaultLang, langs, ui, type Lang, type UiKey } from './ui';

export { defaultLang, langs, languages, type Lang, type UiKey } from './ui';

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (langs as string[]).includes(value);
}

/** Returns a translator bound to one language. */
export function useTranslations(lang: Lang) {
  const dict = ui[lang];
  return function t(key: UiKey): string {
    return dict[key];
  };
}

export function dir(lang: Lang): 'ltr' | 'rtl' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

/** Detects the language from a URL path: `/ar/...` is Arabic, everything else English. */
export function getLangFromPath(pathname: string): Lang {
  const first = pathname.split('/').filter(Boolean)[0];
  return isLang(first) ? first : defaultLang;
}

/** Removes the language prefix: `/ar/work/x/` → `/work/x/`. */
export function stripLang(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] && isLang(parts[0]) && parts[0] !== defaultLang) parts.shift();
  const rest = parts.join('/');
  return rest ? `/${rest}/` : '/';
}

/** Builds a path for a language: `localizePath('/work/x/', 'ar')` → `/ar/work/x/`. */
export function localizePath(path: string, lang: Lang): string {
  const clean = stripLang(path);
  if (lang === defaultLang) return clean;
  return clean === '/' ? `/${lang}/` : `/${lang}${clean}`;
}

/** The same page in the other language. */
export function alternatePath(pathname: string, target: Lang): string {
  return localizePath(pathname, target);
}
