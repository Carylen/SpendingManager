create type public.flow_direction as enum ('in', 'out');
create type public.capture_channel as enum ('email', 'sms', 'import', 'manual');
create type public.category_kind as enum ('expense', 'income', 'transfer');
create type public.raw_event_status as enum ('new', 'parsed', 'ignored', 'unsupported', 'failed');

create domain public.provider_id as text
  check (value in ('bca', 'mandiri', 'ocbc', 'bri', 'gopay', 'shopeepay', 'dana', 'cash'));

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  provider_id public.provider_id not null,
  label text not null check (char_length(label) between 1 and 60),
  last4 text check (last4 ~ '^[0-9]{4}$'),
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  kind public.category_kind not null,
  color_from text not null check (color_from ~ '^#[0-9a-f]{6}$'),
  color_to text not null check (color_to ~ '^#[0-9a-f]{6}$'),
  keywords text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  account_id uuid references public.accounts (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  direction public.flow_direction not null,
  amount bigint not null check (amount > 0),
  merchant text check (char_length(merchant) <= 120),
  note text check (char_length(note) <= 500),
  occurred_at timestamptz not null,
  channel public.capture_channel not null,
  fingerprint text not null,
  confidence numeric(3, 2) not null default 1 check (confidence between 0 and 1),
  needs_review boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, fingerprint)
);

create index transactions_user_occurred_idx on public.transactions (user_id, occurred_at desc);
create index transactions_user_review_idx on public.transactions (user_id) where needs_review;

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

create table public.raw_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  channel public.capture_channel not null check (channel <> 'manual'),
  provider_id public.provider_id,
  sender text not null,
  subject text,
  body text not null,
  received_at timestamptz not null,
  client_event_id text not null,
  status public.raw_event_status not null default 'new',
  parser_version text,
  attempts smallint not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, client_event_id)
);

create index raw_events_retry_idx on public.raw_events (status, attempts) where status in ('new', 'failed');

create table public.transaction_sources (
  transaction_id uuid not null references public.transactions (id) on delete cascade,
  raw_event_id uuid not null references public.raw_events (id) on delete cascade,
  primary key (transaction_id, raw_event_id)
);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  month date not null check (extract(day from month) = 1),
  limit_amount bigint not null check (limit_amount >= 0),
  unique (user_id, category_id, month)
);

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  label text not null check (char_length(label) between 1 and 60),
  token_hash text not null unique,
  last_seen_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

do $$
declare
  owned text;
begin
  foreach owned in array array['accounts', 'categories', 'transactions', 'budgets'] loop
    execute format('alter table public.%I enable row level security', owned);
    execute format(
      'create policy "%1$s: owner full access" on public.%1$I for all to authenticated
         using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
      owned
    );
    execute format('revoke all on public.%I from anon', owned);
    execute format('grant select, insert, update, delete on public.%I to authenticated', owned);
  end loop;
end;
$$;

alter table public.raw_events enable row level security;
create policy "raw_events: owner reads" on public.raw_events for select to authenticated
  using (user_id = (select auth.uid()));
revoke all on public.raw_events from anon, authenticated;
grant select on public.raw_events to authenticated;

alter table public.transaction_sources enable row level security;
create policy "transaction_sources: owner reads" on public.transaction_sources for select to authenticated
  using (exists (
    select 1 from public.transactions t
    where t.id = transaction_id and t.user_id = (select auth.uid())
  ));
revoke all on public.transaction_sources from anon, authenticated;
grant select on public.transaction_sources to authenticated;

alter table public.devices enable row level security;
create policy "devices: owner reads" on public.devices for select to authenticated
  using (user_id = (select auth.uid()));
create policy "devices: owner revokes" on public.devices for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke all on public.devices from anon, authenticated;
grant select on public.devices to authenticated;
grant update (revoked_at, label) on public.devices to authenticated;
