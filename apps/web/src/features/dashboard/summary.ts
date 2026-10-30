import { addDays, dayOf, daysBetween, type IsoDay } from '@arus/core';
import type { DayRange } from '@/lib/date-range';
import { UNCATEGORIZED } from '@/features/transactions/filters';
import { UNCATEGORIZED_LABEL } from '@/features/transactions/labels';
import type { SummaryRow } from '@/features/transactions/queries';
import type { CategoryView } from '@/features/transactions/types';

export interface SpendBucket {
  from: IsoDay;
  to: IsoDay;
  out: number;
}

export interface CategoryTotal {
  id: string;
  name: string;
  colorFrom: string;
  colorTo: string;
  totalIn: number;
  totalOut: number;
  activeDays: number;
}

export interface Summary {
  totalIn: number;
  totalOut: number;
  net: number;
  buckets: SpendBucket[];
  categories: CategoryTotal[];
}

const DAILY_LIMIT = 62;
const UNCATEGORIZED_COLORS = { colorFrom: '#3a403e', colorTo: '#1c201f' };

function emptyBuckets(range: DayRange): SpendBucket[] {
  const days = daysBetween(range.from, range.to) + 1;
  const width = days > DAILY_LIMIT ? 7 : 1;
  const buckets: SpendBucket[] = [];
  for (let offset = 0; offset < days; offset += width) {
    const from = addDays(range.from, offset);
    const end = addDays(from, width - 1);
    buckets.push({ from, to: end < range.to ? end : range.to, out: 0 });
  }
  return buckets;
}

export function summarize(
  rows: SummaryRow[],
  categories: CategoryView[],
  range: DayRange,
): Summary {
  const buckets = emptyBuckets(range);
  const width = daysBetween(buckets[0]!.from, buckets[0]!.to) + 1;
  const byId = new Map(categories.map((category) => [category.id, category]));
  const totals = new Map<string, CategoryTotal & { days: Set<IsoDay> }>();
  let totalIn = 0;
  let totalOut = 0;

  for (const row of rows) {
    const day = dayOf(row.occurredAt);
    if (row.direction === 'in') totalIn += row.amount;
    else {
      totalOut += row.amount;
      const bucket = buckets[Math.floor(daysBetween(range.from, day) / width)];
      if (bucket) bucket.out += row.amount;
    }

    const category = row.categoryId ? byId.get(row.categoryId) : undefined;
    const key = category?.id ?? UNCATEGORIZED;
    let total = totals.get(key);
    if (!total) {
      total = {
        id: key,
        name: category?.name ?? UNCATEGORIZED_LABEL,
        colorFrom: category?.colorFrom ?? UNCATEGORIZED_COLORS.colorFrom,
        colorTo: category?.colorTo ?? UNCATEGORIZED_COLORS.colorTo,
        totalIn: 0,
        totalOut: 0,
        activeDays: 0,
        days: new Set(),
      };
      totals.set(key, total);
    }
    if (row.direction === 'in') total.totalIn += row.amount;
    else total.totalOut += row.amount;
    total.days.add(day);
  }

  const categoryTotals = [...totals.values()]
    .map(({ days, ...total }) => ({ ...total, activeDays: days.size }))
    .sort((a, b) => b.totalIn + b.totalOut - (a.totalIn + a.totalOut));

  return { totalIn, totalOut, net: totalIn - totalOut, buckets, categories: categoryTotals };
}
