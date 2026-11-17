/**
 * Pure functions that turn experience entries into what the page shows.
 * Kept free of Astro imports so they can be unit-tested in isolation.
 */
export interface ExperienceStep {
  period: string;
  title: string;
  text: string;
  highlight: boolean;
}

export interface ExperienceItem {
  key: string;
  company: string;
  role: string;
  context: string;
  start: number;
  end: number | 'present';
  stage: { index: number; label: string };
  group?: { key: string; label: string } | undefined;
  summary?: string | undefined;
  steps?: ExperienceStep[] | undefined;
  stack: string[];
}

export type ExperienceBlock =
  | { kind: 'single'; item: ExperienceItem }
  | {
      kind: 'group';
      key: string;
      label: string;
      start: number;
      end: number | 'present';
      stage: ExperienceItem['stage'];
      items: ExperienceItem[];
    };

export interface GrowthStep {
  index: number;
  label: string;
  year: number;
  companies: string[];
  current: boolean;
}

export const isCurrent = (item: Pick<ExperienceItem, 'end'>): boolean => item.end === 'present';

const endValue = (end: ExperienceItem['end']): number =>
  end === 'present' ? Number.POSITIVE_INFINITY : end;

/** Most recent first: by end year, then start year, then company name. */
export function sortExperience<T extends ExperienceItem>(items: readonly T[]): T[] {
  return [...items].sort(
    (a, b) =>
      endValue(b.end) - endValue(a.end) || b.start - a.start || a.company.localeCompare(b.company),
  );
}

/** Merges consecutive entries that share a `group.key` into one block. */
export function groupExperience(sorted: readonly ExperienceItem[]): ExperienceBlock[] {
  const blocks: ExperienceBlock[] = [];
  for (const item of sorted) {
    const last = blocks.at(-1);
    if (item.group && last?.kind === 'group' && last.key === item.group.key) {
      last.items.push(item);
      last.start = Math.min(last.start, item.start);
      if (endValue(item.end) > endValue(last.end)) last.end = item.end;
      continue;
    }
    if (item.group) {
      blocks.push({
        kind: 'group',
        key: item.group.key,
        label: item.group.label,
        start: item.start,
        end: item.end,
        stage: item.stage,
        items: [item],
      });
    } else {
      blocks.push({ kind: 'single', item });
    }
  }
  return blocks;
}

/** One step per career stage, oldest first: the "growth path" strip. */
export function buildGrowthPath(items: readonly ExperienceItem[]): GrowthStep[] {
  const byStage = new Map<number, ExperienceItem[]>();
  for (const item of sortExperience(items)) {
    const list = byStage.get(item.stage.index) ?? [];
    list.push(item);
    byStage.set(item.stage.index, list);
  }
  return [...byStage.entries()]
    .sort(([a], [b]) => a - b)
    .map(([index, list]) => ({
      index,
      label: list[0]?.stage.label ?? '',
      year: Math.min(...list.map((i) => i.start)),
      // Oldest first, so the stage's start year belongs to the first company named.
      companies: [...list].reverse().map((i) => i.company),
      current: list.some(isCurrent),
    }));
}

export interface PeriodLabels {
  /** e.g. "{start} to {end}" */
  range: string;
  /** e.g. "Since {start}" */
  since: string;
}

/** "2021 to 2024", "Since 2026", or "2024" when start and end match. */
export function formatPeriod(
  start: number,
  end: ExperienceItem['end'],
  labels: PeriodLabels,
): string {
  if (end === 'present') return labels.since.replace('{start}', `${start}`);
  if (start === end) return `${start}`;
  return labels.range.replace('{start}', `${start}`).replace('{end}', `${end}`);
}
