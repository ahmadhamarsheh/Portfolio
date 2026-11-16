import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '@/i18n';
import {
  buildGrowthPath,
  groupExperience,
  sortExperience,
  type ExperienceItem,
} from './experience';

/**
 * Content queries: the only place that talks to `astro:content`.
 * Components receive plain, already-sorted data.
 */
export type Profile = CollectionEntry<'profile'>['data'];
export type CaseStudy = CollectionEntry<'caseStudies'>['data'];
export type Service = CollectionEntry<'services'>['data'];
export type SkillGroup = CollectionEntry<'skills'>['data'];

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

export async function getProfile(lang: Lang): Promise<Profile> {
  const [entry] = await getCollection('profile', (e) => e.data.lang === lang);
  if (!entry) throw new Error(`Missing profile content for "${lang}".`);
  return entry.data;
}

export async function getExperience(lang: Lang): Promise<ExperienceItem[]> {
  const entries = await getCollection('experience', (e) => e.data.lang === lang);
  return sortExperience(entries.map((e) => e.data));
}

export async function getExperienceView(lang: Lang) {
  const items = await getExperience(lang);
  return { items, blocks: groupExperience(items), growth: buildGrowthPath(items) };
}

export async function getCaseStudies(lang: Lang): Promise<CaseStudy[]> {
  const entries = await getCollection('caseStudies', (e) => e.data.lang === lang);
  return entries.map((e) => e.data).sort(byOrder);
}

export async function getServices(lang: Lang): Promise<Service[]> {
  const entries = await getCollection('services', (e) => e.data.lang === lang);
  return entries.map((e) => e.data).sort(byOrder);
}

export async function getSkills(lang: Lang) {
  const entries = await getCollection('skills', (e) => e.data.lang === lang);
  const groups = entries.map((e) => e.data).sort(byOrder);
  return {
    strong: groups.filter((g) => g.level === 'strong'),
    working: groups.filter((g) => g.level === 'working'),
  };
}
