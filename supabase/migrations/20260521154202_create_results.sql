create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  model_version text not null,
  evaluation_hash text,
  iia numeric,
  ira numeric,
  mie_percent numeric,
  raw_result jsonb not null,
  created_at timestamptz default now()
);

create index if not exists results_assessment_id_idx
  on public.results (assessment_id);

create unique index if not exists results_evaluation_hash_uidx
  on public.results (evaluation_hash)
  where evaluation_hash is not null;

create index if not exists results_created_at_idx
  on public.results (created_at desc);
