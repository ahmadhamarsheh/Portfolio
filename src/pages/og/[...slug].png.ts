/**
 * Open Graph images, generated at build time (1200×630 PNG) for the home page
 * and every case study. No design tool needed: change the text, rebuild.
 */
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import type { APIRoute, GetStaticPaths } from 'astro';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { getCaseStudies, getProfile } from '@/lib/content';

const require = createRequire(import.meta.url);
const fontFile = (pkg: string, file: string) => readFile(require.resolve(`${pkg}/files/${file}`));

interface OgProps {
  kicker: string;
  title: string;
  accent?: string;
}

export const getStaticPaths = (async () => {
  const [profile, caseStudies] = await Promise.all([getProfile('en'), getCaseStudies('en')]);
  return [
    {
      params: { slug: 'home' },
      props: {
        kicker: profile.eyebrow,
        title: profile.heroTitle.lead,
        accent: profile.heroTitle.accent,
      } satisfies OgProps,
    },
    ...caseStudies.map((cs) => ({
      params: { slug: `work/${cs.key}` },
      props: { kicker: `Case study · ${cs.kicker}`, title: cs.title } satisfies OgProps,
    })),
  ];
}) satisfies GetStaticPaths;

type Node = { type: string; props: Record<string, unknown> };
const NBSP = String.fromCharCode(0xa0);
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
  type,
  props: { style, children },
});

export const GET: APIRoute = async ({ props, site }) => {
  const { kicker, title, accent } = props as OgProps;
  const [regular, semibold, mono] = await Promise.all([
    fontFile('@fontsource/ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff'),
    fontFile('@fontsource/ibm-plex-sans', 'ibm-plex-sans-latin-600-normal.woff'),
    fontFile('@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff'),
  ]);
  const host = (site ?? new URL('https://ahmadhamarsheh.pages.dev')).host;

  const tree = h(
    'div',
    {
      width: '1200px',
      height: '630px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 80px',
      backgroundColor: '#0b1220',
      backgroundImage:
        'linear-gradient(rgba(120,150,200,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(120,150,200,0.07) 1px, transparent 1px)',
      backgroundSize: '40px 40px',
      color: '#e6edf7',
      fontFamily: 'Plex',
    },
    [
      h(
        'div',
        {
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          fontFamily: 'PlexMono',
          fontSize: 26,
          color: '#94a3b8',
        },
        [
          h('div', {
            width: '12px',
            height: '12px',
            borderRadius: '999px',
            backgroundColor: '#f5a524',
          }),
          kicker,
        ],
      ),
      h(
        'div',
        {
          display: 'flex',
          flexWrap: 'wrap',
          fontSize: accent ? 76 : 64,
          fontWeight: 600,
          lineHeight: 1.08,
          letterSpacing: '-0.02em',
        },
        [
          h('span', { display: 'flex' }, accent ? `${title}${NBSP}` : title),
          ...(accent ? [h('span', { display: 'flex', color: '#f5a524' }, accent)] : []),
        ],
      ),
      h(
        'div',
        {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderTop: '2px solid #1f2e4a',
          paddingTop: '28px',
        },
        [
          h('div', { display: 'flex', flexDirection: 'column', gap: '6px' }, [
            h('span', { fontSize: 34, fontWeight: 600 }, 'Ahmad Hamarsheh'),
            h('span', { fontSize: 24, color: '#94a3b8' }, 'Senior Backend Engineer'),
          ]),
          h('span', { fontFamily: 'PlexMono', fontSize: 24, color: '#94a3b8' }, host),
        ],
      ),
    ],
  );

  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Plex', data: regular, weight: 400, style: 'normal' },
      { name: 'Plex', data: semibold, weight: 600, style: 'normal' },
      { name: 'PlexMono', data: mono, weight: 500, style: 'normal' },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
