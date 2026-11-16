import { describe, expect, it } from 'vitest';
import {
  buildGrowthPath,
  formatPeriod,
  groupExperience,
  sortExperience,
  type ExperienceItem,
} from '@/lib/experience';

const item = (
  overrides: Partial<ExperienceItem> & Pick<ExperienceItem, 'key' | 'start' | 'end'>,
): ExperienceItem => ({
  company: overrides.key,
  role: 'Engineer',
  context: 'Remote',
  stage: { index: 1, label: 'Stage' },
  stack: ['Java'],
  summary: 'Did things',
  ...overrides,
});

const items = [
  item({
    key: 'finprivado',
    start: 2021,
    end: 2022,
    stage: { index: 1, label: 'Foundations' },
    group: { key: 'g', label: 'Remote' },
  }),
  item({ key: 'jawwal', start: 2024, end: 2025, stage: { index: 2, label: 'Scale' } }),
  item({ key: 'apple', start: 2026, end: 'present', stage: { index: 4, label: 'Platforms' } }),
  item({
    key: 'road9',
    start: 2022,
    end: 2024,
    stage: { index: 1, label: 'Foundations' },
    group: { key: 'g', label: 'Remote' },
  }),
  item({ key: 'logestechs', start: 2025, end: 2026, stage: { index: 3, label: 'Resilience' } }),
];

describe('sortExperience', () => {
  it('puts current roles first, then by end and start year', () => {
    expect(sortExperience(items).map((i) => i.key)).toEqual([
      'apple',
      'logestechs',
      'jawwal',
      'road9',
      'finprivado',
    ]);
  });
});

describe('groupExperience', () => {
  it('merges consecutive entries of the same group with the combined period', () => {
    const blocks = groupExperience(sortExperience(items));
    expect(
      blocks.map((b) =>
        b.kind === 'group' ? `group:${b.items.map((i) => i.key).join('+')}` : b.item.key,
      ),
    ).toEqual(['apple', 'logestechs', 'jawwal', 'group:road9+finprivado']);
    const group = blocks.at(-1);
    expect(group?.kind === 'group' && [group.start, group.end]).toEqual([2021, 2024]);
  });
});

describe('buildGrowthPath', () => {
  it('returns one step per stage, oldest first, flagging the current one', () => {
    expect(buildGrowthPath(items)).toEqual([
      {
        index: 1,
        label: 'Foundations',
        year: 2021,
        companies: ['finprivado', 'road9'],
        current: false,
      },
      { index: 2, label: 'Scale', year: 2024, companies: ['jawwal'], current: false },
      { index: 3, label: 'Resilience', year: 2025, companies: ['logestechs'], current: false },
      { index: 4, label: 'Platforms', year: 2026, companies: ['apple'], current: true },
    ]);
  });
});

describe('formatPeriod', () => {
  it('formats ranges, open-ended roles and single years', () => {
    expect(formatPeriod(2021, 2024, 'Present')).toBe('2021 – 2024');
    expect(formatPeriod(2026, 'present', 'Present')).toBe('2026 – Present');
    expect(formatPeriod(2024, 2024, 'Present')).toBe('2024');
  });
});
