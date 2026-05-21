create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  event_type text not null,
  entity_table text,
  entity_id uuid,
  ip_address text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists audit_logs_actor_created_at_idx
  on public.audit_logs (actor_user_id, created_at desc);

create index if not exists audit_logs_contact_created_at_idx
  on public.audit_logs (contact_id, created_at desc);

create index if not exists audit_logs_entity_idx
  on public.audit_logs (entity_table, entity_id);

create index if not exists audit_logs_event_created_at_idx
  on public.audit_logs (event_type, created_at desc);
