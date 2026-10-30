'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useRef, useState } from 'react';
import {
  formatDay,
  formatRupiah,
  MAX_RUPIAH,
  relativeDay,
  startOfMonth,
  type IsoDay,
  type ProviderId,
} from '@arus/core';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { Icon } from '@/components/ui/Icon';
import { SearchSelect } from '@/components/ui/SearchSelect';
import { Toast } from '@/components/ui/Toast';
import { saveTransaction, type SaveTransactionState } from '../actions';
import { categoryOptions, fitsDirection, providerName, providerOptions } from '../labels';
import type { CategoryView } from '../types';

type Direction = 'in' | 'out';

const FALLBACK_COLORS: Record<Direction, [string, string]> = {
  out: ['#7a3a2a', '#4a2017'],
  in: ['#0b6b5a', '#063f36'],
};
const MAX_DIGITS = String(MAX_RUPIAH).length;

const groupDigits = (digits: string) => (digits ? formatRupiah(Number(digits)).slice(2) : '');

const listHrefFor = (day: IsoDay, today: IsoDay) =>
  day < startOfMonth(today) ? `/transaksi?dari=${day}&sampai=${today}` : '/transaksi';

interface TransactionFormProps {
  categories: CategoryView[];
  today: IsoDay;
}

export function TransactionForm({ categories, today }: TransactionFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<SaveTransactionState, FormData>(
    saveTransaction,
    {
      status: 'idle',
    },
  );
  const [direction, setDirection] = useState<Direction>('out');
  const [digits, setDigits] = useState('');
  const [merchant, setMerchant] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<ProviderId>('cash');
  const [day, setDay] = useState(today);
  const [note, setNote] = useState('');
  const [missingAmount, setMissingAmount] = useState(false);
  const [toast, setToast] = useState<{ key: number; text: string; href: string } | null>(null);
  const intent = useRef<'done' | 'again'>('done');
  const amountRef = useRef<HTMLInputElement>(null);

  const fitting = categories.filter((category) => fitsDirection(category.kind, direction));
  const category = fitting.find((item) => item.id === categoryId) ?? null;
  const amount = Number(digits || 0);
  const signed = formatRupiah(amount, direction);
  const [colorFrom, colorTo] = category
    ? [category.colorFrom, category.colorTo]
    : FALLBACK_COLORS[direction];
  const errors = state.status === 'invalid' ? state.errors : {};
  const amountError = missingAmount ? 'Isi nominal dulu sebelum menyimpan.' : errors.amount;
  const dayLabel = relativeDay(day, today);

  useEffect(() => {
    if (state.status !== 'saved') return;
    const href = listHrefFor(state.day, today);
    if (intent.current === 'done') {
      router.push(href);
      return;
    }
    setToast({ key: state.savedAt, text: `${state.summary} · ${formatDay(state.day)}`, href });
    setDigits('');
    setMerchant('');
    setCategoryId(null);
    setNote('');
    amountRef.current?.focus();
  }, [state, router, today]);

  const changeDirection = (next: Direction) => {
    setDirection(next);
    if (category && !fitsDirection(category.kind, next)) setCategoryId(null);
  };

  return (
    <div className="row row--top">
      <form
        className="ar-card form-card row__wide"
        action={formAction}
        onSubmit={(event) => {
          if (amount > 0) return;
          event.preventDefault();
          setMissingAmount(true);
          amountRef.current?.focus();
        }}
      >
        <input type="hidden" name="direction" value={direction} />
        <input type="hidden" name="amount" value={digits} />
        <input type="hidden" name="categoryId" value={category?.id ?? ''} />
        <input type="hidden" name="providerId" value={providerId} />
        <input type="hidden" name="day" value={day} />

        <div className="direction" role="group" aria-label="Arah transaksi">
          <button
            type="button"
            aria-pressed={direction === 'out'}
            data-tone="out"
            onClick={() => changeDirection('out')}
          >
            <Icon name="flowOut" />
            Uang keluar
          </button>
          <button
            type="button"
            aria-pressed={direction === 'in'}
            data-tone="in"
            onClick={() => changeDirection('in')}
          >
            <Icon name="flowIn" />
            Uang masuk
          </button>
        </div>

        <label className={amountError ? 'ar-field ar-field--error' : 'ar-field'}>
          <span className="ar-label">Nominal</span>
          <span className="ar-amount">
            <span className="ar-amount__prefix">Rp</span>
            <input
              ref={amountRef}
              inputMode="numeric"
              placeholder="0"
              autoComplete="off"
              aria-label="Nominal dalam rupiah"
              aria-invalid={amountError ? true : undefined}
              value={groupDigits(digits)}
              onChange={(event) => {
                setDigits(
                  event.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, MAX_DIGITS),
                );
                setMissingAmount(false);
              }}
            />
          </span>
          <span className="ar-hint">
            {amountError ?? 'Ketik angka saja, titik ribuan otomatis.'}
          </span>
        </label>

        <label className="ar-field">
          <span className="ar-label">Merchant atau keterangan</span>
          <span className="ar-input">
            <input
              className="ar-input__control"
              name="merchant"
              maxLength={120}
              placeholder={
                direction === 'out' ? 'Contoh: Warung Bu Sri' : 'Contoh: Bayaran freelance'
              }
              value={merchant}
              onChange={(event) => setMerchant(event.target.value)}
            />
          </span>
        </label>

        <div className="form-grid">
          <div className={errors.categoryId ? 'ar-field ar-field--error' : 'ar-field'}>
            <span className="ar-label" id="category-label">
              Kategori
            </span>
            <SearchSelect
              label="Kategori"
              placeholder="Cari kategori"
              emptyLabel="Pilih kategori"
              options={categoryOptions(fitting)}
              value={category ? [category.id] : []}
              onChange={([next]) => setCategoryId(next ?? null)}
              hideLabel
              describedBy="category-label"
            />
            {errors.categoryId && <span className="ar-hint">{errors.categoryId}</span>}
          </div>
          <div className={errors.providerId ? 'ar-field ar-field--error' : 'ar-field'}>
            <span className="ar-label" id="provider-label">
              Sumber dana
            </span>
            <SearchSelect
              label="Sumber dana"
              placeholder="Cari bank, e-wallet, tunai"
              emptyLabel="Pilih sumber"
              options={providerOptions(true)}
              value={[providerId]}
              onChange={([next]) => next && setProviderId(next as ProviderId)}
              hideLabel
              describedBy="provider-label"
            />
            {errors.providerId && <span className="ar-hint">{errors.providerId}</span>}
          </div>
        </div>

        <div className={errors.day ? 'ar-field ar-field--error' : 'ar-field'}>
          <span className="ar-label">Tanggal</span>
          <div>
            <DateRangePicker
              value={{ from: day, to: day }}
              today={today}
              onChange={(range) => setDay(range.from)}
              single
              align="start"
            />
          </div>
          {errors.day && <span className="ar-hint">{errors.day}</span>}
        </div>

        <label className="ar-field">
          <span className="ar-label">
            Catatan <span className="ar-label__soft">(opsional)</span>
          </span>
          <textarea
            className="ar-textarea"
            name="note"
            maxLength={500}
            placeholder="Contoh: patungan makan siang tim"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>

        {state.status === 'error' && (
          <p className="notice" data-tone="error" role="alert">
            {state.message}
          </p>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="ar-btn ar-btn--primary ar-btn--lg"
            disabled={pending}
            onClick={() => (intent.current = 'done')}
          >
            {pending && intent.current === 'done' ? 'Menyimpan…' : 'Simpan transaksi'}
          </button>
          <button
            type="submit"
            className="ar-btn ar-btn--ghost"
            disabled={pending}
            onClick={() => (intent.current = 'again')}
          >
            {pending && intent.current === 'again' ? 'Menyimpan…' : 'Simpan & tambah lagi'}
          </button>
          <Link href="/transaksi" className="form-actions__cancel">
            Batal
          </Link>
        </div>
      </form>

      <aside className="preview">
        <h2 className="preview__title">Pratinjau</h2>
        <div
          className="preview__card"
          style={{ ['--from' as string]: colorFrom, ['--to' as string]: colorTo }}
        >
          <span className="ar-atm__shine" />
          <div className="ar-atm__row">
            <span className="ar-atm__name">{category?.name ?? 'Pilih kategori'}</span>
            <span className="preview__day">{dayLabel}</span>
          </div>
          <div className="ar-atm__row">
            <div>
              <div className="ar-atm__caption">{direction === 'out' ? 'Keluar' : 'Masuk'}</div>
              <div className="preview__amount ar-num">{signed}</div>
            </div>
          </div>
        </div>
        <div className="ar-card preview__row">
          <div className={`ar-tx ar-tx--${direction}`}>
            <div className="ar-tx__head" aria-hidden="true">
              <span className="ar-tx__avatar">
                <Icon name={direction === 'in' ? 'flowIn' : 'flowOut'} />
              </span>
              <span className="ar-tx__main">
                <span className="ar-tx__title">
                  {merchant.trim() ||
                    category?.name ||
                    (direction === 'out' ? 'Merchant' : 'Pengirim')}
                </span>
                <span className="ar-tx__meta">
                  {dayLabel} · {providerName(providerId)}
                  <span className="ar-badge">Manual</span>
                </span>
              </span>
              <span className="ar-tx__amount">{signed}</span>
            </div>
          </div>
        </div>
        <p className="ar-hint">Begini transaksinya akan muncul di daftar dan kartu kategori.</p>
      </aside>

      {toast && (
        <Toast
          key={toast.key}
          onDismiss={() => setToast(null)}
          action={
            <Link href={toast.href} className="ar-btn ar-btn--sm">
              Lihat
            </Link>
          }
        >
          <b>Tersimpan</b> · {toast.text}
        </Toast>
      )}
    </div>
  );
}
