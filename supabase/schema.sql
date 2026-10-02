-- Oriki Naturals — HNG Lesson 2 schema
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  price_kobo integer not null check (price_kobo > 0),
  image_url text,
  category text not null default 'skincare',
  stock integer not null default 50 check (stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_ref text unique not null,
  status text not null default 'confirmed'
    check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_state text not null,
  notes text,
  total_kobo integer not null check (total_kobo >= 0),
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

-- Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_name text not null,
  unit_price_kobo integer not null check (unit_price_kobo > 0),
  quantity integer not null check (quantity > 0),
  line_total_kobo integer not null check (line_total_kobo > 0)
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- RLS
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Products: public read of active products
drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
  on public.products for select
  using (active = true);

-- Orders: users read/insert only their own
drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own orders" on public.orders;
create policy "Users insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Order items: readable if parent order belongs to user
drop policy if exists "Users read own order items" on public.order_items;
create policy "Users read own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "Users insert own order items" on public.order_items;
create policy "Users insert own order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- Seed products (idempotent via slug)
insert into public.products (slug, name, description, price_kobo, image_url, category, stock)
values
  (
    'pure-shea-butter',
    'Pure Raw Shea Butter',
    'Unrefined Grade A shea butter from women''s cooperatives in Osun State. Deeply moisturises dry skin and hair. 250g jar.',
    450000,
    'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80',
    'body',
    80
  ),
  (
    'african-black-soap',
    'African Black Soap Bar',
    'Traditional black soap made with plantain skin, cocoa pod ash, and palm oil. Gentle cleansing for face and body. 150g bar.',
    250000,
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
    'body',
    120
  ),
  (
    'coconut-hair-oil',
    'Virgin Coconut Hair Oil',
    'Cold-pressed virgin coconut oil infused with rosemary and peppermint. Strengthens hair and soothes the scalp. 100ml bottle.',
    350000,
    'https://images.unsplash.com/photo-1608248543808-dfd6e0f0b0f0?w=600&q=80',
    'hair',
    60
  ),
  (
    'turmeric-face-mask',
    'Turmeric Brightening Mask',
    'Clay mask with turmeric, honey powder, and oatmeal. Helps even skin tone. 100g pouch.',
    320000,
    'https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=600&q=80',
    'face',
    45
  ),
  (
    'palm-kernel-soap',
    'Palm Kernel Castile Soap',
    'Mild castile-style soap from local palm kernel oil. Unscented, suitable for sensitive skin. 200g bar.',
    180000,
    'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9e?w=600&q=80',
    'body',
    90
  ),
  (
    'hibiscus-body-butter',
    'Hibiscus Body Butter',
    'Whipped body butter with shea, cocoa butter, and dried hibiscus. Soft floral scent. 200g jar.',
    550000,
    'https://images.unsplash.com/photo-1620916566137-d0d5b0d0e0e0?w=600&q=80',
    'body',
    40
  ),
  (
    'neem-scalp-serum',
    'Neem Scalp Serum',
    'Lightweight serum with neem, tea tree, and jojoba. Targets dryness and flaking. 50ml dropper bottle.',
    400000,
    'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=600&q=80',
    'hair',
    55
  ),
  (
    'gift-set-essentials',
    'Essentials Gift Set',
    'Gift box with mini shea butter, black soap, and coconut oil. Ideal for first-time customers.',
    850000,
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80',
    'gifts',
    25
  )
on conflict (slug) do nothing;
