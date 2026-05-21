create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  consent_type text not null,
  accepted boolean not null default false,
  consent_version text not null,
  accepted_at timestamptz default now(),
  ip_address text,
  user_agent text,
  source text default 'website',
  evidence jsonb,
  created_at timestamptz default now()
);

create index if not exists consent_records_email_idx
  on public.consent_records (email);

create index if not exists consent_records_accepted_at_idx
  on public.consent_records (accepted_at);
