-- Grip On — Phase 2 foundation
-- Run once in the Supabase SQL Editor, or apply with `supabase db push`.
-- Idempotent where practical so it can be safely re-run while setting up.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.user_role as enum ('customer', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.product_type as enum ('tee', 'hoodie', 'tank', 'bottoms', 'accessory');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.garment_size as enum ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONE_SIZE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum ('cod');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('unpaid', 'paid', 'refunded');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Profiles (one per auth user)
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_email_key
  on public.profiles (lower(email)) where email <> '';

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_path text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text,
  description text,
  details text[] not null default '{}'::text[],
  price_cents integer not null check (price_cents >= 0),
  compare_at_price_cents integer check (
    compare_at_price_cents is null or compare_at_price_cents >= price_cents
  ),
  product_type public.product_type not null,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_collections (
  product_id uuid not null references public.products (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (product_id, collection_id)
);

create table if not exists public.product_colours (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  slug text not null,
  name text not null,
  hex text not null check (hex ~ '^#[0-9A-Fa-f]{6}$'),
  front_image_path text,
  back_image_path text,
  gallery_paths text[] not null default '{}'::text[],
  is_active boolean not null default true,
  sort_order integer not null default 0,
  unique (product_id, slug),
  unique (id, product_id)
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null,
  colour_id uuid not null,
  size public.garment_size not null,
  sku text not null unique,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (colour_id, size),
  foreign key (colour_id, product_id)
    references public.product_colours (id, product_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------

create sequence if not exists public.order_number_seq;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default (
    'GO-' || to_char(now(), 'YYYY') || '-' ||
    lpad(nextval('public.order_number_seq')::text, 4, '0')
  ),
  user_id uuid references auth.users (id) on delete set null,
  status public.order_status not null default 'pending',
  payment_method public.payment_method not null default 'cod',
  payment_status public.payment_status not null default 'unpaid',
  customer_first_name text not null,
  customer_last_name text not null,
  customer_email text not null,
  customer_phone text not null,
  address_line1 text not null,
  address_line2 text,
  suburb text not null,
  city text not null,
  province text not null check (
    province in (
      'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
      'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
    )
  ),
  postal_code text not null check (postal_code ~ '^[0-9]{4}$'),
  delivery_notes text,
  subtotal_cents integer not null check (subtotal_cents >= 0),
  delivery_fee_cents integer not null check (delivery_fee_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name text not null,
  colour_name text not null,
  size text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity > 0),
  line_total_cents integer not null check (line_total_cents >= 0),
  image_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status public.order_status not null,
  note text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Store settings
-- ---------------------------------------------------------------------------

create table if not exists public.settings (
  id boolean primary key default true check (id = true),
  accent_hex text not null default '#FF6A00' check (accent_hex ~ '^#[0-9A-Fa-f]{6}$'),
  announcement_text text not null default 'Free delivery on orders over R800',
  free_delivery_threshold_cents integer not null default 80000 check (free_delivery_threshold_cents >= 0),
  delivery_fee_cents integer not null default 9900 check (delivery_fee_cents >= 0),
  contact_email text not null default 'hello@griponwear.co.za',
  instagram_url text,
  updated_at timestamptz not null default now()
);

insert into public.settings (id) values (true) on conflict (id) do nothing;

-- Kept separate so the owner's WhatsApp number is never exposed publicly.
create table if not exists public.admin_settings (
  id boolean primary key default true check (id = true),
  whatsapp_number text check (
    whatsapp_number is null or whatsapp_number ~ '^\+27[0-9]{9}$'
  ),
  updated_at timestamptz not null default now()
);

insert into public.admin_settings (id) values (true) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists products_active_sort_idx on public.products (is_active, sort_order);
create index if not exists product_collections_collection_idx on public.product_collections (collection_id);
create index if not exists product_colours_product_idx on public.product_colours (product_id);
create index if not exists product_variants_product_idx on public.product_variants (product_id);
create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_email_idx on public.orders (lower(customer_email));
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists order_events_order_idx on public.order_events (order_id, created_at);

-- ---------------------------------------------------------------------------
-- Functions and triggers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

drop trigger if exists admin_settings_set_updated_at on public.admin_settings;
create trigger admin_settings_set_updated_at before update on public.admin_settings
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for users who signed up before this migration.
insert into public.profiles (id, email, full_name)
select
  id,
  coalesce(email, ''),
  nullif(raw_user_meta_data ->> 'full_name', '')
from auth.users
on conflict (id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

create or replace function public.can_access_order(p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.orders o
    where o.id = p_order_id
      and (o.user_id = (select auth.uid()) or public.is_admin())
  );
$$;

-- ---------------------------------------------------------------------------
-- Create order (server-validated COD checkout)
-- Prices, stock and delivery are read here; the client cannot set them.
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
  v_delivery integer := 0;
  v_total integer := 0;
  v_threshold integer := 80000;
  v_fee integer := 9900;
  v_order_id uuid;
  v_order_number text;
  v_email text;
  v_phone text;
begin
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

  select s.free_delivery_threshold_cents, s.delivery_fee_cents
  into v_threshold, v_fee
  from public.settings s
  where s.id = true;

  v_threshold := coalesce(v_threshold, 80000);
  v_fee := coalesce(v_fee, 9900);
  v_delivery := case when v_subtotal >= v_threshold then 0 else v_fee end;
  v_total := v_subtotal + v_delivery;

  insert into public.orders (
    user_id, status, payment_method, payment_status,
    customer_first_name, customer_last_name, customer_email, customer_phone,
    address_line1, address_line2, suburb, city, province, postal_code, delivery_notes,
    subtotal_cents, delivery_fee_cents, total_cents
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

  insert into public.order_events (order_id, status, note)
  values (v_order_id, 'pending', 'Order placed. Cash on delivery.');

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

alter table public.profiles enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_collections enable row level security;
alter table public.product_colours enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.settings enable row level security;
alter table public.admin_settings enable row level security;

-- Profiles
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Collections
drop policy if exists collections_public_read on public.collections;
create policy collections_public_read on public.collections
  for select to anon, authenticated
  using (is_active);

drop policy if exists collections_admin_all on public.collections;
create policy collections_admin_all on public.collections
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Products
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select to anon, authenticated
  using (is_active);

drop policy if exists products_admin_all on public.products;
create policy products_admin_all on public.products
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Product/collection links
drop policy if exists product_collections_public_read on public.product_collections;
create policy product_collections_public_read on public.product_collections
  for select to anon, authenticated
  using (true);

drop policy if exists product_collections_admin_all on public.product_collections;
create policy product_collections_admin_all on public.product_collections
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Colours
drop policy if exists product_colours_public_read on public.product_colours;
create policy product_colours_public_read on public.product_colours
  for select to anon, authenticated
  using (
    is_active
    and exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active
    )
  );

drop policy if exists product_colours_admin_all on public.product_colours;
create policy product_colours_admin_all on public.product_colours
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Variants
drop policy if exists product_variants_public_read on public.product_variants;
create policy product_variants_public_read on public.product_variants
  for select to anon, authenticated
  using (
    is_active
    and exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active
    )
  );

drop policy if exists product_variants_admin_all on public.product_variants;
create policy product_variants_admin_all on public.product_variants
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Orders
drop policy if exists orders_select_own on public.orders;
create policy orders_select_own on public.orders
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists orders_admin_update on public.orders;
create policy orders_admin_update on public.orders
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Order items
drop policy if exists order_items_select on public.order_items;
create policy order_items_select on public.order_items
  for select to authenticated
  using (public.can_access_order(order_id));

drop policy if exists order_items_admin_all on public.order_items;
create policy order_items_admin_all on public.order_items
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Order events
drop policy if exists order_events_select on public.order_events;
create policy order_events_select on public.order_events
  for select to authenticated
  using (public.can_access_order(order_id));

drop policy if exists order_events_admin_all on public.order_events;
create policy order_events_admin_all on public.order_events
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Settings
drop policy if exists settings_public_read on public.settings;
create policy settings_public_read on public.settings
  for select to anon, authenticated
  using (true);

drop policy if exists settings_admin_update on public.settings;
create policy settings_admin_update on public.settings
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Admin-only settings
drop policy if exists admin_settings_admin_all on public.admin_settings;
create policy admin_settings_admin_all on public.admin_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Table privileges
-- ---------------------------------------------------------------------------

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

revoke all on public.collections from anon, authenticated;
grant select on public.collections to anon, authenticated;
grant insert, update, delete on public.collections to authenticated;

revoke all on public.products from anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

revoke all on public.product_collections from anon, authenticated;
grant select on public.product_collections to anon, authenticated;
grant insert, update, delete on public.product_collections to authenticated;

revoke all on public.product_colours from anon, authenticated;
grant select on public.product_colours to anon, authenticated;
grant insert, update, delete on public.product_colours to authenticated;

revoke all on public.product_variants from anon, authenticated;
grant select on public.product_variants to anon, authenticated;
grant insert, update, delete on public.product_variants to authenticated;

revoke all on public.orders from anon, authenticated;
grant select, update on public.orders to authenticated;

revoke all on public.order_items from anon, authenticated;
grant select, insert, update, delete on public.order_items to authenticated;

revoke all on public.order_events from anon, authenticated;
grant select, insert, update, delete on public.order_events to authenticated;

revoke all on public.settings from anon, authenticated;
grant select on public.settings to anon, authenticated;
grant update on public.settings to authenticated;

revoke all on public.admin_settings from anon, authenticated;
grant select, insert, update, delete on public.admin_settings to authenticated;

-- service_role (the service key) is server-only and bypasses RLS, but RLS
-- bypass is not GRANT: tables created in the SQL Editor do not inherit
-- Supabase's default privileges, so grant them explicitly. The seed script
-- and any server-side admin code run as this role.
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- ---------------------------------------------------------------------------
-- Function privileges
-- ---------------------------------------------------------------------------

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.can_access_order(uuid) from public, anon;
revoke all on function public.create_order(jsonb) from public;
revoke all on function public.track_order(text, text) from public;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.can_access_order(uuid) to authenticated;
grant execute on function public.create_order(jsonb) to anon, authenticated;
grant execute on function public.track_order(text, text) to anon, authenticated;

-- Server-side role may call everything (it was covered by PUBLIC before the
-- revokes above; restore the Supabase default for service_role).
grant execute on all functions in schema public to service_role;

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,
  array['image/webp', 'image/jpeg', 'image/png', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists product_images_public_read on storage.objects;
create policy product_images_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists product_images_admin_insert on storage.objects;
create policy product_images_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists product_images_admin_update on storage.objects;
create policy product_images_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists product_images_admin_delete on storage.objects;
create policy product_images_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
