import { siteConfig } from '@/config/site';

/** Serialises JSON-LD safely for embedding in HTML (no `</script>` break-out). */
export function toJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

interface PersonSchemaInput {
  siteUrl: string;
  jobTitle: string;
  description: string;
  knowsAbout: readonly string[];
}

/** schema.org Person + WebSite graph, so search engines understand who the site is about. */
export function buildPersonGraph({
  siteUrl,
  jobTitle,
  description,
  knowsAbout,
}: PersonSchemaInput) {
  const base = siteUrl.replace(/\/$/, '');
  const personId = `${base}/#person`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: siteConfig.name,
        alternateName: 'أحمد حمارشة',
        jobTitle,
        description,
        url: `${base}/`,
        image: `${base}${siteConfig.photo}`,
        email: `mailto:${siteConfig.email}`,
        alumniOf: { '@type': 'CollegeOrUniversity', name: 'Arab American University' },
        knowsLanguage: ['ar', 'en'],
        knowsAbout: [...knowsAbout],
        sameAs: [siteConfig.linkedin, siteConfig.github],
      },
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        url: `${base}/`,
        name: `${siteConfig.name} — Portfolio`,
        inLanguage: ['en', 'ar'],
        publisher: { '@id': personId },
      },
    ],
  };
}
