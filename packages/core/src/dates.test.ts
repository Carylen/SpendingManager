import { describe, expect, it } from 'vitest';
import {
  addDays,
  dayHeading,
  dayOf,
  dayStartInstant,
  eachDay,
  endOfMonth,
  formatLongDate,
  formatRange,
  formatTime,
  instantOn,
  isIsoDay,
  relativeDay,
  weekdayIndex,
} from './dates.ts';

describe('dayOf', () => {
  it('uses the Jakarta calendar day', () => {
    expect(dayOf('2026-10-26T17:30:00Z')).toBe('2026-10-27');
    expect(dayOf('2026-10-26T16:59:59Z')).toBe('2026-10-26');
  });
});

describe('isIsoDay', () => {
  it('accepts real dates only', () => {
    expect(isIsoDay('2026-10-27')).toBe(true);
    expect(isIsoDay('2026-02-30')).toBe(false);
    expect(isIsoDay('27-10-2026')).toBe(false);
    expect(isIsoDay(undefined)).toBe(false);
  });
});

describe('day arithmetic', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(endOfMonth('2028-02-10')).toBe('2028-02-29');
    expect(eachDay('2026-09-29', '2026-10-02')).toEqual([
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
    ]);
  });

  it('converts Jakarta days to UTC instants', () => {
    expect(dayStartInstant('2026-10-27')).toBe('2026-10-26T17:00:00.000Z');
    expect(instantOn('2026-10-27', 12)).toBe('2026-10-27T05:00:00.000Z');
  });
});

describe('formatting', () => {
  it('formats ranges like the design system', () => {
    expect(formatRange('2026-10-01', '2026-10-27')).toBe('1–27 Okt 2026');
    expect(formatRange('2026-09-28', '2026-10-27')).toBe('28 Sep – 27 Okt 2026');
    expect(formatRange('2025-12-28', '2026-01-03')).toBe('28 Des 2025 – 3 Jan 2026');
    expect(formatRange('2026-10-27', '2026-10-27')).toBe('27 Okt 2026');
  });

  it('formats days and times in Indonesian', () => {
    expect(formatLongDate('2026-10-27')).toBe('Selasa, 27 Oktober 2026');
    expect(formatTime('2026-10-27T02:12:00Z')).toBe('09.12');
    expect(relativeDay('2026-10-27', '2026-10-27')).toBe('Hari ini');
    expect(relativeDay('2026-10-26', '2026-10-27')).toBe('Kemarin');
    expect(relativeDay('2026-10-24', '2026-10-27')).toBe('24 Okt');
    expect(dayHeading('2026-10-25', '2026-10-27')).toBe('Minggu, 25 Okt');
    expect(weekdayIndex('2026-10-26')).toBe(0);
  });
});
