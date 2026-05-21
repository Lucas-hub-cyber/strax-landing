create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete set null,
  client_id uuid,
  assessment_type text not null default 'initial',
  source text not null default 'website',
  status text not null default 'completed',
  input jsonb,
  iia numeric,
  ira numeric,
  mie_percent numeric,
  founder_dependency text,
  process_level text,
  raw_result jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists assessments_contact_created_at_idx
  on public.assessments (contact_id, created_at desc);

create index if not exists assessments_client_created_at_idx
  on public.assessments (client_id, created_at desc);

create index if not exists assessments_status_created_at_idx
  on public.assessments (status, created_at desc);
