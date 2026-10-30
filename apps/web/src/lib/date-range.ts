import {
  addDays,
  addMonths,
  daysBetween,
  endOfMonth,
  isIsoDay,
  startOfMonth,
  type IsoDay,
} from '@arus/core';
import { firstParam, type SearchParams } from './search-params';

export interface DayRange {
  from: IsoDay;
  to: IsoDay;
}

export interface RangePreset {
  label: string;
  range: DayRange;
}

export const MAX_RANGE_DAYS = 366;

export const defaultRange = (today: IsoDay): DayRange => ({ from: startOfMonth(today), to: today });

export function parseRange(params: SearchParams, today: IsoDay): DayRange {
  const fallback = defaultRange(today);
  const fromParam = firstParam(params.dari);
  const toParam = firstParam(params.sampai);
  const to = isIsoDay(toParam) && toParam <= today ? toParam : fallback.to;
  const from =
    isIsoDay(fromParam) && fromParam <= to ? fromParam : fallback.from <= to ? fallback.from : to;
  return daysBetween(from, to) >= MAX_RANGE_DAYS
    ? { from: addDays(to, 1 - MAX_RANGE_DAYS), to }
    : { from, to };
}

export function writeRange(
  params: URLSearchParams,
  range: DayRange,
  today: IsoDay,
): URLSearchParams {
  const next = new URLSearchParams(params);
  const fallback = defaultRange(today);
  if (range.from === fallback.from && range.to === fallback.to) {
    next.delete('dari');
    next.delete('sampai');
  } else {
    next.set('dari', range.from);
    next.set('sampai', range.to);
  }
  return next;
}

export const sameRange = (a: DayRange, b: DayRange) => a.from === b.from && a.to === b.to;

export function rangePresets(today: IsoDay): RangePreset[] {
  const lastMonth = addMonths(today, -1);
  return [
    { label: 'Bulan ini', range: defaultRange(today) },
    { label: 'Hari ini', range: { from: today, to: today } },
    { label: '7 hari terakhir', range: { from: addDays(today, -6), to: today } },
    { label: '30 hari terakhir', range: { from: addDays(today, -29), to: today } },
    { label: 'Bulan lalu', range: { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) } },
  ];
}

export function dayPresets(today: IsoDay): RangePreset[] {
  return [
    { label: 'Hari ini', range: { from: today, to: today } },
    { label: 'Kemarin', range: { from: addDays(today, -1), to: addDays(today, -1) } },
    { label: '2 hari lalu', range: { from: addDays(today, -2), to: addDays(today, -2) } },
  ];
}
