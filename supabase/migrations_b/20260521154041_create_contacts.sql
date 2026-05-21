create extension if not exists "pgcrypto" with schema extensions;

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  company text,
  role text,
  source text not null default 'website',
  status text not null default 'new',
  score numeric,
  level text,
  answers jsonb,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists contacts_email_idx
  on public.contacts (email);

create index if not exists contacts_status_created_at_idx
  on public.contacts (status, created_at desc);
