import { describe, expect, it } from 'vitest';
import { groupByDay, totalsOf } from './grouping';
import type { TransactionView } from './types';

const transaction = (id: string, direction: 'in' | 'out', amount: number, occurredAt: string) =>
  ({
    id,
    direction,
    amount,
    occurredAt,
    merchant: null,
    note: null,
    channel: 'manual',
    needsReview: false,
    timeKnown: true,
    category: null,
    providerId: null,
    raw: null,
  }) satisfies TransactionView;

describe('groupByDay', () => {
  const items = [
    transaction('a', 'out', 28000, '2026-10-27T02:12:00Z'),
    transaction('b', 'in', 750000, '2026-10-26T11:40:00Z'),
    transaction('c', 'out', 45000, '2026-10-26T05:20:00Z'),
    transaction('d', 'out', 312000, '2026-10-24T17:10:00Z'),
  ];

  it('groups newest-first rows by Jakarta day with a net per day', () => {
    const groups = groupByDay(items, '2026-10-27');
    expect(groups.map((group) => [group.heading, group.net, group.items.length])).toEqual([
      ['Hari ini, 27 Okt', -28000, 1],
      ['Kemarin, 26 Okt', 705000, 2],
      ['Minggu, 25 Okt', -312000, 1],
    ]);
  });

  it('totals both directions', () => {
    expect(totalsOf(items)).toEqual({ totalIn: 750000, totalOut: 385000 });
  });
});
