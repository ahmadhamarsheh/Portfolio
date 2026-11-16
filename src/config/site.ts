/**
 * Non-translatable facts about the site owner. Translatable copy lives in
 * `src/content/profile/*` and `src/i18n/ui.ts`.
 */
export const siteConfig = {
  name: 'Ahmad Hamarsheh',
  email: 'ahmadhamarshe@outlook.com',
  linkedin: 'https://www.linkedin.com/in/ahmadhamarsheh',
  github: 'https://github.com/ahmadhamarsheh',
  sourceRepo: 'https://github.com/ahmadhamarsheh/Portfolio',
  cvPath: '/cv/Ahmad-Hamarsheh-CV.pdf',
  photo: '/images/ahmad-hamarsheh.jpg',
  careerStartYear: 2021,
} as const;

export type SiteConfig = typeof siteConfig;
