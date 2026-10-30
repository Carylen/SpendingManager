'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { dayOf, findProvider, formatRupiah, instantOn, type ProviderId } from '@arus/core';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { FlowDirection } from '@/lib/supabase/database.types';
import { fitsDirection } from './labels';
import { newTransactionSchema } from './schemas';

const isId = (value: unknown) => z.uuid().safeParse(value).success;

export type FieldErrors = Partial<Record<'amount' | 'providerId' | 'day' | 'categoryId', string>>;

export type SaveTransactionState =
  | { status: 'idle' }
  | { status: 'invalid'; errors: FieldErrors }
  | { status: 'error'; message: string }
  | { status: 'saved'; id: string; summary: string; day: string; savedAt: number };

const SAVE_FAILED = 'Transaksi belum tersimpan. Coba lagi sebentar.';

function refreshFinanceViews() {
  revalidatePath('/', 'layout');
}

async function categoryFits(categoryId: string, direction: FlowDirection): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('categories')
    .select('kind')
    .eq('id', categoryId)
    .maybeSingle();
  return Boolean(data && fitsDirection(data.kind, direction));
}

async function accountFor(providerId: ProviderId): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from('accounts')
    .select('id')
    .eq('provider_id', providerId)
    .order('created_at')
    .limit(1)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('accounts')
    .insert({ provider_id: providerId, label: findProvider(providerId)?.name ?? providerId })
    .select('id')
    .single();
  if (error) return null;
  return created.id;
}

export async function saveTransaction(
  _previous: SaveTransactionState,
  formData: FormData,
): Promise<SaveTransactionState> {
  const parsed = newTransactionSchema.safeParse({
    direction: formData.get('direction'),
    amount: formData.get('amount') || undefined,
    merchant: formData.get('merchant') ?? '',
    categoryId: formData.get('categoryId') || null,
    providerId: formData.get('providerId'),
    day: formData.get('day'),
    note: formData.get('note') ?? '',
  });

  if (!parsed.success) {
    const errors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof FieldErrors;
      errors[field] ??= issue.message;
    }
    return { status: 'invalid', errors };
  }

  const input = parsed.data;
  const now = new Date();
  const today = dayOf(now);
  if (input.day > today) {
    return { status: 'invalid', errors: { day: 'Tanggal tidak boleh setelah hari ini.' } };
  }
  if (input.categoryId && !(await categoryFits(input.categoryId, input.direction))) {
    return {
      status: 'invalid',
      errors: { categoryId: 'Kategori ini tidak cocok dengan arah transaksi.' },
    };
  }

  const accountId = await accountFor(input.providerId as ProviderId);
  if (!accountId) return { status: 'error', message: SAVE_FAILED };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      direction: input.direction,
      amount: input.amount,
      merchant: input.merchant,
      note: input.note,
      category_id: input.categoryId,
      account_id: accountId,
      occurred_at: input.day === today ? now.toISOString() : instantOn(input.day, 12),
      time_known: input.day === today,
      channel: 'manual',
      fingerprint: `manual:${randomUUID()}`,
    })
    .select('id')
    .single();
  if (error) return { status: 'error', message: SAVE_FAILED };

  refreshFinanceViews();
  return {
    status: 'saved',
    id: data.id,
    summary: formatRupiah(input.amount, input.direction),
    day: input.day,
    savedAt: now.getTime(),
  };
}

export type RowActionResult = { ok: true } | { ok: false; message: string };

export async function deleteTransaction(id: string): Promise<RowActionResult> {
  if (!isId(id)) return { ok: false, message: 'Transaksi tidak ditemukan.' };
  const supabase = await createSupabaseServerClient();
  const { error, count } = await supabase
    .from('transactions')
    .delete({ count: 'exact' })
    .eq('id', id);
  if (error || count === 0) return { ok: false, message: 'Transaksi belum terhapus. Coba lagi.' };
  refreshFinanceViews();
  return { ok: true };
}

export async function changeTransactionCategory(
  id: string,
  categoryId: string | null,
): Promise<RowActionResult> {
  if (!isId(id) || (categoryId !== null && !isId(categoryId))) {
    return { ok: false, message: 'Transaksi tidak ditemukan.' };
  }
  const supabase = await createSupabaseServerClient();
  const { data: transaction } = await supabase
    .from('transactions')
    .select('direction')
    .eq('id', id)
    .maybeSingle();
  if (!transaction) return { ok: false, message: 'Transaksi tidak ditemukan.' };
  if (categoryId && !(await categoryFits(categoryId, transaction.direction))) {
    return { ok: false, message: 'Kategori ini tidak cocok dengan arah transaksi.' };
  }

  const { error } = await supabase
    .from('transactions')
    .update({ category_id: categoryId })
    .eq('id', id);
  if (error) return { ok: false, message: 'Kategori belum berubah. Coba lagi.' };
  refreshFinanceViews();
  return { ok: true };
}
