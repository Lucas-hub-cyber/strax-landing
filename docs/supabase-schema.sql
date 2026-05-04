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
