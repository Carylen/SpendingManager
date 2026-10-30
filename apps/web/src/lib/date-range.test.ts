import { describe, expect, it } from 'vitest';
import { parseFilters, writeFilters, likePattern } from '@/features/transactions/filters';
import { parseRange, rangePresets, writeRange } from './date-range';

const today = '2026-10-27';

describe('parseRange', () => {
  it('defaults to the first of this month until today', () => {
    expect(parseRange({}, today)).toEqual({ from: '2026-10-01', to: '2026-10-27' });
  });

  it('rejects future, reversed, and malformed days', () => {
    expect(parseRange({ dari: '2026-10-05', sampai: '2026-11-02' }, today)).toEqual({
      from: '2026-10-05',
      to: '2026-10-27',
    });
    expect(parseRange({ dari: '2026-10-20', sampai: '2026-10-10' }, today)).toEqual({
      from: '2026-10-01',
      to: '2026-10-10',
    });
    expect(parseRange({ dari: 'kemarin' }, today)).toEqual({ from: '2026-10-01', to: today });
  });

  it('caps the span to one year', () => {
    expect(parseRange({ dari: '2020-01-01', sampai: today }, today).from).toBe('2025-10-27');
  });

  it('keeps the default range out of the URL', () => {
    const params = new URLSearchParams('arah=masuk');
    expect(writeRange(params, { from: '2026-10-01', to: today }, today).toString()).toBe(
      'arah=masuk',
    );
    expect(writeRange(params, { from: '2026-09-01', to: '2026-09-30' }, today).toString()).toBe(
      'arah=masuk&dari=2026-09-01&sampai=2026-09-30',
    );
  });

  it('offers the quick ranges from the design system', () => {
    expect(rangePresets(today).map((preset) => preset.label)).toEqual([
      'Bulan ini',
      'Hari ini',
      '7 hari terakhir',
      '30 hari terakhir',
      'Bulan lalu',
    ]);
    expect(rangePresets(today)[4]!.range).toEqual({ from: '2026-09-01', to: '2026-09-30' });
  });
});

describe('transaction filters', () => {
  it('reads only known values from the URL', () => {
    expect(
      parseFilters({
        arah: 'keluar',
        cari: '  kopi ',
        sumber: 'bca,paypal,gopay',
        kategori: 'tanpa,not-a-uuid,00000000-0000-4000-8000-000000000001',
        asal: 'kartu',
      }),
    ).toEqual({
      direction: 'out',
      query: 'kopi',
      providers: ['bca', 'gopay'],
      categories: ['tanpa', '00000000-0000-4000-8000-000000000001'],
      fromCard: true,
    });
  });

  it('writes filters back and drops empty ones', () => {
    const params = writeFilters(new URLSearchParams('cari=kopi&dari=2026-10-01'), {
      direction: 'in',
      query: '',
      providers: ['bca'],
    });
    expect(params.toString()).toBe('dari=2026-10-01&arah=masuk&sumber=bca');
  });

  it('escapes LIKE wildcards', () => {
    expect(likePattern('50%_off')).toBe('%50\\%\\_off%');
  });
});
