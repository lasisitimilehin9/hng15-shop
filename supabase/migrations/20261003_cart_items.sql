-- Lesson 3: cart_items + stock RPC (run in Supabase SQL Editor if schema already applied)
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0 and quantity <= 99),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists cart_items_user_id_idx on public.cart_items(user_id);

alter table public.cart_items enable row level security;

drop policy if exists "Users read own cart items" on public.cart_items;
create policy "Users read own cart items"
  on public.cart_items for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own cart items" on public.cart_items;
create policy "Users insert own cart items"
  on public.cart_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own cart items" on public.cart_items;
create policy "Users update own cart items"
  on public.cart_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own cart items" on public.cart_items;
create policy "Users delete own cart items"
  on public.cart_items for delete
  using (auth.uid() = user_id);

create or replace function public.decrement_product_stock(
  p_product_id uuid,
  p_qty integer
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_qty is null or p_qty < 1 then
    raise exception 'invalid quantity';
  end if;
  update public.products
  set stock = greatest(0, stock - p_qty)
  where id = p_product_id;
end;
$$;

revoke all on function public.decrement_product_stock(uuid, integer) from public;
grant execute on function public.decrement_product_stock(uuid, integer) to service_role;
