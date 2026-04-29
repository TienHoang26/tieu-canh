-- =============================================
-- TIỂU CẢNH SHOP - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- =============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  phone text,
  address text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- CATEGORIES TABLE
-- =============================================
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  created_at timestamptz default now()
);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  description text not null default '',
  price bigint not null,
  sale_price bigint,
  stock int not null default 0,
  category_id uuid references public.categories(id),
  images text[] default '{}',
  tags text[] default '{}',
  featured boolean default false,
  active boolean default true,
  created_at timestamptz default now()
);

-- =============================================
-- ORDERS TABLE
-- =============================================
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipping', 'delivered', 'cancelled')),
  total bigint not null,
  shipping_name text not null,
  shipping_phone text not null,
  shipping_address text not null,
  note text,
  created_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  quantity int not null,
  price bigint not null
);

-- =============================================
-- CHAT MESSAGES TABLE
-- =============================================
create table if not exists public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  session_id text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.chat_messages enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Categories & Products - public read
create policy "Categories are public" on public.categories for select using (true);
create policy "Active products are public" on public.products for select using (active = true);
create policy "Admins can manage categories" on public.categories for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can manage products" on public.products for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Orders policies
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can create orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "Admins can view all orders" on public.orders for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Users can view own order items" on public.order_items for select using (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
);
create policy "Users can insert order items" on public.order_items for insert with check (true);
create policy "Admins can view all order items" on public.order_items for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Chat policies
create policy "Users can manage own chat" on public.chat_messages for all using (auth.uid() = user_id);

-- =============================================
-- SEED DATA - CATEGORIES
-- =============================================
insert into public.categories (name, slug, description) values
  ('Tiểu cảnh Zen', 'zen', 'Tiểu cảnh phong cách Nhật Bản, tĩnh tâm'),
  ('Terrarium', 'terrarium', 'Vườn thu nhỏ trong bình thuỷ tinh'),
  ('Bonsai Mini', 'bonsai-mini', 'Bonsai thu nhỏ độc đáo'),
  ('Đá & Cát', 'da-cat', 'Đá phong thuỷ, cát màu trang trí'),
  ('Rêu & Cây cảnh', 'reu-cay-canh', 'Rêu nhung, cây sen đá, hoa đá')
on conflict (slug) do nothing;

-- =============================================
-- SEED DATA - PRODUCTS
-- =============================================
insert into public.products (name, slug, description, price, sale_price, stock, category_id, images, tags, featured) 
select
  'Tiểu cảnh Zen Núi Đá', 'tieu-canh-zen-nui-da',
  'Tiểu cảnh phong cách Zen với đá granit tự nhiên, cát trắng Nhật Bản và rêu xanh mướt. Mang lại cảm giác bình yên và tĩnh tâm cho không gian sống.',
  450000, 380000, 15,
  c.id,
  array['https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=800', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800'],
  array['zen', 'da', 'rêu', 'nổi bật'],
  true
from public.categories c where c.slug = 'zen';

insert into public.products (name, slug, description, price, sale_price, stock, category_id, images, tags, featured)
select
  'Terrarium Cầu Hình Học', 'terrarium-cau-hinh-hoc',
  'Bình thuỷ tinh hình cầu đựng thế giới thu nhỏ: đất moss, đá sỏi, cây sen đá nhỏ xinh. Rất hợp để trưng bày trên bàn làm việc hoặc kệ sách.',
  320000, null, 20,
  c.id,
  array['https://images.unsplash.com/photo-1604762524889-3e2fcc145683?w=800'],
  array['terrarium', 'thuỷ tinh', 'cây'],
  true
from public.categories c where c.slug = 'terrarium';

insert into public.products (name, slug, description, price, sale_price, stock, category_id, images, tags, featured)
select
  'Bonsai Linh Sam Mini', 'bonsai-linh-sam-mini',
  'Cây linh sam bonsai thu nhỏ 15cm, dáng trực thân, chậu sứ xanh đơn giản. Cây khoẻ mạnh, dễ chăm, tuổi thọ cao.',
  680000, 580000, 8,
  c.id,
  array['https://images.unsplash.com/photo-1599598425947-5202edd56bdb?w=800'],
  array['bonsai', 'linh sam', 'chậu sứ'],
  true
from public.categories c where c.slug = 'bonsai-mini';

insert into public.products (name, slug, description, price, sale_price, stock, category_id, images, tags, featured)
select
  'Bộ Đá Suiseki Tự Nhiên', 'bo-da-suiseki',
  'Bộ 3 viên đá suiseki tự nhiên được tuyển chọn kỹ lưỡng, hình dáng độc đáo, phù hợp trưng bày cùng tiểu cảnh Zen hoặc bonsai.',
  290000, null, 25,
  c.id,
  array['https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=800'],
  array['đá', 'suiseki', 'tự nhiên'],
  false
from public.categories c where c.slug = 'da-cat';

insert into public.products (name, slug, description, price, sale_price, stock, category_id, images, tags, featured)
select
  'Rêu Nhung Xanh Nhật', 'reu-nhung-xanh-nhat',
  'Rêu nhung Nhật Bản (mood moss) đã xử lý, giữ màu xanh tươi lâu dài. Dùng trang trí tiểu cảnh, terrarium, vườn thu nhỏ. Hộp 10x10cm.',
  150000, 120000, 50,
  c.id,
  array['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800'],
  array['rêu', 'nhật', 'trang trí'],
  false
from public.categories c where c.slug = 'reu-cay-canh';

insert into public.products (name, slug, description, price, sale_price, stock, category_id, images, tags, featured)
select
  'Tiểu cảnh Rừng Nhiệt Đới', 'tieu-canh-rung-nhiet-doi',
  'Thế giới thu nhỏ với cây nhiệt đới, đất than bùn, đá núi lửa. Độ ẩm cao, rất thích hợp cho cây nhiệt đới phát triển.',
  550000, null, 10,
  c.id,
  array['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800'],
  array['nhiệt đới', 'rừng', 'độc đáo'],
  true
from public.categories c where c.slug = 'terrarium';
