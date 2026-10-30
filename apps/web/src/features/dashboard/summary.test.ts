import { describe, expect, it } from 'vitest';
import type { CategoryView } from '@/features/transactions/types';
import { summarize } from './summary';

const food: CategoryView = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Makan & minum',
  kind: 'expense',
  colorFrom: '#9a3b20',
  colorTo: '#5e1f0f',
};
const salary: CategoryView = {
  id: '00000000-0000-4000-8000-000000000002',
  name: 'Gaji',
  kind: 'income',
  colorFrom: '#0b6b5a',
  colorTo: '#063f36',
};

describe('summarize', () => {
  const range = { from: '2026-10-01', to: '2026-10-03' };

  it('totals money in and out and buckets spending per Jakarta day', () => {
    const summary = summarize(
      [
        {
          direction: 'out',
          amount: 28000,
          occurredAt: '2026-09-30T17:30:00Z',
          categoryId: food.id,
        },
        {
          direction: 'out',
          amount: 12000,
          occurredAt: '2026-10-01T05:00:00Z',
          categoryId: food.id,
        },
        {
          direction: 'in',
          amount: 8500000,
          occurredAt: '2026-10-02T02:00:00Z',
          categoryId: salary.id,
        },
        { direction: 'out', amount: 5000, occurredAt: '2026-10-03T02:00:00Z', categoryId: null },
      ],
      [food, salary],
      range,
    );

    expect(summary.totalIn).toBe(8500000);
    expect(summary.totalOut).toBe(45000);
    expect(summary.net).toBe(8455000);
    expect(summary.buckets.map((bucket) => bucket.out)).toEqual([40000, 0, 5000]);
    expect(summary.categories.map((category) => [category.name, category.activeDays])).toEqual([
      ['Gaji', 1],
      ['Makan & minum', 1],
      ['Tanpa kategori', 1],
    ]);
  });

  it('switches to weekly buckets for long ranges', () => {
    const summary = summarize([], [], { from: '2026-01-01', to: '2026-04-30' });
    expect(summary.buckets).toHaveLength(18);
    expect(summary.buckets.at(-1)).toEqual({ from: '2026-04-30', to: '2026-04-30', out: 0 });
  });
});
