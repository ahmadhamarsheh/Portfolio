// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * The public URL of the site. Override with SITE_URL when a custom domain
 * (e.g. https://ahmadhamarsheh.dev) is attached. No code change needed.
 */
const site = process.env.SITE_URL ?? 'https://ahmadhamarsheh.pages.dev';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar'],
    routing: { prefixDefaultLocale: false },
  },
  build: {
    format: 'directory',
    // Never inline CSS: keeps the Content-Security-Policy strict (style-src 'self').
    inlineStylesheets: 'never',
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', ar: 'ar' } },
      filter: (page) => !page.includes('/cv/') && !page.includes('/404'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    // Never inline scripts/assets as data URIs: keeps script-src 'self' strict.
    build: { assetsInlineLimit: 0 },
  },
  devToolbar: { enabled: false },
});
