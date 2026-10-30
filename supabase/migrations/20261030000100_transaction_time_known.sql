alter table public.transactions
  add column time_known boolean not null default true;

comment on column public.transactions.time_known is
  'False when only the day is known (manual entries for past days); occurred_at is then noon WIB.';
