create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null check (action ~ '^[a-z]+(\.[a-z_]+)+$'),
  target_type text,
  target_id text,
  reason text not null check (char_length(reason) between 5 and 500),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index audit_logs_created_idx on public.audit_logs (created_at desc);

create function public.reject_audit_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'audit_logs is append-only';
end;
$$;

create trigger audit_logs_append_only
  before update or delete on public.audit_logs
  for each row execute function public.reject_audit_change();

alter table public.audit_logs enable row level security;

create policy "audit_logs: super admin reads" on public.audit_logs for select to authenticated
  using ((select public.is_super_admin()));

revoke all on public.audit_logs from anon, authenticated;
grant select on public.audit_logs to authenticated;

create function public.log_admin_action(
  action text,
  reason text,
  target_type text default null,
  target_id text default null,
  metadata jsonb default '{}'
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  entry_id bigint;
begin
  if not public.is_super_admin() then
    raise exception 'super admin with two-factor session required' using errcode = '42501';
  end if;

  insert into public.audit_logs (actor_id, action, target_type, target_id, reason, metadata)
  values (auth.uid(), action, target_type, target_id, reason, coalesce(metadata, '{}'))
  returning id into entry_id;

  return entry_id;
end;
$$;

revoke execute on function public.log_admin_action from public, anon;
grant execute on function public.log_admin_action to authenticated;
