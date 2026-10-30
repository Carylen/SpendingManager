import {
  PROVIDERS,
  dayOf,
  daysBetween,
  findProvider,
  formatTime,
  relativeDay,
  type IsoDay,
  type ProviderKind,
} from '@arus/core';
import type { CaptureChannel, CategoryKind } from '@/lib/supabase/database.types';
import type { CategoryView, TransactionView } from './types';

export const CHANNEL_LABEL: Record<CaptureChannel, string> = {
  email: 'Email',
  sms: 'SMS',
  import: 'Impor',
  manual: 'Manual',
};

export const CATEGORY_GROUP: Record<CategoryKind, string> = {
  expense: 'Pengeluaran',
  income: 'Pemasukan',
  transfer: 'Antar akun',
};

const PROVIDER_GROUP: Record<ProviderKind, string> = {
  bank: 'Bank',
  ewallet: 'E-wallet',
  cash: 'Lainnya',
};

export const UNCATEGORIZED_LABEL = 'Tanpa kategori';

export const providerName = (id: string | null) => (id ? (findProvider(id)?.name ?? id) : null);

export const providerOptions = (includeCash: boolean) =>
  PROVIDERS.filter((provider) => includeCash || provider.kind !== 'cash').map((provider) => ({
    value: provider.id,
    label: provider.name,
    group: PROVIDER_GROUP[provider.kind],
  }));

export const categoryOptions = (categories: CategoryView[]) =>
  categories.map((category) => ({
    value: category.id,
    label: category.name,
    group: CATEGORY_GROUP[category.kind],
  }));

export const fitsDirection = (kind: CategoryKind, direction: TransactionView['direction']) =>
  kind === 'transfer' || (kind === 'expense' ? direction === 'out' : direction === 'in');

export const transactionTitle = (
  transaction: Pick<TransactionView, 'merchant' | 'category' | 'direction'>,
) =>
  transaction.merchant ||
  transaction.category?.name ||
  (transaction.direction === 'in' ? 'Uang masuk' : 'Uang keluar');

/** "09.12" in a day group, "Hari ini, 09.12" or "24 Okt" in a flat list; no time when it is unknown. */
export function whenLabel(
  transaction: Pick<TransactionView, 'occurredAt' | 'timeKnown'>,
  today: IsoDay,
  withDay: boolean,
): string {
  const day = dayOf(transaction.occurredAt);
  const time = transaction.timeKnown ? formatTime(transaction.occurredAt) : null;
  if (!withDay) return time ?? '';
  const relative = relativeDay(day, today);
  return time && daysBetween(day, today) <= 1 ? `${relative}, ${time}` : relative;
}
