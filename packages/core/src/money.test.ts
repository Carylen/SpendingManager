import { describe, expect, it } from 'vitest';
import { formatRupiah, parseRupiah } from './money.ts';

describe('formatRupiah', () => {
  it('groups thousands with dots', () => {
    expect(formatRupiah(1250000)).toBe('Rp1.250.000');
    expect(formatRupiah(0)).toBe('Rp0');
  });

  it('signs by direction with a true minus sign', () => {
    expect(formatRupiah(750000, 'in')).toBe('+Rp750.000');
    expect(formatRupiah(28000, 'out')).toBe('−Rp28.000');
  });
});

describe('parseRupiah', () => {
  it.each([
    ['Rp1.250.000', 1250000],
    ['Rp 150.000,00', 150000],
    ['IDR 1,250,000.00', 1250000],
    ['Rp 28.000', 28000],
    ['Rp50', 50],
    ['Rp 89.500,50', 89501],
  ])('reads %s', (input, expected) => {
    expect(parseRupiah(input)).toBe(expected);
  });

  it('returns null when there is no number', () => {
    expect(parseRupiah('Rp -')).toBeNull();
  });
});
