'use client';

import { useId, useState, useTransition } from 'react';
import { formatRupiah, type IsoDay } from '@arus/core';
import { Icon } from '@/components/ui/Icon';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { changeTransactionCategory, deleteTransaction } from '../actions';
import {
  CHANNEL_LABEL,
  categoryOptions,
  fitsDirection,
  providerName,
  transactionTitle,
  whenLabel,
} from '../labels';
import type { CategoryView, TransactionView } from '../types';

interface TransactionRowProps {
  transaction: TransactionView;
  today: IsoDay;
  categories?: CategoryView[];
  compact?: boolean;
}

function metaLine(transaction: TransactionView, today: IsoDay, compact: boolean) {
  return [whenLabel(transaction, today, compact), providerName(transaction.providerId)]
    .filter(Boolean)
    .join(' · ');
}

export function TransactionRow({
  transaction,
  today,
  categories,
  compact = false,
}: TransactionRowProps) {
  const detailId = useId();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const manageable = Boolean(categories);
  const raw = transaction.raw ?? transaction.note;
  const hasDetail = Boolean(raw) || manageable;
  const fitting = (categories ?? []).filter((category) =>
    fitsDirection(category.kind, transaction.direction),
  );

  const run = (action: () => Promise<{ ok: true } | { ok: false; message: string }>) =>
    startTransition(async () => {
      const result = await action();
      setError(result.ok ? null : result.message);
      setConfirming(false);
    });

  return (
    <div className={`ar-tx ar-tx--${transaction.direction}`} data-open={open}>
      <button
        type="button"
        className="ar-tx__head"
        aria-expanded={hasDetail ? open : undefined}
        aria-controls={hasDetail ? detailId : undefined}
        disabled={!hasDetail}
        onClick={() => setOpen(!open)}
      >
        <span className="ar-tx__avatar">
          <Icon name={transaction.direction === 'in' ? 'flowIn' : 'flowOut'} />
        </span>
        <span className="ar-tx__main">
          <span className="ar-tx__title">{transactionTitle(transaction)}</span>
          <span className="ar-tx__meta">
            {metaLine(transaction, today, compact)}
            <span className="ar-badge">{CHANNEL_LABEL[transaction.channel]}</span>
            {!compact && transaction.category && (
              <span className="ar-badge">{transaction.category.name}</span>
            )}
            {transaction.needsReview && (
              <span className="ar-badge ar-badge--warn">
                <span className="ar-badge__dot" />
                Perlu dicek
              </span>
            )}
          </span>
        </span>
        <span className="ar-tx__amount">
          {formatRupiah(transaction.amount, transaction.direction)}
        </span>
      </button>
      {hasDetail && (
        <div className="ar-tx__detail" id={detailId} inert={!open}>
          <div>
            <div className="ar-tx__body">
              <div className="ar-tx__raw">{raw ?? 'Dicatat manual, tanpa teks notifikasi.'}</div>
              {manageable && (
                <div className="ar-tx__actions">
                  <SearchSelect
                    label="Kategori"
                    placeholder="Cari kategori"
                    emptyLabel="Tanpa kategori"
                    options={categoryOptions(fitting)}
                    value={transaction.category ? [transaction.category.id] : []}
                    onChange={([categoryId]) =>
                      run(() => changeTransactionCategory(transaction.id, categoryId ?? null))
                    }
                  />
                  {confirming ? (
                    <>
                      <button
                        type="button"
                        className="ar-btn ar-btn--sm ar-btn--danger"
                        disabled={pending}
                        onClick={() => run(() => deleteTransaction(transaction.id))}
                      >
                        {pending ? 'Menghapus…' : 'Ya, hapus'}
                      </button>
                      <button
                        type="button"
                        className="ar-btn ar-btn--sm ar-btn--ghost"
                        onClick={() => setConfirming(false)}
                      >
                        Batal
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="ar-btn ar-btn--sm ar-btn--ghost"
                      disabled={pending}
                      onClick={() => setConfirming(true)}
                    >
                      Hapus
                    </button>
                  )}
                </div>
              )}
              {error && (
                <p className="ar-hint" role="alert" style={{ color: 'var(--flow-out)' }}>
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
