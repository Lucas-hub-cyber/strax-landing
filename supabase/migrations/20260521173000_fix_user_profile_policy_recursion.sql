create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles profile
    where profile.user_id = auth.uid()
      and profile.role = 'admin'
      and profile.status = 'active'
  );
$$;

do $$
begin
  drop policy if exists "admins can read profiles" on public.user_profiles;
  create policy "admins can read profiles"
    on public.user_profiles for select
    using (public.is_active_admin());

  drop policy if exists "admins can manage profiles" on public.user_profiles;
  create policy "admins can manage profiles"
    on public.user_profiles for all
    using (public.is_active_admin())
    with check (public.is_active_admin());

  drop policy if exists "admins can manage memberships" on public.client_memberships;
  create policy "admins can manage memberships"
    on public.client_memberships for all
    using (public.is_active_admin())
    with check (public.is_active_admin());

  drop policy if exists "admins can read consent logs" on public.consent_logs;
  create policy "admins can read consent logs"
    on public.consent_logs for select
    using (public.is_active_admin());

  drop policy if exists "anonymous users can read created consent id" on public.consent_logs;
end $$;
