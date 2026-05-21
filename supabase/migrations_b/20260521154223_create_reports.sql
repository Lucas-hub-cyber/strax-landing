create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete set null,
  assessment_id uuid references public.assessments(id) on delete cascade,
  result_id uuid references public.results(id) on delete set null,
  report_type text not null default 'diagnostic',
  status text not null default 'draft',
  title text not null,
  summary text,
  content jsonb,
  file_url text,
  generated_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists reports_contact_created_at_idx
  on public.reports (contact_id, created_at desc);

create index if not exists reports_assessment_id_idx
  on public.reports (assessment_id);

create index if not exists reports_status_generated_at_idx
  on public.reports (status, generated_at desc);
