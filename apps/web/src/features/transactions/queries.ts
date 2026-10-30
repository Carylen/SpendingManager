import 'server-only';
import { addDays, dayStartInstant, type ProviderId } from '@arus/core';
import type { DayRange } from '@/lib/date-range';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { CaptureChannel, CategoryKind } from '@/lib/supabase/database.types';
import { UNCATEGORIZED, likePattern, type TransactionFilters } from './filters';
import type { CategoryView, TransactionList, TransactionView } from './types';

const TRANSACTION_COLUMNS = `
  id, direction, amount, merchant, note, occurred_at, time_known, channel, needs_review,
  category:categories (id, name, kind, color_from, color_to),
  account:accounts (provider_id),
  sources:transaction_sources (raw_event:raw_events (body))
`;

interface CategoryRow {
  id: string;
  name: string;
  kind: CategoryKind;
  color_from: string;
  color_to: string;
}

const toCategory = (row: CategoryRow): CategoryView => ({
  id: row.id,
  name: row.name,
  kind: row.kind,
  colorFrom: row.color_from,
  colorTo: row.color_to,
});

const rangeBounds = (range: DayRange) => ({
  start: dayStartInstant(range.from),
  end: dayStartInstant(addDays(range.to, 1)),
});

async function accountIdsFor(providers: ProviderId[]): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('accounts').select('id').in('provider_id', providers);
  if (error) throw error;
  return data.map((row) => row.id);
}

export async function listTransactions(
  range: DayRange,
  filters: Partial<TransactionFilters> = {},
  limit = 500,
): Promise<TransactionList> {
  const supabase = await createSupabaseServerClient();
  const { start, end } = rangeBounds(range);

  let query = supabase
    .from('transactions')
    .select(TRANSACTION_COLUMNS)
    .gte('occurred_at', start)
    .lt('occurred_at', end)
    .order('occurred_at', { ascending: false })
    .limit(limit + 1);

  if (filters.direction && filters.direction !== 'all')
    query = query.eq('direction', filters.direction);
  if (filters.query) query = query.ilike('merchant', likePattern(filters.query));

  if (filters.providers?.length) {
    const accountIds = await accountIdsFor(filters.providers);
    if (accountIds.length === 0) return { items: [], truncated: false };
    query = query.in('account_id', accountIds);
  }

  if (filters.categories?.length) {
    const ids = filters.categories.filter((token) => token !== UNCATEGORIZED);
    const includeNone = ids.length < filters.categories.length;
    if (includeNone && ids.length)
      query = query.or(`category_id.is.null,category_id.in.(${ids.join(',')})`);
    else if (includeNone) query = query.is('category_id', null);
    else query = query.in('category_id', ids);
  }

  const { data, error } = await query;
  if (error) throw error;

  const items = data.slice(0, limit).map((row): TransactionView => ({
    id: row.id,
    direction: row.direction,
    amount: row.amount,
    merchant: row.merchant,
    note: row.note,
    occurredAt: row.occurred_at,
    channel: row.channel,
    needsReview: row.needs_review,
    timeKnown: row.time_known,
    category: row.category ? toCategory(row.category) : null,
    providerId: (row.account?.provider_id as ProviderId | undefined) ?? null,
    raw: row.sources[0]?.raw_event?.body ?? null,
  }));
  return { items, truncated: data.length > limit };
}

export interface SummaryRow {
  direction: TransactionView['direction'];
  amount: number;
  occurredAt: string;
  categoryId: string | null;
}

export async function listSummaryRows(range: DayRange): Promise<SummaryRow[]> {
  const supabase = await createSupabaseServerClient();
  const { start, end } = rangeBounds(range);
  const { data, error } = await supabase
    .from('transactions')
    .select('direction, amount, occurred_at, category_id')
    .gte('occurred_at', start)
    .lt('occurred_at', end)
    .limit(10_000);
  if (error) throw error;
  return data.map((row) => ({
    direction: row.direction,
    amount: row.amount,
    occurredAt: row.occurred_at,
    categoryId: row.category_id,
  }));
}

export async function listCategories(): Promise<CategoryView[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, kind, color_from, color_to')
    .order('kind')
    .order('name');
  if (error) throw error;
  return data.map(toCategory);
}

export async function countNeedsReview(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('needs_review', true);
  if (error) throw error;
  return count ?? 0;
}

export type CaptureActivity = Record<Exclude<CaptureChannel, 'manual'>, string | null>;

export async function latestCaptures(): Promise<CaptureActivity> {
  const supabase = await createSupabaseServerClient();
  const latest = async (channel: keyof CaptureActivity) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('occurred_at')
      .eq('channel', channel)
      .order('occurred_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data?.occurred_at ?? null;
  };
  const [email, sms, imported] = await Promise.all([
    latest('email'),
    latest('sms'),
    latest('import'),
  ]);
  return { email, sms, import: imported };
}
