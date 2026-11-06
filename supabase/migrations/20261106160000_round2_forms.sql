-- Round 2: idempotent checkout and stricter order lookup.
-- Safe to run more than once.

-- ---------------------------------------------------------------------------
-- Idempotency key
-- A repeated submit from the same checkout returns the original order instead
-- of creating a duplicate.
-- ---------------------------------------------------------------------------

alter table public.orders
  add column if not exists idempotency_key uuid;

create unique index if not exists orders_idempotency_key_idx
  on public.orders (idempotency_key)
  where idempotency_key is not null;

-- ---------------------------------------------------------------------------
-- Create order
-- Same rules as the delivery migration, with the delivery model preserved.
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
  v_maintenance_message text;
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

  v_delivery_area := lower(trim(coalesce(v_cust ->> 'delivery_area', '')));

  if v_delivery_area not in ('johannesburg', 'outside') then
    raise exception 'Choose your delivery area.' using errcode = '22023';
  end if;

  v_quote_required := v_delivery_area = 'outside';

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

  update public.product_variants v
  set stock_quantity = v.stock_quantity - l.quantity
  from _order_lines l
  where v.id = l.variant_id;

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

-- ---------------------------------------------------------------------------
-- Track order
-- Phone matching now normalises +27, 27 and 0 prefixes so orders placed with
-- any of those formats can still be found.
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
  v_email text := lower(trim(coalesce(p_contact, '')));
  v_phone text;
  v_items jsonb;
  v_events jsonb;
begin
  if position('@' in v_contact) = 0 then
    v_phone := regexp_replace(v_contact, '[^0-9]', '', 'g');

    if v_phone ~ '^0027[0-9]{9}$' then
      v_phone := '0' || substr(v_phone, 5);
    elsif v_phone ~ '^27[0-9]{9}$' then
      v_phone := '0' || substr(v_phone, 3);
    end if;
  end if;

  select *
  into v_order
  from public.orders o
  where upper(o.order_number) = upper(trim(coalesce(p_order_number, '')))
    and (
      lower(o.customer_email) = v_email
      or (
        v_phone is not null
        and regexp_replace(o.customer_phone, '[^0-9]', '', 'g')
          in (v_phone, '27' || substr(v_phone, 2))
      )
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
    'delivery_area', v_order.delivery_area,
    'delivery_quote_required', v_order.delivery_quote_required,
    'total_cents', v_order.total_cents,
    'customer_first_name', v_order.customer_first_name,
    'city', v_order.city,
    'province', v_order.province,
    'items', v_items,
    'events', v_events
  );
end;
$$;

grant execute on function public.create_order(jsonb) to anon, authenticated;
grant execute on function public.track_order(text, text) to anon, authenticated;
