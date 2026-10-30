import type { Metadata } from 'next';
import Link from 'next/link';
import { dayOf, formatLongDate, formatRange } from '@arus/core';
import { RangeControl } from '@/components/RangeControl';
import { Icon } from '@/components/ui/Icon';
import { BalanceCard } from '@/features/dashboard/components/BalanceCard';
import { CategoryCards } from '@/features/dashboard/components/CategoryCards';
import { ReviewBanner } from '@/features/dashboard/components/ReviewBanner';
import { SourcesCard } from '@/features/dashboard/components/SourcesCard';
import { summarize } from '@/features/dashboard/summary';
import { getDisplayName } from '@/features/profile/queries';
import { TransactionRow } from '@/features/transactions/components/TransactionRow';
import {
  countNeedsReview,
  latestCaptures,
  listCategories,
  listSummaryRows,
  listTransactions,
} from '@/features/transactions/queries';
import { parseRange, writeRange } from '@/lib/date-range';
import type { SearchParams } from '@/lib/search-params';

export const metadata: Metadata = { title: 'Beranda' };

const RECENT_LIMIT = 5;

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const today = dayOf(new Date());
  const range = parseRange(await searchParams, today);
  const [displayName, rows, categories, recent, reviewCount, activity] = await Promise.all([
    getDisplayName(),
    listSummaryRows(range),
    listCategories(),
    listTransactions(range, {}, RECENT_LIMIT),
    countNeedsReview(),
    latestCaptures(),
  ]);

  const summary = summarize(rows, categories, range);
  const rangeQuery = writeRange(new URLSearchParams(), range, today).toString();
  const rangeLabel = formatRange(range.from, range.to);
  const name = displayName || 'kamu';

  return (
    <>
      <header className="page-head">
        <div className="page-head__text ar-mob-full">
          <p className="page-head__eyebrow">{formatLongDate(today)}</p>
          <h1 className="ar-title">Halo, {name}</h1>
        </div>
        <Link
          href="/pengaturan/keamanan"
          className="page-head__avatar ar-glass ar-mob-show"
          aria-label="Pengaturan akun"
        >
          {name.charAt(0).toUpperCase()}
        </Link>
        <RangeControl range={range} today={today} />
        <Link href="/transaksi/tambah" className="ar-btn ar-btn--primary">
          <Icon name="plus" />
          Tambah transaksi
        </Link>
      </header>

      {reviewCount > 0 && <ReviewBanner count={reviewCount} />}

      <div className="row">
        <BalanceCard
          key={rangeLabel}
          rangeLabel={rangeLabel}
          totalIn={summary.totalIn}
          totalOut={summary.totalOut}
          buckets={summary.buckets}
        />
        <section className="ar-card cards-panel">
          <div className="panel-head">
            <h2 className="ar-heading">Kartu kategori</h2>
            <span className="ar-hint">Ketuk untuk lihat transaksi, geser untuk ganti</span>
          </div>
          <CategoryCards key={rangeQuery} categories={summary.categories} rangeQuery={rangeQuery} />
        </section>
      </div>

      <div className="row row--top">
        <section className="ar-card panel--list row__wide">
          <div className="panel-head">
            <h2 className="ar-heading">Transaksi terbaru</h2>
            <Link href={rangeQuery ? `/transaksi?${rangeQuery}` : '/transaksi'}>Lihat semua</Link>
          </div>
          {recent.items.length === 0 ? (
            <div className="empty">
              <div className="empty__title">Belum ada transaksi di rentang ini</div>
              <p className="ar-hint">
                Catat transaksi tunai lewat Tambah transaksi, atau hubungkan email bank supaya
                tercatat sendiri.
              </p>
            </div>
          ) : (
            recent.items.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                today={today}
                compact
              />
            ))
          )}
        </section>
        <SourcesCard activity={activity} today={today} />
      </div>
    </>
  );
}
