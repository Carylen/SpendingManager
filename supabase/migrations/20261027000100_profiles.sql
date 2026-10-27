create type public.app_role as enum ('user', 'super_admin');
create type public.account_status as enum ('active', 'disabled');

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  role public.app_role not null default 'user',
  status public.account_status not null default 'active',
  inbound_slug text not null unique
    default ('u-' || substr(md5(gen_random_uuid()::text), 1, 10)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create function public.is_super_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select auth.jwt()) ->> 'user_role', '') = 'super_admin'
     and coalesce((select auth.jwt()) ->> 'aal', '') = 'aal2';
$$;

alter table public.profiles enable row level security;

create policy "profiles: read own"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles: super admin reads all"
  on public.profiles for select to authenticated
  using ((select public.is_super_admin()));

create policy "profiles: update own"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
