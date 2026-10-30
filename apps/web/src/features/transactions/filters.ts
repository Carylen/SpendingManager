import { PROVIDERS, type ProviderId } from '@arus/core';
import { firstParam, listParam, type SearchParams } from '@/lib/search-params';

export type DirectionFilter = 'all' | 'in' | 'out';

export const UNCATEGORIZED = 'tanpa';

export interface TransactionFilters {
  direction: DirectionFilter;
  query: string;
  providers: ProviderId[];
  categories: string[];
  fromCard: boolean;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DIRECTION_PARAM: Record<string, DirectionFilter> = { masuk: 'in', keluar: 'out' };
const PROVIDER_IDS = new Set<string>(PROVIDERS.map((provider) => provider.id));

export const isCategoryToken = (value: string) => value === UNCATEGORIZED || UUID.test(value);

export function parseFilters(params: SearchParams): TransactionFilters {
  return {
    direction: DIRECTION_PARAM[firstParam(params.arah) ?? ''] ?? 'all',
    query: (firstParam(params.cari) ?? '').trim().slice(0, 80),
    providers: listParam(params.sumber).filter((id): id is ProviderId => PROVIDER_IDS.has(id)),
    categories: listParam(params.kategori).filter(isCategoryToken),
    fromCard: firstParam(params.asal) === 'kartu',
  };
}

export function writeFilters(
  params: URLSearchParams,
  filters: Partial<TransactionFilters>,
): URLSearchParams {
  const next = new URLSearchParams(params);
  const put = (key: string, value: string) => (value ? next.set(key, value) : next.delete(key));

  if (filters.direction !== undefined) {
    put('arah', filters.direction === 'in' ? 'masuk' : filters.direction === 'out' ? 'keluar' : '');
  }
  if (filters.query !== undefined) put('cari', filters.query.trim());
  if (filters.providers !== undefined) put('sumber', filters.providers.join(','));
  if (filters.categories !== undefined) put('kategori', filters.categories.join(','));
  if (filters.fromCard !== undefined) put('asal', filters.fromCard ? 'kartu' : '');
  return next;
}

export const hasActiveFilters = (filters: TransactionFilters) =>
  filters.direction !== 'all' ||
  filters.query !== '' ||
  filters.providers.length > 0 ||
  filters.categories.length > 0;

/** Escapes LIKE wildcards so a search for "50%" matches the literal text. */
export const likePattern = (query: string) =>
  `%${query.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
