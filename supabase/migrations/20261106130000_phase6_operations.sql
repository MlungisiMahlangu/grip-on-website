-- Grip On — Phase 6 operations
-- Run once in the Supabase SQL Editor after the Phase 2 foundation.
-- Discounts, customers, messages, subscribers, settings and maintenance.
-- Idempotent where practical so it can be safely re-run while setting up.

-- ---------------------------------------------------------------------------
-- Settings: maintenance mode
-- ---------------------------------------------------------------------------

alter table public.settings
  add column if not exists maintenance_mode boolean not null default false,
  add column if not exists maintenance_message text not null
    default 'We are making some changes. Check back shortly.';

-- ---------------------------------------------------------------------------
-- Orders: discount columns
-- ---------------------------------------------------------------------------

alter table public.orders
  add column if not exists discount_code text,
  add column if not exists discount_cents integer not null default 0;

alter table public.orders drop constraint if exists orders_discount_cents_check;
alter table public.orders add constraint orders_discount_cents_check
  check (discount_cents >= 0 and discount_cents <= subtotal_cents);

-- ---------------------------------------------------------------------------
-- Discount codes
-- ---------------------------------------------------------------------------

create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code) and code ~ '^[A-Z0-9][A-Z0-9_-]{2,29}$'),
  description text,
  kind text not null check (kind in ('percent', 'fixed')),
  value integer not null check (
    value > 0 and (kind <> 'percent' or value <= 100)
  ),
  min_subtotal_cents integer not null default 0 check (min_subtotal_cents >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
  times_redeemed integer not null default 0 check (times_redeemed >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table if not exists public.discount_redemptions (
  id uuid primary key default gen_random_uuid(),
  discount_id uuid not null references public.discount_codes (id) on delete restrict,
  order_id uuid not null unique references public.orders (id) on delete cascade,
  code text not null,
  amount_cents integer not null check (amount_cents >= 0),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Contact messages and subscribers
-- ---------------------------------------------------------------------------

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null check (email = lower(email)),
  phone text,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  source text not null default 'checkout' check (source in ('checkout', 'contact', 'admin', 'footer')),
  is_active boolean not null default true,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Customer summaries
-- Built from orders so guest checkout customers still appear.
-- ---------------------------------------------------------------------------

create or replace view public.customer_summaries
with (security_invoker = true)
as
select
  lower(o.customer_email) as email,
  (array_agg(o.customer_first_name order by o.created_at desc))[1] as first_name,
  (array_agg(o.customer_last_name order by o.created_at desc))[1] as last_name,
  (array_agg(o.customer_phone order by o.created_at desc))[1] as phone,
  (array_agg(o.city order by o.created_at desc))[1] as city,
  (array_agg(o.province order by o.created_at desc))[1] as province,
  count(*)::integer as order_count,
  coalesce(sum(o.total_cents) filter (where o.status <> 'cancelled'), 0) as total_spent_cents,
  coalesce(sum(o.discount_cents) filter (where o.status <> 'cancelled'), 0) as discount_total_cents,
  min(o.created_at) as first_order_at,
  max(o.created_at) as last_order_at
from public.orders o
group by lower(o.customer_email);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists discount_redemptions_discount_idx
  on public.discount_redemptions (discount_id);
create index if not exists contact_messages_status_idx
  on public.contact_messages (status, created_at desc);
create index if not exists subscribers_active_idx
  on public.subscribers (is_active, created_at desc);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

drop trigger if exists discount_codes_set_updated_at on public.discount_codes;
create trigger discount_codes_set_updated_at before update on public.discount_codes
  for each row execute function public.set_updated_at();

drop trigger if exists contact_messages_set_updated_at on public.contact_messages;
create trigger contact_messages_set_updated_at before update on public.contact_messages
  for each row execute function public.set_updated_at();

drop trigger if exists subscribers_set_updated_at on public.subscribers;
create trigger subscribers_set_updated_at before update on public.subscribers
  for each row execute function public.set_updated_at();

-- Cancelling an order frees its discount redemption so the code can be used
-- again. The order keeps its discount_code/discount_cents for the record.
create or replace function public.release_cancelled_order_discount()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_discount_id uuid;
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    delete from public.discount_redemptions r
    where r.order_id = new.id
    returning r.discount_id into v_discount_id;

    if v_discount_id is not null then
      update public.discount_codes d
      set times_redeemed = greatest(d.times_redeemed - 1, 0)
      where d.id = v_discount_id;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists orders_release_discount on public.orders;
create trigger orders_release_discount
  after update of status on public.orders
  for each row execute function public.release_cancelled_order_discount();

-- ---------------------------------------------------------------------------
-- Validate discount (public, read-only)
-- ---------------------------------------------------------------------------

create or replace function public.validate_discount(p_code text, p_subtotal_cents integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_code text := upper(trim(coalesce(p_code, '')));
  v_subtotal integer := greatest(coalesce(p_subtotal_cents, 0), 0);
  v_row public.discount_codes%rowtype;
  v_amount integer := 0;
begin
  if v_code = '' then
    return jsonb_build_object('valid', false, 'message', 'Enter a discount code.');
  end if;

  select *
  into v_row
  from public.discount_codes d
  where d.code = v_code;

  if not found then
    return jsonb_build_object('valid', false, 'message', 'That discount code is not valid.');
  end if;

  if not v_row.is_active then
    return jsonb_build_object('valid', false, 'message', 'That discount code is no longer available.');
  end if;

  if v_row.starts_at is not null and v_row.starts_at > now() then
    return jsonb_build_object('valid', false, 'message', 'That discount code is not active yet.');
  end if;

  if v_row.ends_at is not null and v_row.ends_at < now() then
    return jsonb_build_object('valid', false, 'message', 'That discount code has expired.');
  end if;

  if v_row.max_redemptions is not null and v_row.times_redeemed >= v_row.max_redemptions then
    return jsonb_build_object('valid', false, 'message', 'That discount code has been fully redeemed.');
  end if;

  if v_subtotal < v_row.min_subtotal_cents then
    return jsonb_build_object(
      'valid', false,
      'message', 'Spend at least R' || round(v_row.min_subtotal_cents / 100.0, 2)::text ||
        ' to use this code.'
    );
  end if;

  if v_row.kind = 'percent' then
    v_amount := floor(v_subtotal * v_row.value / 100.0)::integer;
  else
    v_amount := least(v_row.value, v_subtotal);
  end if;

  v_amount := greatest(least(v_amount, v_subtotal), 0);

  return jsonb_build_object(
    'valid', true,
    'code', v_row.code,
    'kind', v_row.kind,
    'value', v_row.value,
    'min_subtotal_cents', v_row.min_subtotal_cents,
    'amount_cents', v_amount,
    'description', v_row.description
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Subscribe (public, upsert)
-- ---------------------------------------------------------------------------

create or replace function public.subscribe_email(p_email text, p_source text default 'checkout')
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_source text := coalesce(nullif(trim(p_source), ''), 'checkout');
begin
  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' or length(v_email) > 160 then
    raise exception 'Enter a valid email address.' using errcode = '22023';
  end if;

  if v_source not in ('checkout', 'contact', 'admin', 'footer') then
    v_source := 'checkout';
  end if;

  insert into public.subscribers (email, source)
  values (v_email, v_source)
  on conflict (email) do update
    set is_active = true,
        unsubscribed_at = null,
        updated_at = now();

  return jsonb_build_object('ok', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- Contact messages (public, write-only)
-- ---------------------------------------------------------------------------

create or replace function public.submit_contact_message(
  p_name text,
  p_email text,
  p_phone text,
  p_subject text,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := trim(coalesce(p_name, ''));
  v_email text := lower(trim(coalesce(p_email, '')));
  v_phone text := nullif(regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g'), '');
  v_subject text := trim(coalesce(p_subject, ''));
  v_message text := trim(coalesce(p_message, ''));
  v_id uuid;
begin
  if v_name = '' or length(v_name) > 80 then
    raise exception 'Enter your name.' using errcode = '22023';
  end if;

  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' or length(v_email) > 160 then
    raise exception 'Enter a valid email address.' using errcode = '22023';
  end if;

  if v_phone is not null and v_phone !~ '^(\+27|27|0)[1-8][0-9]{8}$' then
    raise exception 'Enter a valid South African phone number.' using errcode = '22023';
  end if;

  if v_subject = '' or length(v_subject) > 120 then
    raise exception 'Add a subject under 120 characters.' using errcode = '22023';
  end if;

  if length(v_message) < 10 or length(v_message) > 4000 then
    raise exception 'Add a message between 10 and 4,000 characters.' using errcode = '22023';
  end if;

  insert into public.contact_messages (name, email, phone, subject, message)
  values (v_name, v_email, v_phone, v_subject, v_message)
  returning id into v_id;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Create order (server-validated COD checkout)
-- Prices, stock, delivery and discounts are read here; the client cannot set them.
-- Delivery is free once the discounted subtotal reaches the threshold.
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
  v_discount integer := 0;
  v_discounted integer := 0;
  v_delivery integer := 0;
  v_total integer := 0;
  v_threshold integer := 80000;
  v_fee integer := 9900;
  v_maintenance boolean := false;
  v_maintenance_message text;
  v_discount_code text;
  v_discount_row public.discount_codes%rowtype;
  v_discount_id uuid;
  v_order_id uuid;
  v_order_number text;
  v_email text;
  v_phone text;
begin
  select s.maintenance_mode, s.maintenance_message
  into v_maintenance, v_maintenance_message
  from public.settings s
  where s.id = true;

  if coalesce(v_maintenance, false) then
    raise exception '%',
      coalesce(
        nullif(trim(v_maintenance_message), ''),
        'The store is temporarily closed for updates. Try again shortly.'
      )
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

  select count(distinct x.variant_id)
  into v_requested
  from jsonb_to_recordset(v_items) as x(variant_id uuid, quantity integer);

  -- Lock every variant before pricing or decrementing stock.
  perform v.id
  from public.product_variants v
  join (
    select distinct x.variant_id
    from jsonb_to_recordset(v_items) as x(variant_id uuid, quantity integer)
  ) d on d.variant_id = v.id
  for update of v;

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
  where p.is_active and v.is_active and c.is_active;

  get diagnostics v_lines = row_count;

  if v_lines = 0 then
    raise exception 'Those items are no longer available.' using errcode = '22023';
  end if;

  if v_lines <> v_requested then
    raise exception 'One or more items are unavailable. Refresh your bag and try again.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from _order_lines l
    join public.product_variants v on v.id = l.variant_id
    where v.stock_quantity < l.quantity
  ) then
    raise exception 'Not enough stock for one or more items.' using errcode = '22023';
  end if;

  select coalesce(sum(l.line_total_cents), 0)
  into v_subtotal
  from _order_lines l;

  v_discount_code := nullif(upper(trim(coalesce(payload ->> 'discount_code', ''))), '');

  if v_discount_code is not null then
    select *
    into v_discount_row
    from public.discount_codes d
    where d.code = v_discount_code
    for update;

    if not found then
      raise exception 'That discount code is not valid.' using errcode = '22023';
    end if;

    if not v_discount_row.is_active then
      raise exception 'That discount code is no longer available.' using errcode = '22023';
    end if;

    if v_discount_row.starts_at is not null and v_discount_row.starts_at > now() then
      raise exception 'That discount code is not active yet.' using errcode = '22023';
    end if;

    if v_discount_row.ends_at is not null and v_discount_row.ends_at < now() then
      raise exception 'That discount code has expired.' using errcode = '22023';
    end if;

    if v_discount_row.max_redemptions is not null
       and v_discount_row.times_redeemed >= v_discount_row.max_redemptions then
      raise exception 'That discount code has been fully redeemed.' using errcode = '22023';
    end if;

    if v_subtotal < v_discount_row.min_subtotal_cents then
      raise exception 'Spend at least R% to use this code.',
        round(v_discount_row.min_subtotal_cents / 100.0, 2)
        using errcode = '22023';
    end if;

    if v_discount_row.kind = 'percent' then
      v_discount := floor(v_subtotal * v_discount_row.value / 100.0)::integer;
    else
      v_discount := least(v_discount_row.value, v_subtotal);
    end if;

    v_discount := greatest(least(v_discount, v_subtotal), 0);
    v_discount_id := v_discount_row.id;
  end if;

  select s.free_delivery_threshold_cents, s.delivery_fee_cents
  into v_threshold, v_fee
  from public.settings s
  where s.id = true;

  v_threshold := coalesce(v_threshold, 80000);
  v_fee := coalesce(v_fee, 9900);
  v_discounted := greatest(v_subtotal - v_discount, 0);
  v_delivery := case when v_discounted >= v_threshold then 0 else v_fee end;
  v_total := v_discounted + v_delivery;

  insert into public.orders (
    user_id, status, payment_method, payment_status,
    customer_first_name, customer_last_name, customer_email, customer_phone,
    address_line1, address_line2, suburb, city, province, postal_code, delivery_notes,
    subtotal_cents, discount_code, discount_cents, delivery_fee_cents, total_cents
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
    v_discount_code,
    v_discount,
    v_delivery,
    v_total
  )
  returning orders.id, orders.order_number into v_order_id, v_order_number;

  insert into public.order_items (
    order_id, product_id, variant_id, product_name, colour_name, size,
    unit_price_cents, quantity, line_total_cents, image_path
  )
  select
    v_order_id, l.product_id, l.variant_id, l.product_name, l.colour_name, l.size,
    l.unit_price_cents, l.quantity, l.line_total_cents, l.image_path
  from _order_lines l;

  update public.product_variants v
  set stock_quantity = v.stock_quantity - l.quantity
  from _order_lines l
  where v.id = l.variant_id;

  if v_discount_id is not null then
    insert into public.discount_redemptions (discount_id, order_id, code, amount_cents)
    values (v_discount_id, v_order_id, v_discount_code, v_discount);

    update public.discount_codes d
    set times_redeemed = d.times_redeemed + 1
    where d.id = v_discount_id;
  end if;

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
      when v_discount_code is null then 'Order placed. Cash on delivery.'
      else 'Order placed. Cash on delivery. Discount ' || v_discount_code || ' applied.'
    end
  );

  return query select v_order_id, v_order_number, v_total;
end;
$$;

-- ---------------------------------------------------------------------------
-- Track order (order number + email or phone)
-- ---------------------------------------------------------------------------

create or replace function public.track_order(p_order_number text, p_contact text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_contact text := regexp_replace(coalesce(p_contact, ''), '[^0-9+@._a-zA-Z-]', '', 'g');
  v_items jsonb;
  v_events jsonb;
begin
  select *
  into v_order
  from public.orders o
  where upper(o.order_number) = upper(trim(coalesce(p_order_number, '')))
    and (
      lower(o.customer_email) = lower(trim(coalesce(p_contact, '')))
      or o.customer_phone = v_contact
    );

  if not found then
    return null;
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'product_name', i.product_name,
        'colour_name', i.colour_name,
        'size', i.size,
        'quantity', i.quantity,
        'unit_price_cents', i.unit_price_cents,
        'line_total_cents', i.line_total_cents,
        'image_path', i.image_path
      ) order by i.created_at
    ),
    '[]'::jsonb
  )
  into v_items
  from public.order_items i
  where i.order_id = v_order.id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object('status', e.status, 'note', e.note, 'created_at', e.created_at)
      order by e.created_at
    ),
    '[]'::jsonb
  )
  into v_events
  from public.order_events e
  where e.order_id = v_order.id;

  return jsonb_build_object(
    'order_number', v_order.order_number,
    'status', v_order.status,
    'payment_method', v_order.payment_method,
    'payment_status', v_order.payment_status,
    'created_at', v_order.created_at,
    'subtotal_cents', v_order.subtotal_cents,
    'discount_code', v_order.discount_code,
    'discount_cents', v_order.discount_cents,
    'delivery_fee_cents', v_order.delivery_fee_cents,
    'total_cents', v_order.total_cents,
    'customer_first_name', v_order.customer_first_name,
    'city', v_order.city,
    'province', v_order.province,
    'items', v_items,
    'events', v_events
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.discount_codes enable row level security;
alter table public.discount_redemptions enable row level security;
alter table public.contact_messages enable row level security;
alter table public.subscribers enable row level security;

drop policy if exists discount_codes_admin_all on public.discount_codes;
create policy discount_codes_admin_all on public.discount_codes
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists discount_redemptions_admin_read on public.discount_redemptions;
create policy discount_redemptions_admin_read on public.discount_redemptions
  for select to authenticated
  using (public.is_admin());

drop policy if exists contact_messages_admin_all on public.contact_messages;
create policy contact_messages_admin_all on public.contact_messages
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists subscribers_admin_all on public.subscribers;
create policy subscribers_admin_all on public.subscribers
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Table privileges
-- ---------------------------------------------------------------------------

revoke all on public.discount_codes from anon, authenticated;
grant select, insert, update, delete on public.discount_codes to authenticated;

revoke all on public.discount_redemptions from anon, authenticated;
grant select on public.discount_redemptions to authenticated;

revoke all on public.contact_messages from anon, authenticated;
grant select, insert, update, delete on public.contact_messages to authenticated;

revoke all on public.subscribers from anon, authenticated;
grant select, insert, update, delete on public.subscribers to authenticated;

revoke all on public.customer_summaries from anon, authenticated;
grant select on public.customer_summaries to authenticated;

grant all on public.discount_codes to service_role;
grant all on public.discount_redemptions to service_role;
grant all on public.contact_messages to service_role;
grant all on public.subscribers to service_role;
grant select on public.customer_summaries to service_role;

-- ---------------------------------------------------------------------------
-- Function privileges
-- ---------------------------------------------------------------------------

revoke all on function public.validate_discount(text, integer) from public, anon, authenticated;
grant execute on function public.validate_discount(text, integer) to anon, authenticated;

revoke all on function public.subscribe_email(text, text) from public, anon, authenticated;
grant execute on function public.subscribe_email(text, text) to anon, authenticated;

revoke all on function public.submit_contact_message(text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.submit_contact_message(text, text, text, text, text)
  to anon, authenticated;

revoke all on function public.release_cancelled_order_discount() from public, anon, authenticated;
grant execute on function public.release_cancelled_order_discount() to service_role;

grant execute on function public.create_order(jsonb) to anon, authenticated;
grant execute on function public.track_order(text, text) to anon, authenticated;
grant execute on all functions in schema public to service_role;
