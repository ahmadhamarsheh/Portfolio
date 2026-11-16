import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  alternatePath,
  dir,
  getLangFromPath,
  localizePath,
  stripLang,
  useTranslations,
} from '@/i18n';
import { langs, ui } from '@/i18n/ui';

describe('i18n dictionary', () => {
  it('has the same keys in every language and no empty strings', () => {
    const reference = Object.keys(ui.en).sort();
    for (const lang of langs) {
      expect(Object.keys(ui[lang]).sort()).toEqual(reference);
      for (const [key, value] of Object.entries(ui[lang])) {
        expect(value.trim(), `${lang}.${key}`).not.toBe('');
      }
    }
  });

  it('translates through useTranslations', () => {
    expect(useTranslations('ar')('nav.work')).toBe('الأعمال');
    expect(useTranslations('en')('nav.work')).toBe('Work');
  });
});

describe('i18n routing helpers', () => {
  it('detects language from the path', () => {
    expect(getLangFromPath('/')).toBe('en');
    expect(getLangFromPath('/ar/')).toBe('ar');
    expect(getLangFromPath('/ar/work/x/')).toBe('ar');
    expect(getLangFromPath('/work/x/')).toBe('en');
  });

  it('builds localized paths both ways', () => {
    expect(localizePath('/', 'ar')).toBe('/ar/');
    expect(localizePath('/work/x/', 'ar')).toBe('/ar/work/x/');
    expect(localizePath('/ar/work/x/', 'en')).toBe('/work/x/');
    expect(alternatePath('/ar/', 'en')).toBe('/');
    expect(stripLang('/ar')).toBe('/');
  });

  it('sets the text direction', () => {
    expect(dir('ar')).toBe('rtl');
    expect(dir('en')).toBe('ltr');
  });
});

describe('content parity (every entry exists in every language)', () => {
  const contentRoot = join(process.cwd(), 'src/content');
  const collections = ['experience', 'case-studies', 'services', 'skills'];

  for (const collection of collections) {
    it(`${collection}: same files in en/ and ar/, and key matches the file name`, () => {
      const files = Object.fromEntries(
        langs.map((lang) => [
          lang,
          readdirSync(join(contentRoot, collection, lang))
            .filter((f) => f.endsWith('.md'))
            .sort(),
        ]),
      );
      expect(files['ar']).toEqual(files['en']);
      for (const lang of langs) {
        for (const file of files[lang] ?? []) {
          const source = readFileSync(join(contentRoot, collection, lang, file), 'utf8');
          expect(source).toMatch(new RegExp(`^key: ${file.replace(/\.md$/, '')}$`, 'm'));
          expect(source).toMatch(new RegExp(`^lang: ${lang}$`, 'm'));
        }
      }
    });
  }

  it('profile exists for every language', () => {
    const files = readdirSync(join(contentRoot, 'profile')).sort();
    expect(files).toEqual(langs.map((l) => `${l}.md`).sort());
  });
});
