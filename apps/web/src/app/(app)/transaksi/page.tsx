import type { Metadata } from 'next';
import Link from 'next/link';
import { dayOf, formatRange, formatRupiah } from '@arus/core';
import { RangeControl } from '@/components/RangeControl';
import { Icon } from '@/components/ui/Icon';
import { TransactionFilters } from '@/features/transactions/components/TransactionFilters';
import { TransactionRow } from '@/features/transactions/components/TransactionRow';
import { hasActiveFilters, parseFilters } from '@/features/transactions/filters';
import { groupByDay, totalsOf } from '@/features/transactions/grouping';
import { listCategories, listTransactions } from '@/features/transactions/queries';
import { parseRange, writeRange } from '@/lib/date-range';
import type { SearchParams } from '@/lib/search-params';

export const metadata: Metadata = { title: 'Transaksi' };

const PAGE_LIMIT = 500;

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const today = dayOf(new Date());
  const range = parseRange(params, today);
  const filters = parseFilters(params);
  const [list, categories] = await Promise.all([
    listTransactions(range, filters, PAGE_LIMIT),
    listCategories(),
  ]);

  const groups = groupByDay(list.items, today);
  const totals = totalsOf(list.items);
  const rangeQuery = writeRange(new URLSearchParams(), range, today).toString();
  const cardCategory =
    filters.fromCard && filters.categories.length === 1
      ? (categories.find((category) => category.id === filters.categories[0])?.name ??
        'Tanpa kategori')
      : null;

  return (
    <>
      <header className="page-head">
        <div className="page-head__text ar-mob-full">
          <h1 className="ar-title">Transaksi</h1>
          <p className="page-head__lead">{formatRange(range.from, range.to)}</p>
        </div>
        <RangeControl range={range} today={today} />
        <Link href="/transaksi/tambah" className="ar-btn ar-btn--primary ar-btn--sm">
          <Icon name="plus" />
          Tambah
        </Link>
      </header>

      <TransactionFilters filters={filters} categories={categories} />

      {cardCategory && (
        <div className="from-card ar-glass">
          <Icon name="card" />
          <span className="from-card__text">
            Dari kartu <b>{cardCategory}</b> di Beranda
          </span>
          <Link
            href={rangeQuery ? `/beranda?${rangeQuery}` : '/beranda'}
            className="ar-btn ar-btn--sm ar-btn--ghost"
          >
            Kembali
          </Link>
        </div>
      )}

      <div className="stats">
        <div className="ar-split__item">
          <div className="ar-hint">Ditampilkan</div>
          <div className="ar-split__val">{list.items.length} transaksi</div>
        </div>
        <div className="ar-split__item">
          <div className="ar-hint">Masuk</div>
          <div className="ar-split__val" style={{ color: 'var(--flow-in)' }}>
            {formatRupiah(totals.totalIn, 'in')}
          </div>
        </div>
        <div className="ar-split__item">
          <div className="ar-hint">Keluar</div>
          <div className="ar-split__val" style={{ color: 'var(--flow-out)' }}>
            {formatRupiah(totals.totalOut, 'out')}
          </div>
        </div>
      </div>

      <section className="ar-card panel--groups">
        {groups.length === 0 ? (
          <div className="empty">
            <div className="empty__title">
              {hasActiveFilters(filters) ? 'Tidak ada transaksi yang cocok' : 'Belum ada transaksi'}
            </div>
            <p className="ar-hint">
              {hasActiveFilters(filters)
                ? 'Coba ubah rentang tanggal, hapus filter kategori, atau kata kunci pencarian.'
                : 'Transaksi dari email, SMS, impor, atau catatan manual akan muncul di sini.'}
            </p>
            {hasActiveFilters(filters) && (
              <Link
                href={rangeQuery ? `/transaksi?${rangeQuery}` : '/transaksi'}
                className="ar-btn ar-btn--sm"
              >
                Hapus semua filter
              </Link>
            )}
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.day} className="day-group">
              <div className="day-group__head">
                <span>{group.heading}</span>
                <span className="ar-num">
                  {formatRupiah(group.net, group.net >= 0 ? 'in' : 'out')}
                </span>
              </div>
              {group.items.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  today={today}
                  categories={categories}
                />
              ))}
            </div>
          ))
        )}
        {list.truncated && (
          <p className="ar-hint day-group__more">
            Menampilkan {PAGE_LIMIT} transaksi terbaru. Persempit rentang tanggal untuk melihat yang
            lebih lama.
          </p>
        )}
      </section>
    </>
  );
}
