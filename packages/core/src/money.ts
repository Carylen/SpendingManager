import type { Direction } from './transaction.ts';

export type Rupiah = number;

export const MAX_RUPIAH: Rupiah = 999_999_999_999;

const MINUS_SIGN = '−';

export function formatRupiah(amount: Rupiah, direction?: Direction): string {
  const digits = Math.abs(Math.round(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sign =
    direction === 'in' ? '+' : direction === 'out' ? MINUS_SIGN : amount < 0 ? MINUS_SIGN : '';
  return `${sign}Rp${digits}`;
}

export function parseRupiah(text: string): Rupiah | null {
  const numeric = text.replace(/[^\d.,]/g, '');
  if (!/\d/.test(numeric)) return null;

  const decimalMatch = numeric.match(/[.,](\d{1,2})$/);
  const integerPart = decimalMatch ? numeric.slice(0, -decimalMatch[0].length) : numeric;
  const fraction = decimalMatch ? Number(`0.${decimalMatch[1]}`) : 0;
  const whole = Number(integerPart.replace(/[.,]/g, '') || '0');

  if (!Number.isFinite(whole)) return null;
  return Math.round(whole + fraction);
}
