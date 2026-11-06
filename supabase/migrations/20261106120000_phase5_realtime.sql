-- Phase 5: live order updates for the admin dashboard.
--
-- Supabase only streams changes for tables that are part of the realtime
-- publication. Existing RLS still applies, so only signed-in admins receive
-- order rows. Run this in the SQL editor after the Phase 2 migration.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    execute 'alter publication supabase_realtime add table public.orders';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'order_events'
  ) then
    execute 'alter publication supabase_realtime add table public.order_events';
  end if;
end
$$;

-- Realtime reads the previous row on updates; the primary key is enough here
-- because the dashboard only refreshes the page when a change arrives.
