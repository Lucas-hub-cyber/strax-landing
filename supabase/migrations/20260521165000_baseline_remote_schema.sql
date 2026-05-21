create extension if not exists "pgcrypto" with schema extensions;

create sequence if not exists public.organizations_id_seq
  as integer
  start with 1
  increment by 1
  minvalue 1
  maxvalue 2147483647
  cache 1;

create sequence if not exists public.assessments_id_seq
  as integer
  start with 1
  increment by 1
  minvalue 1
  maxvalue 2147483647
  cache 1;

create table if not exists public.organizations (
  id integer not null default nextval('public.organizations_id_seq'::regclass),
  name varchar(255) not null,
  industry varchar(255),
  country varchar(100),
  created_at timestamp without time zone default current_timestamp,
  constraint organizations_pkey primary key (id)
);

alter sequence public.organizations_id_seq owned by public.organizations.id;

create table if not exists public.clients (
  id uuid not null default gen_random_uuid(),
  name text not null,
  industry text,
  status text not null default 'active'::text,
  created_at timestamptz not null default now(),
  constraint clients_pkey primary key (id)
);

create table if not exists public.assessments (
  id integer not null default nextval('public.assessments_id_seq'::regclass),
  organization_id integer,
  strategy numeric(4, 2),
  governance numeric(4, 2),
  operation numeric(4, 2),
  data numeric(4, 2),
  technology numeric(4, 2),
  average_score numeric(4, 2),
  classification varchar(50),
  created_at timestamp without time zone default current_timestamp,
  client_id uuid,
  iia numeric,
  ira numeric,
  mie_percent numeric,
  founder_dependency text,
  process_level text,
  raw_result jsonb,
  constraint assessments_pkey primary key (id)
);

alter sequence public.assessments_id_seq owned by public.assessments.id;

create table if not exists public.decisions (
  id uuid not null default gen_random_uuid(),
  client_id uuid not null,
  title text not null,
  description text,
  impact text,
  created_at timestamptz not null default now(),
  constraint decisions_pkey primary key (id)
);

create table if not exists public.intervention_sessions (
  id uuid not null default gen_random_uuid(),
  client_id uuid not null,
  founder_profile jsonb,
  transcript text,
  finances jsonb,
  processes jsonb,
  roadmap jsonb,
  generated_output jsonb,
  raw_state jsonb,
  status text not null default 'draft'::text,
  saved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint intervention_sessions_pkey primary key (id)
);

create table if not exists public.intervention_findings (
  id uuid not null default gen_random_uuid(),
  intervention_session_id uuid not null,
  client_id uuid not null,
  title text not null,
  description text,
  severity text not null default 'media'::text,
  category text not null default 'operacion'::text,
  created_at timestamptz not null default now(),
  constraint intervention_findings_pkey primary key (id)
);

create table if not exists public.risks (
  id uuid not null default gen_random_uuid(),
  client_id uuid not null,
  title text not null,
  severity text not null default 'medium'::text,
  impact text,
  status text not null default 'open'::text,
  created_at timestamptz not null default now(),
  constraint risks_pkey primary key (id)
);

create table if not exists public.roadmap_items (
  id uuid not null default gen_random_uuid(),
  client_id uuid not null,
  phase text not null,
  title text not null,
  description text,
  status text not null default 'pending'::text,
  priority text not null default 'medium'::text,
  created_at timestamptz not null default now(),
  constraint roadmap_items_pkey primary key (id)
);

create table if not exists public.sessions (
  id uuid not null default gen_random_uuid(),
  client_id uuid not null,
  session_type text not null,
  session_date timestamptz,
  status text not null default 'scheduled'::text,
  notes text,
  created_at timestamptz not null default now(),
  constraint sessions_pkey primary key (id)
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'assessments_client_id_fkey') then
    alter table public.assessments
      add constraint assessments_client_id_fkey
      foreign key (client_id) references public.clients(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'assessments_organization_id_fkey') then
    alter table public.assessments
      add constraint assessments_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'decisions_client_id_fkey') then
    alter table public.decisions
      add constraint decisions_client_id_fkey
      foreign key (client_id) references public.clients(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'intervention_sessions_client_id_fkey') then
    alter table public.intervention_sessions
      add constraint intervention_sessions_client_id_fkey
      foreign key (client_id) references public.clients(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'intervention_findings_client_id_fkey') then
    alter table public.intervention_findings
      add constraint intervention_findings_client_id_fkey
      foreign key (client_id) references public.clients(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'intervention_findings_intervention_session_id_fkey') then
    alter table public.intervention_findings
      add constraint intervention_findings_intervention_session_id_fkey
      foreign key (intervention_session_id) references public.intervention_sessions(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'risks_client_id_fkey') then
    alter table public.risks
      add constraint risks_client_id_fkey
      foreign key (client_id) references public.clients(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'roadmap_items_client_id_fkey') then
    alter table public.roadmap_items
      add constraint roadmap_items_client_id_fkey
      foreign key (client_id) references public.clients(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'sessions_client_id_fkey') then
    alter table public.sessions
      add constraint sessions_client_id_fkey
      foreign key (client_id) references public.clients(id) on delete cascade;
  end if;
end $$;

create index if not exists assessments_client_created_idx
  on public.assessments using btree (client_id, created_at desc);

create index if not exists assessments_client_idx
  on public.assessments using btree (client_id);

create index if not exists decisions_client_created_idx
  on public.decisions using btree (client_id, created_at desc);

create index if not exists decisions_client_idx
  on public.decisions using btree (client_id);

create index if not exists intervention_findings_session_idx
  on public.intervention_findings using btree (intervention_session_id);

create index if not exists intervention_sessions_client_saved_idx
  on public.intervention_sessions using btree (client_id, saved_at desc);

create index if not exists risks_client_idx
  on public.risks using btree (client_id);

create index if not exists risks_client_status_idx
  on public.risks using btree (client_id, status);

create index if not exists roadmap_items_client_idx
  on public.roadmap_items using btree (client_id);

create index if not exists roadmap_items_client_phase_idx
  on public.roadmap_items using btree (client_id, phase);

create index if not exists sessions_client_date_idx
  on public.sessions using btree (client_id, session_date desc);

create index if not exists sessions_client_idx
  on public.sessions using btree (client_id);

alter table public.assessments enable row level security;
alter table public.clients enable row level security;
alter table public.decisions enable row level security;
alter table public.intervention_findings enable row level security;
alter table public.intervention_sessions enable row level security;
alter table public.organizations enable row level security;
alter table public.risks enable row level security;
alter table public.roadmap_items enable row level security;
alter table public.sessions enable row level security;
