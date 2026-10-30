'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { SearchSelect, type SelectOption } from '@/components/ui/SearchSelect';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import {
  UNCATEGORIZED,
  hasActiveFilters,
  writeFilters,
  type DirectionFilter,
  type TransactionFilters as Filters,
} from '../filters';
import { UNCATEGORIZED_LABEL, categoryOptions, providerOptions } from '../labels';
import type { CategoryView } from '../types';

const DIRECTIONS = [
  { value: 'all', label: 'Semua' },
  { value: 'in', label: 'Masuk' },
  { value: 'out', label: 'Keluar' },
] as const satisfies ReadonlyArray<{ value: DirectionFilter; label: string }>;

const SEARCH_DELAY_MS = 300;

interface TransactionFiltersProps {
  filters: Filters;
  categories: CategoryView[];
}

export function TransactionFilters({ filters, categories }: TransactionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(filters.query);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => setQuery(filters.query), [filters.query]);
  useEffect(() => () => clearTimeout(searchTimer.current), []);

  const apply = (change: Partial<Filters>) => {
    const next = writeFilters(new URLSearchParams(searchParams), change).toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const categoryChoices: SelectOption[] = [
    ...categoryOptions(categories),
    { value: UNCATEGORIZED, label: UNCATEGORIZED_LABEL, group: 'Lainnya' },
  ];

  return (
    <>
      <div className="toolbar">
        <SegmentedControl
          label="Filter arah"
          options={DIRECTIONS}
          value={filters.direction}
          onChange={(direction) => apply({ direction })}
        />
        <label className="ar-input ar-input--pill toolbar__search">
          <Icon name="search" />
          <input
            className="ar-input__control"
            type="search"
            placeholder="Cari merchant atau nama"
            aria-label="Cari transaksi"
            value={query}
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              clearTimeout(searchTimer.current);
              searchTimer.current = setTimeout(() => apply({ query: value }), SEARCH_DELAY_MS);
            }}
          />
        </label>
      </div>
      <div className="toolbar toolbar--filters">
        <SearchSelect
          label="Sumber"
          placeholder="Cari bank atau e-wallet"
          emptyLabel="Semua sumber"
          options={providerOptions(true)}
          value={filters.providers}
          onChange={(providers) => apply({ providers: providers as Filters['providers'] })}
          multi
        />
        <SearchSelect
          label="Kategori"
          placeholder="Cari kategori"
          emptyLabel="Semua kategori"
          options={categoryChoices}
          value={filters.categories}
          onChange={(selected) => apply({ categories: selected, fromCard: false })}
          multi
        />
        {hasActiveFilters(filters) && (
          <button
            type="button"
            className="ar-btn ar-btn--sm ar-btn--ghost"
            onClick={() => {
              clearTimeout(searchTimer.current);
              setQuery('');
              apply({
                direction: 'all',
                query: '',
                providers: [],
                categories: [],
                fromCard: false,
              });
            }}
          >
            Hapus filter
          </button>
        )}
      </div>
    </>
  );
}
