-- Round 2: manual availability, admin notifications and settings cleanup.
-- Safe to run more than once.

-- ---------------------------------------------------------------------------
-- Product availability
-- Stock counting is gone. The owner controls availability by hand and orders
-- no longer change it. The old stock_quantity column stays for history only.
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'product_variants'
      and column_name = 'is_available'
  ) then
    alter table public.product_variants
      add column is_available boolean not null default true;

    -- Preserve the current storefront state once, on the first run only.
    update public.product_variants
    set is_available = stock_quantity > 0;
  end if;
end
$$;

create index if not exists product_variants_available_idx
  on public.product_variants (colour_id, is_available);

-- ---------------------------------------------------------------------------
-- Admin notifications
-- admin_viewed_at is set when an order is opened in the dashboard. Unviewed
-- pending orders feed the live Orders badge.
-- ---------------------------------------------------------------------------

alter table public.orders
  add column if not exists admin_viewed_at timestamptz;

create index if not exists orders_unviewed_pending_idx
  on public.orders (created_at desc)
  where status = 'pending' and admin_viewed_at is null;

-- ---------------------------------------------------------------------------
-- Settings
-- The accent colour is fixed in code and the maintenance message is built in.
-- The announcement can be switched off without losing its text.
-- ---------------------------------------------------------------------------

alter table public.settings
  add column if not exists announcement_enabled boolean not null default true;

alter table public.settings
  add column if not exists business_address text not null default '';

alter table public.settings
  add column if not exists business_registration text not null default '';

update public.settings
set announcement_enabled = true
where announcement_enabled is null;

update public.settings
set maintenance_message = 'We''re not taking orders right now. Please check back soon or contact us.'
where maintenance_message is null or trim(maintenance_message) = '';

-- ---------------------------------------------------------------------------
-- Create order
-- Same rules as the forms migration (idempotency and delivery preserved), but
-- availability is checked and stock is never decremented.
-- ---------------------------------------------------------------------------

create or replace function public.create_order(payload jsonb)
returns table (order_id uuid, order_number text, total_cents integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_items jsonb := payload -> 'items';
  v_cust jsonb := payload -> 'customer';
  v_requested integer := 0;
  v_lines integer := 0;
  v_subtotal integer := 0;
  v_total integer := 0;
  v_maintenance boolean := false;
  v_delivery_area text;
  v_quote_required boolean := false;
  v_idempotency uuid;
  v_existing public.orders%rowtype;
  v_order_id uuid;
  v_order_number text;
  v_email text;
  v_phone text;
begin
  if coalesce(payload ->> 'idempotency_key', '') ~*
    '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  then
    v_idempotency := (payload ->> 'idempotency_key')::uuid;
  end if;

  if v_idempotency is not null then
    select o.*
    into v_existing
    from public.orders o
    where o.idempotency_key = v_idempotency;

    if found then
      return query
      select v_existing.id, v_existing.order_number, v_existing.total_cents;
      return;
    end if;
  end if;

  select s.maintenance_mode
  into v_maintenance
  from public.settings s
  where s.id = true;

  if coalesce(v_maintenance, false) then
    raise exception 'We''re not taking orders right now. Please check back soon or contact us.'
      using errcode = '22023';
  end if;

  if v_items is null or jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items) = 0 then
    raise exception 'Your bag is empty.' using errcode = '22023';
  end if;

  if jsonb_array_length(v_items) > 25 then
    raise exception 'Too many items in one order.' using errcode = '22023';
  end if;

  if v_cust is null or jsonb_typeof(v_cust) <> 'object' then
    raise exception 'Delivery details are missing.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(v_items) as x(variant_id uuid, quantity integer)
    where x.variant_id is null
      or x.quantity is null
      or x.quantity < 1
      or x.quantity > 10
  ) then
    raise exception 'Choose between 1 and 10 per item.' using errcode = '22023';
  end if;

  v_email := lower(trim(coalesce(v_cust ->> 'email', '')));
  v_phone := regexp_replace(coalesce(v_cust ->> 'phone', ''), '[^0-9+]', '', 'g');

  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Enter a valid email address.' using errcode = '22023';
  end if;

  if v_phone !~ '^(\+27|27|0)[6-8][0-9]{8}$' then
    raise exception 'Enter a valid South African mobile number.' using errcode = '22023';
  end if;

  if coalesce(trim(v_cust ->> 'first_name'), '') = ''
     or coalesce(trim(v_cust ->> 'last_name'), '') = '' then
    raise exception 'Enter your first and last name.' using errcode = '22023';
  end if;

  if coalesce(trim(v_cust ->> 'address_line1'), '') = ''
     or coalesce(trim(v_cust ->> 'suburb'), '') = ''
     or coalesce(trim(v_cust ->> 'city'), '') = '' then
    raise exception 'Enter your delivery address.' using errcode = '22023';
  end if;

  if coalesce(trim(v_cust ->> 'province'), '') not in (
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
    'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
  ) then
    raise exception 'Select a valid province.' using errcode = '22023';
  end if;

  if coalesce(trim(v_cust ->> 'postal_code'), '') !~ '^[0-9]{4}$' then
    raise exception 'Enter a 4-digit postal code.' using errcode = '22023';
  end if;

  if length(coalesce(v_cust ->> 'delivery_notes', '')) > 500 then
    raise exception 'Delivery notes are too long.' using errcode = '22023';
  end if;

  v_delivery_area := lower(trim(coalesce(v_cust ->> 'delivery_area', '')));

  if v_delivery_area not in ('johannesburg', 'outside') then
    raise exception 'Choose your delivery area.' using errcode = '22023';
  end if;

  v_quote_required := v_delivery_area = 'outside';

  select count(distinct x.variant_id)
  into v_requested
  from jsonb_to_recordset(v_items) as x(variant_id uuid, quantity integer);

  create temp table _order_lines (
    variant_id uuid primary key,
    quantity integer not null,
    product_id uuid not null,
    unit_price_cents integer not null,
    product_name text not null,
    colour_name text not null,
    size public.garment_size not null,
    image_path text,
    line_total_cents integer not null
  ) on commit drop;

  insert into _order_lines (
    variant_id, quantity, product_id, unit_price_cents,
    product_name, colour_name, size, image_path, line_total_cents
  )
  select
    l.variant_id,
    l.quantity,
    p.id,
    p.price_cents,
    p.name,
    c.name,
    v.size,
    c.front_image_path,
    p.price_cents * l.quantity
  from (
    select x.variant_id, sum(x.quantity)::integer as quantity
    from jsonb_to_recordset(v_items) as x(variant_id uuid, quantity integer)
    group by x.variant_id
  ) l
  join public.product_variants v on v.id = l.variant_id
  join public.products p on p.id = v.product_id
  join public.product_colours c on c.id = v.colour_id
  where p.is_active and v.is_active and c.is_active and v.is_available;

  get diagnostics v_lines = row_count;

  if v_lines = 0 then
    raise exception 'Those items are no longer available.' using errcode = '22023';
  end if;

  if v_lines <> v_requested then
    raise exception 'One or more items are sold out. Refresh your bag and try again.' using errcode = '22023';
  end if;

  select coalesce(sum(l.line_total_cents), 0)
  into v_subtotal
  from _order_lines l;

  -- Discounts are paused. Any code sent by an older client is ignored.
  v_total := v_subtotal;

  begin
    insert into public.orders (
      user_id, status, payment_method, payment_status,
      customer_first_name, customer_last_name, customer_email, customer_phone,
      address_line1, address_line2, suburb, city, province, postal_code, delivery_notes,
      subtotal_cents, discount_code, discount_cents, delivery_fee_cents, total_cents,
      delivery_area, delivery_quote_required, idempotency_key
    )
    values (
      (select auth.uid()),
      'pending',
      'cod',
      'unpaid',
      trim(v_cust ->> 'first_name'),
      trim(v_cust ->> 'last_name'),
      v_email,
      v_phone,
      trim(v_cust ->> 'address_line1'),
      nullif(trim(coalesce(v_cust ->> 'address_line2', '')), ''),
      trim(v_cust ->> 'suburb'),
      trim(v_cust ->> 'city'),
      trim(v_cust ->> 'province'),
      trim(v_cust ->> 'postal_code'),
      nullif(trim(coalesce(v_cust ->> 'delivery_notes', '')), ''),
      v_subtotal,
      null,
      0,
      0,
      v_total,
      v_delivery_area,
      v_quote_required,
      v_idempotency
    )
    returning orders.id, orders.order_number into v_order_id, v_order_number;
  exception when unique_violation then
    select o.*
    into v_existing
    from public.orders o
    where o.idempotency_key = v_idempotency;

    if found then
      return query
      select v_existing.id, v_existing.order_number, v_existing.total_cents;
      return;
    end if;

    raise;
  end;

  insert into public.order_items (
    order_id, product_id, variant_id, product_name, colour_name, size,
    unit_price_cents, quantity, line_total_cents, image_path
  )
  select
    v_order_id, l.product_id, l.variant_id, l.product_name, l.colour_name, l.size,
    l.unit_price_cents, l.quantity, l.line_total_cents, l.image_path
  from _order_lines l;

  if coalesce(payload ->> 'subscribe', 'false') = 'true' then
    insert into public.subscribers (email, source)
    values (v_email, 'checkout')
    on conflict (email) do update
      set is_active = true,
          unsubscribed_at = null,
          updated_at = now();
  end if;

  insert into public.order_events (order_id, status, note)
  values (
    v_order_id,
    'pending',
    case
      when v_quote_required
        then 'Order placed. Cash on delivery. Delivery to be quoted.'
      else 'Order placed. Cash on delivery. Free delivery in Johannesburg.'
    end
  );

  return query select v_order_id, v_order_number, v_total;
end;
$$;

grant execute on function public.create_order(jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Subscribers
-- The public newsletter form is the only way to add someone. Admins can read
-- and delete, but not insert or update rows.
-- ---------------------------------------------------------------------------

drop policy if exists subscribers_admin_all on public.subscribers;
drop policy if exists subscribers_admin_select on public.subscribers;
drop policy if exists subscribers_admin_delete on public.subscribers;

create policy subscribers_admin_select on public.subscribers
  for select to authenticated
  using (public.is_admin());

create policy subscribers_admin_delete on public.subscribers
  for delete to authenticated
  using (public.is_admin());

revoke all on public.subscribers from anon, authenticated;
grant select, delete on public.subscribers to authenticated;
grant all on public.subscribers to service_role;

-- ---------------------------------------------------------------------------
-- Realtime for admin badges
-- Orders are already published. Messages are added here for the inbox badge.
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'contact_messages'
  ) then
    execute 'alter publication supabase_realtime add table public.contact_messages';
  end if;
end
$$;
