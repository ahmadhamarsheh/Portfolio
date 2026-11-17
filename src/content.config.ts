import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Content as data. Each collection is validated at build time: a missing or
 * malformed field fails the build before anything is deployed. Adding a job,
 * case study, service or skill group means adding a file. No code changes.
 *
 * Files live in `<collection>/<lang>/<key>.md`. The `key` is shared across
 * languages and a unit test checks that every key exists in every language.
 */
const lang = z.enum(['en', 'ar']);
const nonEmpty = z.string().trim().min(1);

const profile = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/profile' }),
  schema: z.object({
    lang,
    name: nonEmpty,
    headline: nonEmpty,
    eyebrow: nonEmpty,
    heroTitle: z.object({ lead: nonEmpty, accent: nonEmpty }),
    heroLede: nonEmpty,
    cardSubtitle: nonEmpty,
    glance: z.array(z.object({ label: nonEmpty, value: nonEmpty })).min(3),
    metrics: z
      .array(z.object({ value: nonEmpty, label: nonEmpty }))
      .min(2)
      .max(4),
    experienceAt: z.array(nonEmpty).min(1),
    about: z.object({
      paragraphs: z.array(nonEmpty).min(1),
      strengths: z.array(z.object({ title: nonEmpty, text: nonEmpty })).min(2),
    }),
    cvSummary: nonEmpty,
    education: z.array(z.object({ degree: nonEmpty, school: nonEmpty, note: nonEmpty.optional() })),
    certifications: z.array(z.object({ name: nonEmpty, note: nonEmpty.optional() })),
    languagesSpoken: nonEmpty,
  }),
});

const year = z.number().int().min(2000).max(2100);

const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z
    .object({
      lang,
      key: nonEmpty,
      company: nonEmpty,
      role: nonEmpty,
      context: nonEmpty,
      start: year,
      end: z.union([year, z.literal('present')]),
      stage: z.object({ index: z.number().int().positive(), label: nonEmpty }),
      group: z.object({ key: nonEmpty, label: nonEmpty }).optional(),
      summary: nonEmpty.optional(),
      steps: z
        .array(
          z.object({
            period: nonEmpty,
            title: nonEmpty,
            text: nonEmpty,
            highlight: z.boolean().default(false),
          }),
        )
        .optional(),
      stack: z.array(nonEmpty).min(1),
    })
    .refine((e) => Boolean(e.summary) !== Boolean(e.steps), {
      message: 'Provide either `summary` or `steps` (not both).',
    })
    .refine((e) => e.end === 'present' || e.end >= e.start, {
      message: '`end` must not be before `start`.',
    }),
});

const point = z.tuple([z.number(), z.number()]);

export const diagramSchema = z
  .object({
    width: z.number().positive(),
    height: z.number().positive(),
    description: nonEmpty,
    nodes: z
      .array(
        z.object({
          id: nonEmpty,
          x: z.number(),
          y: z.number(),
          w: z.number().positive().default(240),
          h: z.number().positive().default(88),
          label: nonEmpty,
          sub: nonEmpty.optional(),
          highlight: z.boolean().default(false),
        }),
      )
      .min(2),
    edges: z.array(
      z.object({
        from: nonEmpty,
        to: nonEmpty,
        points: z.array(point).min(2),
        label: nonEmpty.optional(),
        labelAt: point.optional(),
        labelAnchor: z.enum(['start', 'middle', 'end']).default('middle'),
      }),
    ),
    markers: z
      .array(z.object({ n: z.number().int().positive(), x: z.number(), y: z.number() }))
      .default([]),
  })
  .superRefine((d, ctx) => {
    const ids = new Set(d.nodes.map((n) => n.id));
    d.edges.forEach((e, i) => {
      for (const end of [e.from, e.to]) {
        if (!ids.has(end)) {
          ctx.addIssue({ code: 'custom', path: ['edges', i], message: `Unknown node "${end}"` });
        }
      }
      if (e.label && !e.labelAt) {
        ctx.addIssue({
          code: 'custom',
          path: ['edges', i],
          message: 'An edge label needs `labelAt`.',
        });
      }
    });
  });

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/case-studies' }),
  schema: z
    .object({
      lang,
      key: nonEmpty,
      order: z.number().int().positive(),
      featured: z.boolean().default(false),
      kicker: nonEmpty,
      title: nonEmpty,
      summary: nonEmpty,
      facts: z.object({
        role: nonEmpty,
        company: nonEmpty,
        stack: z.array(nonEmpty).min(1),
        scope: z.array(nonEmpty).min(1),
        observability: z.array(nonEmpty).optional(),
      }),
      problem: nonEmpty,
      myRole: nonEmpty,
      diagram: diagramSchema,
      decisions: z
        .array(
          z.object({
            title: nonEmpty,
            text: nonEmpty,
            marker: z.number().int().positive().optional(),
          }),
        )
        .min(2),
      results: z
        .array(z.object({ value: nonEmpty, label: nonEmpty }))
        .min(1)
        .max(4),
    })
    .superRefine((cs, ctx) => {
      const markers = new Set(cs.diagram.markers.map((m) => m.n));
      cs.decisions.forEach((d, i) => {
        if (d.marker !== undefined && !markers.has(d.marker)) {
          ctx.addIssue({
            code: 'custom',
            path: ['decisions', i, 'marker'],
            message: `Decision points to marker ${d.marker}, which is not on the diagram.`,
          });
        }
      });
    }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    lang,
    key: nonEmpty,
    order: z.number().int().positive(),
    icon: z.enum(['api', 'payments', 'store', 'integration', 'performance', 'rocket']),
    title: nonEmpty,
    summary: nonEmpty,
    deliverables: z.array(nonEmpty).min(3),
  }),
});

const skills = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/skills' }),
  schema: z.object({
    lang,
    key: nonEmpty,
    order: z.number().int().positive(),
    level: z.enum(['strong', 'working']),
    title: nonEmpty,
    items: z.array(nonEmpty).min(1),
  }),
});

export const collections = { profile, experience, caseStudies, services, skills };
