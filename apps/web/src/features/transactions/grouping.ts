import { dayHeading, dayOf, type IsoDay } from '@arus/core';
import type { TransactionView } from './types';

export interface DayGroup {
  day: IsoDay;
  heading: string;
  net: number;
  items: TransactionView[];
}

export interface Totals {
  totalIn: number;
  totalOut: number;
}

export function groupByDay(items: TransactionView[], today: IsoDay): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const item of items) {
    const day = dayOf(item.occurredAt);
    let group = groups.at(-1);
    if (group?.day !== day) {
      group = { day, heading: dayHeading(day, today), net: 0, items: [] };
      groups.push(group);
    }
    group.items.push(item);
    group.net += item.direction === 'in' ? item.amount : -item.amount;
  }
  return groups;
}

export const totalsOf = (items: TransactionView[]): Totals =>
  items.reduce(
    (totals, item) =>
      item.direction === 'in'
        ? { ...totals, totalIn: totals.totalIn + item.amount }
        : { ...totals, totalOut: totals.totalOut + item.amount },
    { totalIn: 0, totalOut: 0 },
  );
