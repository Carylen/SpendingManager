create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(left(new.raw_user_meta_data ->> 'display_name', 80), ''));

  insert into public.categories (user_id, name, kind, color_from, color_to, keywords)
  values
    (new.id, 'Makan & minum', 'expense', '#9a3b20', '#5e1f0f', '{kopi,resto,warung,gofood}'),
    (new.id, 'Belanja', 'expense', '#33407a', '#1b2347', '{tokopedia,shopee,indomaret,alfamart}'),
    (new.id, 'Tagihan', 'expense', '#5b2a6e', '#321540', '{pln,netflix,indihome}'),
    (new.id, 'Transportasi', 'expense', '#2f5f8a', '#173550', '{grab,gojek,pertamina}'),
    (new.id, 'Lainnya', 'expense', '#3a403e', '#1c201f', '{}'),
    (new.id, 'Gaji', 'income', '#0b6b5a', '#063f36', '{gaji,payroll}'),
    (new.id, 'Transfer masuk', 'income', '#46612a', '#253714', '{}'),
    (new.id, 'Antar akun', 'transfer', '#4a4f6a', '#262a3d', '{top up,topup}');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  claims jsonb := event -> 'claims';
  profile record;
begin
  select role, status into profile
  from public.profiles
  where id = (event ->> 'user_id')::uuid;

  claims := jsonb_set(claims, '{user_role}', to_jsonb(coalesce(profile.role::text, 'user')));
  claims := jsonb_set(claims, '{account_status}', to_jsonb(coalesce(profile.status::text, 'active')));

  return jsonb_set(event, '{claims}', claims);
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from public, anon, authenticated;

grant select on public.profiles to supabase_auth_admin;
create policy "profiles: auth hook reads roles" on public.profiles for select to supabase_auth_admin
  using (true);
