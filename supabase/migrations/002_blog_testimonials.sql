-- =============================================
-- MIGRATION 002: Blog, Testimonials, Banners, Newsletter
-- =============================================

-- BLOG POSTS
create table if not exists public.blog_posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null default '',
  cover_image text,
  author_id uuid references public.profiles(id),
  tags text[] default '{}',
  published boolean default false,
  views int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.blog_posts enable row level security;
create policy "Published posts are public" on public.blog_posts for select using (published = true);
create policy "Admins manage posts" on public.blog_posts for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- TESTIMONIALS
create table if not exists public.testimonials (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  avatar_url text,
  content text not null,
  rating int default 5 check (rating between 1 and 5),
  product text,
  active boolean default true,
  created_at timestamptz default now()
);

alter table public.testimonials enable row level security;
create policy "Active testimonials are public" on public.testimonials for select using (active = true);
create policy "Admins manage testimonials" on public.testimonials for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- NEWSLETTER SUBSCRIBERS
create table if not exists public.subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  created_at timestamptz default now()
);

alter table public.subscribers enable row level security;
create policy "Anyone can subscribe" on public.subscribers for insert with check (true);
create policy "Admins view subscribers" on public.subscribers for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- CONTACT MESSAGES
create table if not exists public.contact_messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.contact_messages enable row level security;
create policy "Anyone can send message" on public.contact_messages for insert with check (true);
create policy "Admins read messages" on public.contact_messages for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- SEED BLOG POSTS
insert into public.blog_posts (title, slug, excerpt, content, cover_image, tags, published) values
(
  'Cách bố cục tiểu cảnh Zen đẹp cho người mới bắt đầu',
  'cach-bo-cuc-tieu-canh-zen',
  'Hướng dẫn từng bước thiết kế tiểu cảnh Zen đơn giản mà đẹp, phù hợp cho người mới bắt đầu với những nguyên liệu dễ tìm.',
  E'## Tiểu cảnh Zen là gì?\n\nTiểu cảnh Zen (Karesansui) là nghệ thuật vườn khô của Nhật Bản, sử dụng đá, cát và rêu để tái hiện thiên nhiên thu nhỏ...\n\n## Nguyên liệu cần chuẩn bị\n\n- Khay gỗ hoặc đá rộng\n- Cát trắng Nhật Bản\n- Đá granit tự nhiên 3-5 viên\n- Rêu nhung (tùy chọn)\n- Que cào mini\n\n## Các bước thực hiện\n\n**Bước 1:** Trải đều cát vào khay, độ dày 2-3cm\n\n**Bước 2:** Đặt đá theo nguyên tắc số lẻ (1, 3 hoặc 5 viên) — tránh cân xứng tuyệt đối\n\n**Bước 3:** Dùng que cào tạo các đường sóng xung quanh đá\n\n**Bước 4:** Thêm rêu nhung ở góc nếu muốn màu sắc\n\n## Lưu ý chăm sóc\n\nĐặt ở nơi thoáng, tránh ánh nắng trực tiếp. Thỉnh thoảng dùng cọ nhỏ để giữ cát sạch.',
  'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=1200',
  array['zen', 'hướng dẫn', 'người mới'],
  true
),
(
  'Top 5 loại cây phù hợp nhất cho terrarium kín',
  'top-5-cay-cho-terrarium-kin',
  'Không phải cây nào cũng sống được trong môi trường terrarium kín. Khám phá 5 loại cây lý tưởng cho hệ sinh thái thu nhỏ.',
  E'## Terrarium kín hoạt động như thế nào?\n\nTerrarium kín tạo ra một vòng tuần hoàn nước khép kín — cây thoát hơi nước, nước đọng lại trên thành bình rồi thấm xuống đất...\n\n## 5 loại cây tốt nhất\n\n### 1. Rêu Java (Java Moss)\nDễ sống, ưa ẩm, không cần nhiều ánh sáng. Lý tưởng tạo thảm nền xanh mướt.\n\n### 2. Cây Fittonia (Cây gân lá)\nLá đẹp với gân trắng, hồng nổi bật. Cần độ ẩm cao — hoàn hảo cho terrarium kín.\n\n### 3. Selaginella\nDương xỉ thu nhỏ, tạo hiệu ứng rừng nhiệt đới tuyệt đẹp.\n\n### 4. Peperomia Mini\nNhiều màu sắc, chịu được bóng râm và độ ẩm cao.\n\n### 5. Cây Creeping Fig\nBò lan đẹp, phủ kín đất và leo lên đá rất tự nhiên.\n\n## Lưu ý\n\nTránh dùng cây xương rồng hay sen đá vì chúng cần môi trường khô.',
  'https://images.unsplash.com/photo-1604762524889-3e2fcc145683?w=1200',
  array['terrarium', 'cây cảnh', 'hướng dẫn'],
  true
),
(
  'Bonsai mini: Nghệ thuật uốn cây và tạo dáng cơ bản',
  'bonsai-mini-nghe-thuat-uon-cay',
  'Từ một cây bình thường đến tác phẩm bonsai mini — hành trình đòi hỏi sự kiên nhẫn và đam mê với thiên nhiên.',
  E'## Lịch sử Bonsai\n\nBonsai (盆栽) có nguồn gốc từ Trung Quốc hơn 1000 năm trước, sau đó du nhập và phát triển rực rỡ tại Nhật Bản...\n\n## Các dáng bonsai cơ bản\n\n**Chokkan (Trực thân):** Thân thẳng, cành mở rộng đều — dáng dễ làm nhất cho người mới.\n\n**Moyogi (Thân cong):** Thân cong tự nhiên, phổ biến nhất.\n\n**Shakan (Nghiêng):** Thân nghiêng 45-80 độ, tạo cảm giác chống chọi với gió.\n\n## Dụng cụ cần thiết\n\n- Kéo cắt cành bonsai\n- Dây đồng uốn cành số 1-3mm\n- Đất bonsai chuyên dụng\n- Chậu bonsai phẳng\n\n## Cách uốn dây cơ bản\n\nQuấn dây đồng theo góc 45 độ dọc theo cành, sau đó nhẹ nhàng uốn theo hướng muốn. Để 3-6 tháng rồi tháo dây.',
  'https://images.unsplash.com/photo-1599598425947-5202edd56bdb?w=1200',
  array['bonsai', 'kỹ thuật', 'nâng cao'],
  true
),
(
  'Phong thủy tiểu cảnh: Chọn vị trí đặt đúng trong nhà',
  'phong-thuy-tieu-canh',
  'Vị trí đặt tiểu cảnh không chỉ ảnh hưởng đến thẩm mỹ mà còn tác động đến năng lượng phong thủy trong không gian sống.',
  E'## Tiểu cảnh và phong thủy\n\nTheo quan niệm phong thủy phương Đông, cây xanh và thiên nhiên mang lại sinh khí, thu hút tài lộc và xua đuổi tà khí...\n\n## Vị trí tốt cho tiểu cảnh\n\n**Phòng khách:** Góc Đông Nam hoặc Đông — hợp mệnh Mộc, mang tài lộc.\n\n**Bàn làm việc:** Phía trái góc nhìn — kích thích sáng tạo và tập trung.\n\n**Hành lang:** Tiểu cảnh dọc hành lang giúp khí lưu thông tốt hơn.\n\n## Vị trí nên tránh\n\n- Phòng ngủ: Cây hấp thụ oxy ban đêm có thể ảnh hưởng giấc ngủ\n- Nhà vệ sinh: Năng lượng âm, không tốt cho cây\n- Thẳng cửa ra vào: Khí vào thẳng, không tích tụ được',
  'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=1200',
  array['phong thủy', 'trang trí', 'không gian sống'],
  true
);

-- SEED TESTIMONIALS
insert into public.testimonials (name, content, rating, product, avatar_url) values
('Nguyễn Minh Châu', 'Tiểu cảnh Zen tôi mua về đặt trên bàn làm việc, mỗi sáng nhìn vào cảm thấy bình yên lắm. Đóng gói cẩn thận, giao nhanh!', 5, 'Tiểu cảnh Zen Núi Đá', 'https://i.pravatar.cc/100?img=1'),
('Trần Hữu Phúc', 'Terrarium cầu hình học đẹp không kém gì ảnh, mua tặng bạn gái được khen hết lời. Sẽ quay lại mua thêm!', 5, 'Terrarium Cầu Hình Học', 'https://i.pravatar.cc/100?img=3'),
('Lê Thị Hương', 'Bonsai linh sam khỏe mạnh, dáng cây đẹp, chậu sứ chất lượng tốt. Nhân viên tư vấn rất nhiệt tình qua chatbot.', 5, 'Bonsai Linh Sam Mini', 'https://i.pravatar.cc/100?img=5'),
('Phạm Quốc Toản', 'Mua rêu nhung về làm terrarium tự tay, chất lượng rêu tươi và đẹp. Giá hợp lý, ship nhanh toàn quốc.', 4, 'Rêu Nhung Xanh Nhật', 'https://i.pravatar.cc/100?img=7'),
('Võ Thị Mai', 'Shop tư vấn rất tận tâm, chatbot AI trả lời nhanh và chính xác. Sản phẩm đúng mô tả, rất hài lòng!', 5, 'Bộ Đá Suiseki', 'https://i.pravatar.cc/100?img=9'),
('Đặng Văn Khoa', 'Tiểu cảnh rừng nhiệt đới sống tốt sau 2 tháng, không cần chăm nhiều mà vẫn xanh tốt. Highly recommend!', 5, 'Tiểu cảnh Rừng Nhiệt Đới', 'https://i.pravatar.cc/100?img=11');
