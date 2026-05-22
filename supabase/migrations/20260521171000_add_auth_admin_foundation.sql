create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'architect'
    check (role in ('admin', 'architect', 'client', 'viewer')),
  status text not null default 'active'
    check (status in ('active', 'invited', 'disabled')),
  created_at timestamptz not null default now()
);

create table if not exists public.client_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  role text not null default 'client'
    check (role in ('admin', 'architect', 'client', 'viewer')),
  created_at timestamptz not null default now(),
  unique (user_id, client_id)
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.consent_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  accepted_at timestamptz not null default now(),
  ip text,
  user_agent text,
  accepted_terms_version text not null,
  accepted_privacy_version text not null,
  created_at timestamptz not null default now()
);

create index if not exists user_profiles_role_idx
  on public.user_profiles (role, status);

create index if not exists client_memberships_user_idx
  on public.client_memberships (user_id);

create index if not exists client_memberships_client_idx
  on public.client_memberships (client_id);

create index if not exists audit_events_actor_created_idx
  on public.audit_events (actor_user_id, created_at desc);

create index if not exists audit_events_client_created_idx
  on public.audit_events (client_id, created_at desc);

create index if not exists consent_logs_user_created_idx
  on public.consent_logs (user_id, created_at desc);

create index if not exists consent_logs_versions_idx
  on public.consent_logs (accepted_terms_version, accepted_privacy_version);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
begin
  requested_role := coalesce(new.raw_user_meta_data->>'role', 'architect');

  if requested_role not in ('architect', 'client', 'viewer') then
    requested_role := 'architect';
  end if;

  insert into public.user_profiles (user_id, email, full_name, role, status)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data->>'full_name', ''),
    requested_role,
    'active'
  )
  on conflict (user_id) do update
    set email = excluded.email,
        full_name = coalesce(public.user_profiles.full_name, excluded.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();

alter table public.user_profiles enable row level security;
alter table public.client_memberships enable row level security;
alter table public.audit_events enable row level security;
alter table public.consent_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_profiles'
      and policyname = 'users can read own profile'
  ) then
    create policy "users can read own profile"
      on public.user_profiles for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_profiles'
      and policyname = 'admins can read profiles'
  ) then
    create policy "admins can read profiles"
      on public.user_profiles for select
      using (
        exists (
          select 1 from public.user_profiles profile
          where profile.user_id = auth.uid()
            and profile.role = 'admin'
            and profile.status = 'active'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_profiles'
      and policyname = 'admins can manage profiles'
  ) then
    create policy "admins can manage profiles"
      on public.user_profiles for all
      using (
        exists (
          select 1 from public.user_profiles profile
          where profile.user_id = auth.uid()
            and profile.role = 'admin'
            and profile.status = 'active'
        )
      )
      with check (
        exists (
          select 1 from public.user_profiles profile
          where profile.user_id = auth.uid()
            and profile.role = 'admin'
            and profile.status = 'active'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_profiles'
      and policyname = 'users can insert own profile'
  ) then
    create policy "users can insert own profile"
      on public.user_profiles for insert
      with check (
        auth.uid() = user_id
        and role in ('architect', 'client', 'viewer')
        and status in ('active', 'invited')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_profiles'
      and policyname = 'users can update own profile'
  ) then
    create policy "users can update own profile"
      on public.user_profiles for update
      using (auth.uid() = user_id)
      with check (
        auth.uid() = user_id
        and role in ('architect', 'client', 'viewer')
        and status in ('active', 'invited')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'client_memberships'
      and policyname = 'members can read own memberships'
  ) then
    create policy "members can read own memberships"
      on public.client_memberships for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'client_memberships'
      and policyname = 'admins can manage memberships'
  ) then
    create policy "admins can manage memberships"
      on public.client_memberships for all
      using (
        exists (
          select 1 from public.user_profiles profile
          where profile.user_id = auth.uid()
            and profile.role = 'admin'
            and profile.status = 'active'
        )
      )
      with check (
        exists (
          select 1 from public.user_profiles profile
          where profile.user_id = auth.uid()
            and profile.role = 'admin'
            and profile.status = 'active'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'consent_logs'
      and policyname = 'users can create consent logs'
  ) then
    create policy "users can create consent logs"
      on public.consent_logs for insert
      with check (auth.uid() = user_id or user_id is null);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'consent_logs'
      and policyname = 'users can read own consent logs'
  ) then
    create policy "users can read own consent logs"
      on public.consent_logs for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'consent_logs'
      and policyname = 'admins can read consent logs'
  ) then
    create policy "admins can read consent logs"
      on public.consent_logs for select
      using (
        exists (
          select 1 from public.user_profiles profile
          where profile.user_id = auth.uid()
            and profile.role = 'admin'
            and profile.status = 'active'
        )
      );
  end if;
end $$;
