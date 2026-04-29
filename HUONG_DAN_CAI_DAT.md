# 🌿 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN — TIỂU CẢNH VIỆT

## MỤC LỤC
1. Yêu cầu hệ thống
2. Cấu trúc toàn bộ file
3. Cài đặt từng bước chi tiết
4. Cấu hình Supabase
5. Cấu hình Google OAuth
6. Biến môi trường
7. Chạy dự án
8. Deploy lên Vercel
9. Tạo tài khoản Admin
10. Troubleshooting

---

## 1. YÊU CẦU HỆ THỐNG

| Công cụ | Phiên bản | Ghi chú |
|---|---|---|
| Node.js | ≥ 18.17.0 | Tải tại nodejs.org |
| npm | ≥ 9.x | Đi kèm với Node.js |
| Git | Bất kỳ | Để clone dự án |
| Tài khoản Supabase | Free | supabase.com |
| Tài khoản Anthropic | Có API key | console.anthropic.com |
| Tài khoản Vercel | Free | vercel.com (để deploy) |

---

## 2. CẤU TRÚC TOÀN BỘ FILE & TÁC DỤNG

```
tieu-canh/
│
├── 📄 package.json
│     Khai báo dependencies: Next.js, Supabase, Tailwind, Zustand, Anthropic SDK...
│     Scripts: dev, build, start, lint
│
├── 📄 next.config.js
│     Cấu hình Next.js: cho phép load ảnh từ Supabase, Unsplash, Google
│
├── 📄 tailwind.config.ts
│     Màu sắc tùy chỉnh: moss (xanh rêu), earth (nâu đất)
│     Animations: fade-up, float, shimmer
│     Font: Playfair Display + Lato
│
├── 📄 tsconfig.json
│     TypeScript config: alias @/* → ./*, strict mode
│
├── 📄 postcss.config.js
│     Cần thiết để Tailwind CSS hoạt động
│
├── 📄 middleware.ts  ⭐ QUAN TRỌNG
│     Chạy trước mọi request, xử lý:
│     - Refresh Supabase session
│     - Bảo vệ route /admin (chỉ cho admin)
│     - Bảo vệ route /checkout (phải đăng nhập)
│
├── 📄 vercel.json
│     Cấu hình deploy Vercel: build command, framework
│
├── 📄 .env.example
│     Mẫu các biến môi trường cần thiết (copy thành .env.local)
│
├── 📄 .gitignore
│     Loại trừ node_modules, .next, .env khỏi git
│
│
├── 📁 types/
│   └── index.ts
│         Khai báo TypeScript interfaces: Profile, Product, Order, Category...
│         Dùng xuyên suốt toàn project
│
│
├── 📁 lib/
│   ├── 📁 supabase/
│   │   ├── client.ts
│   │   │     Khởi tạo Supabase client phía BROWSER (dùng trong 'use client')
│   │   │     Gọi createBrowserClient()
│   │   │
│   │   ├── server.ts
│   │   │     Khởi tạo Supabase client phía SERVER (dùng trong Server Components)
│   │   │     createClient() → dùng trong page.tsx, layout.tsx
│   │   │     createAdminClient() → dùng khi cần bypass RLS
│   │   │
│   │   └── middleware.ts
│   │         Logic bảo vệ routes: kiểm tra user, kiểm tra role admin
│   │         Được gọi từ middleware.ts gốc
│   │
│   ├── cart-store.ts
│   │     Zustand store quản lý giỏ hàng
│   │     Persist vào localStorage (giữ sau khi đóng tab)
│   │     Functions: addItem, removeItem, updateQuantity, clearCart, total, count
│   │
│   └── utils.ts
│         Helper functions:
│         - cn(): merge Tailwind classes
│         - formatPrice(): định dạng tiền VND
│         - formatDate(): định dạng ngày tiếng Việt
│         - slugify(): chuyển text thành URL slug
│         - ORDER_STATUS_LABELS, ORDER_STATUS_COLORS: mapping trạng thái đơn hàng
│
│
├── 📁 supabase/migrations/
│   ├── 001_init.sql  ⭐ PHẢI CHẠY TRƯỚC
│   │     Tạo toàn bộ schema database:
│   │     - Bảng: profiles, categories, products, orders, order_items, chat_messages
│   │     - Trigger: tự động tạo profile khi user đăng ký
│   │     - RLS policies: bảo mật từng bảng
│   │     - Seed data: 5 danh mục + 6 sản phẩm mẫu
│   │
│   └── 002_blog_testimonials.sql  ⭐ CHẠY SAU
│         Thêm các bảng:
│         - blog_posts: bài viết blog
│         - testimonials: đánh giá khách hàng
│         - subscribers: đăng ký newsletter
│         - contact_messages: tin nhắn liên hệ
│         - Seed: 4 bài viết + 6 đánh giá mẫu
│
│
├── 📁 app/  (Next.js App Router — mỗi folder = một route)
│   │
│   ├── 📄 layout.tsx  ⭐ ROOT LAYOUT
│   │     Bọc toàn bộ app: font, Navbar, Footer, ChatBot, Toaster
│   │     SEO metadata mặc định
│   │
│   ├── 📄 globals.css
│   │     CSS toàn cục: Tailwind directives, custom components (.btn-primary, .card, .input...)
│   │     CSS variables, scrollbar styling, bg-leaf-pattern
│   │
│   ├── 📄 page.tsx  → Route: /
│   │     Trang chủ: fetch products nổi bật, categories, testimonials, blog posts
│   │     Render: Hero → StatsBanner → Categories → Products → WhyUs → Testimonials → Blog → Newsletter
│   │
│   ├── 📄 not-found.tsx  → Route: 404
│   │     Trang 404 đẹp với links về trang chủ, sản phẩm, tìm kiếm
│   │
│   ├── 📄 loading.tsx
│   │     Skeleton loading tự động hiện khi page đang load
│   │
│   ├── 📁 products/
│   │   ├── page.tsx  → Route: /products
│   │   │     Danh sách sản phẩm: filter theo category, tìm kiếm, sort
│   │   │     Đọc searchParams từ URL (?category=zen&search=...)
│   │   │
│   │   └── [slug]/
│   │       ├── page.tsx  → Route: /products/ten-san-pham
│   │       │     Fetch sản phẩm theo slug + sản phẩm liên quan
│   │       │     generateMetadata: SEO tự động
│   │       │
│   │       └── ProductDetailClient.tsx
│   │             Client component: gallery ảnh, chọn số lượng, thêm giỏ hàng
│   │
│   ├── 📁 cart/
│   │   └── page.tsx  → Route: /cart
│   │         Client component: hiển thị giỏ hàng từ Zustand store
│   │         Tính phí ship, tổng tiền
│   │
│   ├── 📁 checkout/
│   │   └── page.tsx  → Route: /checkout
│   │         Form thông tin giao hàng
│   │         Tạo order + order_items trong Supabase
│   │         Redirect đến /auth/login nếu chưa đăng nhập
│   │
│   ├── 📁 orders/
│   │   └── page.tsx  → Route: /orders
│   │         Server Component: fetch đơn hàng của user hiện tại
│   │         Redirect nếu chưa đăng nhập
│   │
│   ├── 📁 profile/
│   │   ├── page.tsx  → Route: /profile
│   │   │     Server: fetch profile + đếm đơn hàng
│   │   │
│   │   └── ProfileClient.tsx
│   │         Client: form chỉnh sửa tên, SĐT, địa chỉ
│   │         Tab navigation: Thông tin / Đơn hàng / Admin
│   │
│   ├── 📁 blog/
│   │   ├── page.tsx  → Route: /blog
│   │   │     Danh sách bài viết: featured post lớn + grid bài thường
│   │   │     Filter theo tag
│   │   │
│   │   └── [slug]/
│   │       └── page.tsx  → Route: /blog/ten-bai-viet
│   │             Chi tiết bài viết: render markdown đơn giản
│   │             Sidebar: bài liên quan, tags phổ biến
│   │             Tự động tăng views mỗi lần đọc
│   │
│   ├── 📁 about/
│   │   └── page.tsx  → Route: /about
│   │         Trang Về chúng tôi: story, values, timeline, team, CTA
│   │
│   ├── 📁 contact/
│   │   └── page.tsx  → Route: /contact
│   │         Form liên hệ → lưu vào bảng contact_messages
│   │         Thông tin địa chỉ, Google Maps embed
│   │         FAQ accordion
│   │
│   ├── 📁 search/
│   │   └── page.tsx  → Route: /search?q=...
│   │         Tìm kiếm toàn site: products + blog posts
│   │         Quick suggestions khi chưa nhập
│   │
│   ├── 📁 auth/
│   │   ├── login/page.tsx  → Route: /auth/login
│   │   │     Email/password + Google OAuth
│   │   │     Hỗ trợ redirect sau khi đăng nhập
│   │   │
│   │   └── register/page.tsx  → Route: /auth/register
│   │         Đăng ký với email hoặc Google
│   │
│   ├── 📁 api/
│   │   ├── chat/route.ts  → POST /api/chat
│   │   │     Nhận messages → gọi Claude API → trả về phản hồi
│   │   │     System prompt: tư vấn viên tiểu cảnh
│   │   │
│   │   └── auth/callback/route.ts  → GET /api/auth/callback
│   │         Xử lý OAuth callback từ Google
│   │         Exchange code lấy session → redirect về app
│   │
│   └── 📁 admin/  (Chỉ admin mới truy cập được)
│       ├── layout.tsx
│       │     Kiểm tra quyền admin → redirect nếu không phải
│       │     Render AdminSidebar + content
│       │
│       ├── page.tsx  → Route: /admin
│       │     Dashboard: thống kê tổng quan + đơn hàng gần đây
│       │
│       ├── products/
│       │   ├── page.tsx  → /admin/products
│       │   │     Server: fetch products + categories
│       │   └── AdminProductsClient.tsx
│       │         CRUD sản phẩm: thêm/sửa/xoá, toggle active/featured
│       │         Modal form đầy đủ fields
│       │
│       ├── categories/
│       │   ├── page.tsx  → /admin/categories
│       │   └── AdminCategoriesClient.tsx
│       │         CRUD danh mục: card layout, đếm sản phẩm theo danh mục
│       │
│       ├── orders/
│       │   ├── page.tsx  → /admin/orders
│       │   └── AdminOrdersClient.tsx
│       │         Xem tất cả đơn hàng, filter theo trạng thái
│       │         Modal chi tiết đơn + nút cập nhật trạng thái
│       │
│       ├── blog/
│       │   ├── page.tsx  → /admin/blog
│       │   └── AdminBlogClient.tsx
│       │         CRUD bài viết: editor với preview mode
│       │         Hỗ trợ markdown đơn giản (## H2, - list...)
│       │         Toggle published/draft
│       │
│       ├── users/
│       │   ├── page.tsx  → /admin/users
│       │   └── AdminUsersClient.tsx
│       │         Xem danh sách users, cấp/thu hồi quyền admin
│       │
│       ├── messages/
│       │   ├── page.tsx  → /admin/messages
│       │   └── AdminMessagesClient.tsx
│       │         Xem tin nhắn liên hệ, đánh dấu đã đọc, xoá, reply qua email
│       │
│       └── subscribers/
│           └── page.tsx  → /admin/subscribers
│                 Danh sách email newsletter, nút gửi email trực tiếp
│
│
├── 📁 components/
│   ├── 📁 layout/  (Các block lớn dùng trên nhiều trang)
│   │   ├── Navbar.tsx
│   │   │     Thanh điều hướng: logo, nav links, tìm kiếm, giỏ hàng, user menu
│   │   │     Responsive mobile drawer, sticky scroll effect
│   │   │
│   │   ├── Footer.tsx
│   │   │     Footer 4 cột: logo, links, account, liên hệ, social
│   │   │
│   │   ├── HeroSection.tsx
│   │   │     Banner trang chủ: headline, CTA buttons, collage 4 ảnh
│   │   │
│   │   ├── StatsBanner.tsx
│   │   │     Dải thống kê: 500+ sản phẩm, 2000+ khách...
│   │   │
│   │   ├── CategoriesSection.tsx
│   │   │     Grid emoji danh mục, link filter products
│   │   │
│   │   ├── FeaturedProducts.tsx
│   │   │     Grid sản phẩm nổi bật trang chủ
│   │   │
│   │   ├── WhyUs.tsx
│   │   │     4 lý do chọn shop: nguyên liệu, ship, bảo hành, chatbot AI
│   │   │
│   │   ├── TestimonialsSection.tsx
│   │   │     Grid đánh giá 5 sao từ database testimonials
│   │   │
│   │   ├── BlogPreview.tsx
│   │   │     Preview 3 bài blog mới nhất trên trang chủ
│   │   │
│   │   └── NewsletterSection.tsx
│   │         Form đăng ký email → lưu vào bảng subscribers
│   │
│   ├── 📁 ui/
│   │   └── ProductCard.tsx
│   │         Card sản phẩm dùng ở khắp nơi
│   │         Hiển thị ảnh, tên, giá, badge, nút thêm giỏ hàng
│   │
│   ├── 📁 chat/
│   │   └── ChatBot.tsx
│   │         Widget chat nổi góc phải màn hình
│   │         Gọi /api/chat, quick reply buttons, typing indicator
│   │
│   └── 📁 admin/
│       └── AdminSidebar.tsx
│             Sidebar điều hướng admin: desktop fixed + mobile drawer
│             8 menu: Dashboard, Sản phẩm, Danh mục, Đơn hàng, Blog, Users, Tin nhắn, Newsletter
```

---

## 3. CÀI ĐẶT TỪNG BƯỚC

### Bước 1: Giải nén và cài dependencies

```bash
# Giải nén file ZIP
unzip tieu-canh-shop.zip
cd tieu-canh

# Cài tất cả packages
npm install
# (Thời gian: 1-3 phút tùy mạng)
```

### Bước 2: Tạo file biến môi trường

```bash
cp .env.example .env.local
```

Mở file `.env.local` bằng text editor bất kỳ:
```
NEXT_PUBLIC_SUPABASE_URL=          ← điền vào bước 4
NEXT_PUBLIC_SUPABASE_ANON_KEY=     ← điền vào bước 4
SUPABASE_SERVICE_ROLE_KEY=         ← điền vào bước 4
ANTHROPIC_API_KEY=                 ← điền vào bước 6
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 4. CẤU HÌNH SUPABASE

### 4a. Tạo project Supabase

1. Vào **[supabase.com](https://supabase.com)** → Sign up (miễn phí)
2. Click **"New project"**
3. Chọn tên project: `tieu-canh-shop`
4. Đặt **Database Password** (ghi nhớ lại)
5. Chọn Region: **Southeast Asia (Singapore)**
6. Click **"Create new project"** → đợi ~2 phút

### 4b. Lấy API Keys

1. Trong Supabase Dashboard → **Settings** (icon bánh răng góc trái dưới)
2. Click **"API"**
3. Copy các giá trị sau vào `.env.local`:

```
Project URL            → NEXT_PUBLIC_SUPABASE_URL
anon (public) key      → NEXT_PUBLIC_SUPABASE_ANON_KEY
service_role (secret)  → SUPABASE_SERVICE_ROLE_KEY
```

⚠️ **KHÔNG commit `SUPABASE_SERVICE_ROLE_KEY` lên git công khai!**

### 4c. Chạy SQL Migration

1. Trong Supabase → **SQL Editor** (icon terminal bên trái)
2. Click **"New query"**
3. Copy toàn bộ nội dung file `supabase/migrations/001_init.sql`
4. Paste vào editor → Click **"Run"** (F5)
5. Thấy "Success. No rows returned" → OK
6. Tạo query mới → paste `supabase/migrations/002_blog_testimonials.sql` → Run

✅ Database giờ đã có đầy đủ bảng + dữ liệu mẫu!

### 4d. Kiểm tra data

Vào **Table Editor** → bạn sẽ thấy:
- `categories`: 5 danh mục
- `products`: 6 sản phẩm mẫu
- `blog_posts`: 4 bài viết
- `testimonials`: 6 đánh giá

---

## 5. CẤU HÌNH GOOGLE OAUTH

### 5a. Bật Google Provider trong Supabase

1. Supabase → **Authentication** → **Providers**
2. Tìm **Google** → Toggle **Enable**
3. Để nguyên chưa điền (làm bước 5b trước)

### 5b. Tạo Google OAuth Credentials

1. Vào **[console.cloud.google.com](https://console.cloud.google.com)**
2. Tạo project mới hoặc chọn project sẵn có
3. Menu → **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. Application type: **Web application**
6. Name: `Tieu Canh Viet`
7. **Authorized redirect URIs** → Add URI:
   ```
   https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback
   ```
   *(Lấy PROJECT-ID từ URL Supabase dashboard của bạn)*
8. Click **Create** → Copy **Client ID** và **Client Secret**

### 5c. Điền vào Supabase

Quay lại Supabase → Authentication → Providers → Google:
- Client ID: dán vào
- Client Secret: dán vào
- Click **Save**

---

## 6. LẤY ANTHROPIC API KEY

1. Vào **[console.anthropic.com](https://console.anthropic.com)**
2. Đăng ký / đăng nhập
3. **API Keys** → **Create Key**
4. Copy key → dán vào `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-...
   ```

> ℹ️ Chatbot sẽ không hoạt động nếu thiếu key này, nhưng app vẫn chạy bình thường.

---

## 7. CHẠY DỰ ÁN

```bash
# Chạy development server
npm run dev
```

Mở trình duyệt: **[http://localhost:3000](http://localhost:3000)**

### Các lệnh khác:

```bash
npm run build    # Build production (kiểm tra lỗi TypeScript)
npm run start    # Chạy production sau khi build
npm run lint     # Kiểm tra lỗi ESLint
```

---

## 8. DEPLOY LÊN VERCEL

### Cách 1: Qua Vercel CLI (nhanh nhất)

```bash
# Cài Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (lần đầu sẽ hỏi cấu hình)
vercel

# Sau khi có production URL, deploy production
vercel --prod
```

### Cách 2: Kết nối GitHub (recommended)

1. Push code lên GitHub repository
2. Vào **[vercel.com](https://vercel.com)** → **New Project**
3. Import repo từ GitHub
4. Vercel tự detect Next.js → click **Deploy**

### Thêm Environment Variables trên Vercel

Vào Vercel Dashboard → Project → **Settings** → **Environment Variables**:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase của bạn |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key |
| `ANTHROPIC_API_KEY` | sk-ant-... |
| `NEXT_PUBLIC_APP_URL` | https://your-app.vercel.app |

### Sau khi deploy, cập nhật:

**Supabase** → Authentication → URL Configuration:
```
Site URL:         https://your-app.vercel.app
Redirect URLs:    https://your-app.vercel.app/api/auth/callback
```

**Google Console** → Authorized redirect URIs → thêm:
```
https://[SUPABASE-PROJECT].supabase.co/auth/v1/callback
```

---

## 9. TẠO TÀI KHOẢN ADMIN

Sau khi app chạy:

1. Đăng ký tài khoản tại `/auth/register`
2. Vào **Supabase** → **Table Editor** → bảng `profiles`
3. Tìm row với email của bạn
4. Click vào ô `role` → đổi từ `customer` thành `admin`
5. Click **Save**
6. Truy cập `/admin` → bạn sẽ thấy toàn bộ admin panel!

---

## 10. TROUBLESHOOTING

### Lỗi: "Cannot find module '@/...'"
```bash
# Kiểm tra tsconfig.json có paths: {"@/*": ["./*"]}
cat tsconfig.json
```

### Lỗi: "Invalid Supabase URL"
- Kiểm tra `.env.local` đã điền đúng `NEXT_PUBLIC_SUPABASE_URL`
- URL phải có dạng: `https://xxxx.supabase.co`
- Restart dev server sau khi sửa `.env.local`

### Lỗi khi chạy SQL migration
- Đảm bảo chạy `001_init.sql` trước `002_blog_testimonials.sql`
- Nếu bị lỗi "already exists", thêm `IF NOT EXISTS` hoặc xoá bảng cũ

### Giỏ hàng không lưu
- Kiểm tra localStorage: mở DevTools → Application → Local Storage
- Key: `tieu-canh-cart`

### Chatbot không phản hồi
- Kiểm tra `ANTHROPIC_API_KEY` trong `.env.local`
- Kiểm tra console: `npm run dev` sẽ log lỗi nếu có

### Google OAuth không hoạt động
- Kiểm tra Redirect URI trong Google Console khớp với Supabase project ID
- Kiểm tra Supabase → Auth → Providers → Google đã Enable
- Sau deploy production: cập nhật Site URL trong Supabase

---

## TỔNG KẾT CÁC TRANG

| Route | Trang | Yêu cầu đăng nhập |
|---|---|---|
| `/` | Trang chủ | Không |
| `/products` | Danh sách sản phẩm | Không |
| `/products/[slug]` | Chi tiết sản phẩm | Không |
| `/cart` | Giỏ hàng | Không |
| `/blog` | Blog listing | Không |
| `/blog/[slug]` | Chi tiết bài blog | Không |
| `/about` | Về chúng tôi | Không |
| `/contact` | Liên hệ | Không |
| `/search` | Tìm kiếm | Không |
| `/checkout` | Thanh toán | **Có** |
| `/orders` | Đơn hàng của tôi | **Có** |
| `/profile` | Hồ sơ cá nhân | **Có** |
| `/auth/login` | Đăng nhập | Không |
| `/auth/register` | Đăng ký | Không |
| `/admin` | Dashboard quản trị | **Admin** |
| `/admin/products` | Quản lý sản phẩm | **Admin** |
| `/admin/categories` | Quản lý danh mục | **Admin** |
| `/admin/orders` | Quản lý đơn hàng | **Admin** |
| `/admin/blog` | Quản lý blog | **Admin** |
| `/admin/users` | Quản lý users | **Admin** |
| `/admin/messages` | Tin nhắn liên hệ | **Admin** |
| `/admin/subscribers` | Newsletter | **Admin** |
