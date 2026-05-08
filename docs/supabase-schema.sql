-- STRAX Workspace v1 suggested Supabase schema.
-- Do not run blindly in production. Review naming, indexes, policies, and backups first.
-- IMPORTANT: Enable and configure Row Level Security (RLS) before production use.

create extension if not exists "pgcrypto";

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  iia numeric,
  ira numeric,
  mie_percent numeric,
  founder_dependency text,
  process_level text,
  raw_result jsonb,
  created_at timestamptz not null default now()
);

-- Compatibility for projects that already had an assessments table.
alter table assessments add column if not exists client_id uuid references clients(id) on delete cascade;
alter table assessments add column if not exists iia numeric;
alter table assessments add column if not exists ira numeric;
alter table assessments add column if not exists mie_percent numeric;
alter table assessments add column if not exists founder_dependency text;
alter table assessments add column if not exists process_level text;
alter table assessments add column if not exists raw_result jsonb;
alter table assessments add column if not exists created_at timestamptz not null default now();

create table if not exists roadmap_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  phase text not null,
  title text not null,
  description text,
  status text not null default 'pending',
  priority text not null default 'medium',
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  session_type text not null,
  session_date timestamptz,
  status text not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists decisions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  description text,
  impact text,
  created_at timestamptz not null default now()
);

create table if not exists risks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  severity text not null default 'medium',
  impact text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists assessments_client_created_idx
  on assessments (client_id, created_at desc);

create index if not exists roadmap_items_client_phase_idx
  on roadmap_items (client_id, phase);

create index if not exists sessions_client_date_idx
  on sessions (client_id, session_date desc);

create index if not exists decisions_client_created_idx
  on decisions (client_id, created_at desc);

create index if not exists risks_client_status_idx
  on risks (client_id, status);

-- STRAX Intervention Core.
-- RLS must be enabled before production use.

create table if not exists intervention_sessions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  founder_profile jsonb,
  transcript text,
  finances jsonb,
  processes jsonb,
  roadmap jsonb,
  generated_output jsonb,
  raw_state jsonb,
  status text not null default 'draft',
  saved_at timestamptz,
  created_at timestamptz not null default now()
);

alter table intervention_sessions add column if not exists processes jsonb;

create table if not exists intervention_findings (
  id uuid primary key default gen_random_uuid(),
  intervention_session_id uuid not null references intervention_sessions(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  description text,
  severity text not null default 'media',
  category text not null default 'operacion',
  created_at timestamptz not null default now()
);

create index if not exists intervention_sessions_client_saved_idx
  on intervention_sessions (client_id, saved_at desc);

create index if not exists intervention_findings_session_idx
  on intervention_findings (intervention_session_id);

-- STRAX Auth / Admin foundation.
-- Supabase Auth owns auth.users. These tables store product roles and client access.

create table if not exists user_profiles (
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

create table if not exists client_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  role text not null default 'client'
    check (role in ('admin', 'architect', 'client', 'viewer')),
  created_at timestamptz not null default now(),
  unique (user_id, client_id)
);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists user_profiles_role_idx
  on user_profiles (role, status);

create index if not exists client_memberships_user_idx
  on client_memberships (user_id);

create index if not exists client_memberships_client_idx
  on client_memberships (client_id);

create index if not exists audit_events_actor_created_idx
  on audit_events (actor_user_id, created_at desc);

create index if not exists audit_events_client_created_idx
  on audit_events (client_id, created_at desc);

create table if not exists consent_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  accepted_at timestamptz not null default now(),
  ip text,
  user_agent text,
  accepted_terms_version text not null,
  accepted_privacy_version text not null,
  created_at timestamptz not null default now()
);

create index if not exists consent_logs_user_created_idx
  on consent_logs (user_id, created_at desc);

create index if not exists consent_logs_versions_idx
  on consent_logs (accepted_terms_version, accepted_privacy_version);

-- Creates the product profile as soon as a Supabase Auth user signs up.
-- This keeps the UI from creating an auth user without a STRAX role.
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

-- Recommended RLS starter.
-- Review before production. Run after creating the tables above.

alter table user_profiles enable row level security;
alter table client_memberships enable row level security;
alter table audit_events enable row level security;
alter table consent_logs enable row level security;

create policy "users can read own profile"
  on user_profiles for select
  using (auth.uid() = user_id);

create policy "admins can read profiles"
  on user_profiles for select
  using (
    exists (
      select 1 from user_profiles profile
      where profile.user_id = auth.uid()
        and profile.role = 'admin'
        and profile.status = 'active'
    )
  );

create policy "admins can manage profiles"
  on user_profiles for all
  using (
    exists (
      select 1 from user_profiles profile
      where profile.user_id = auth.uid()
        and profile.role = 'admin'
        and profile.status = 'active'
    )
  )
  with check (
    exists (
      select 1 from user_profiles profile
      where profile.user_id = auth.uid()
        and profile.role = 'admin'
        and profile.status = 'active'
    )
  );

create policy "users can insert own profile"
  on user_profiles for insert
  with check (
    auth.uid() = user_id
    and role in ('architect', 'client', 'viewer')
    and status in ('active', 'invited')
  );

create policy "users can update own profile"
  on user_profiles for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and role in ('architect', 'client', 'viewer')
    and status in ('active', 'invited')
  );

create policy "members can read own memberships"
  on client_memberships for select
  using (auth.uid() = user_id);

create policy "admins can manage memberships"
  on client_memberships for all
  using (
    exists (
      select 1 from user_profiles profile
      where profile.user_id = auth.uid()
        and profile.role = 'admin'
        and profile.status = 'active'
    )
  )
  with check (
    exists (
      select 1 from user_profiles profile
      where profile.user_id = auth.uid()
        and profile.role = 'admin'
        and profile.status = 'active'
    )
  );

create policy "users can create consent logs"
  on consent_logs for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "users can read own consent logs"
  on consent_logs for select
  using (auth.uid() = user_id);

create policy "admins can read consent logs"
  on consent_logs for select
  using (
    exists (
      select 1 from user_profiles profile
      where profile.user_id = auth.uid()
        and profile.role = 'admin'
        and profile.status = 'active'
    )
  );
