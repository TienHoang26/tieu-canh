# 🌿 Tiểu Cảnh Việt — Full-stack E-commerce

> Next.js 14 · App Router · Supabase · Tailwind CSS · Claude AI Chatbot · Vercel

---

## ✨ Tính năng

| Tính năng | Chi tiết |
|---|---|
| 🛍️ **Shop** | Danh sách sản phẩm, lọc theo danh mục, tìm kiếm, chi tiết sản phẩm |
| 🛒 **Giỏ hàng** | Thêm/xoá/cập nhật số lượng, persist localStorage |
| 💳 **Checkout** | Form giao hàng, tạo đơn, COD |
| 🔐 **Auth** | Email/password + **Google OAuth**, đăng ký, đăng nhập |
| 🤖 **Chatbot AI** | Claude-powered, tư vấn sản phẩm & chăm sóc cây 24/7 |
| 📦 **Đơn hàng** | Xem lịch sử đơn theo user |
| 🔧 **Admin** | Dashboard thống kê, CRUD sản phẩm, quản lý đơn hàng, quản lý users |
| 🚀 **Deploy** | Vercel 1 lệnh |

---

## 🏗️ Tech Stack

- **Framework**: Next.js 14 + App Router + TypeScript
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **Styling**: Tailwind CSS + custom design system
- **State**: Zustand (cart persist)
- **AI Chatbot**: Anthropic Claude API
- **Deploy**: Vercel

---

## 🚀 Cài đặt & Chạy

### 1. Clone & cài dependencies

```bash
git clone <your-repo>
cd tieu-canh
npm install
```

### 2. Tạo project Supabase

1. Vào [supabase.com](https://supabase.com) → New project
2. Vào **SQL Editor** → paste toàn bộ nội dung file `supabase/migrations/001_init.sql` → Run

### 3. Bật Google OAuth trong Supabase

1. **Authentication → Providers → Google** → Enable
2. Tạo Google OAuth credentials tại [console.cloud.google.com](https://console.cloud.google.com)
3. Authorized redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
4. Dán Client ID và Client Secret vào Supabase

### 4. Cấu hình biến môi trường

```bash
cp .env.example .env.local
```

Điền vào `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Lấy keys**: Supabase Dashboard → Project Settings → API

### 5. Chạy dev

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

### 6. Tạo tài khoản Admin

Sau khi đăng ký tài khoản, vào Supabase → Table Editor → `profiles` → tìm user của bạn → đổi `role` thành `admin`.

---

## 🚀 Deploy lên Vercel

```bash
# Cài Vercel CLI
npm i -g vercel

# Deploy
vercel

# Thêm env vars trên Vercel dashboard hoặc:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ANTHROPIC_API_KEY
vercel env add NEXT_PUBLIC_APP_URL
```

Sau khi có production URL, cập nhật:
- Supabase → Authentication → URL Configuration → Site URL = `https://your-app.vercel.app`
- Supabase → Authentication → URL Configuration → Redirect URLs = `https://your-app.vercel.app/api/auth/callback`
- Google OAuth → Authorized redirect URIs (thêm production URI)

---

## 📁 Cấu trúc dự án

```
tieu-canh/
├── app/
│   ├── page.tsx                 # Trang chủ
│   ├── products/
│   │   ├── page.tsx             # Danh sách sản phẩm
│   │   └── [slug]/page.tsx      # Chi tiết sản phẩm
│   ├── cart/page.tsx            # Giỏ hàng
│   ├── checkout/page.tsx        # Thanh toán
│   ├── orders/page.tsx          # Đơn hàng của tôi
│   ├── auth/
│   │   ├── login/page.tsx       # Đăng nhập
│   │   └── register/page.tsx    # Đăng ký
│   ├── admin/
│   │   ├── page.tsx             # Dashboard
│   │   ├── products/            # Quản lý sản phẩm
│   │   ├── orders/              # Quản lý đơn hàng
│   │   └── users/               # Quản lý người dùng
│   └── api/
│       ├── chat/route.ts        # Chatbot API (Claude)
│       └── auth/callback/       # OAuth callback
├── components/
│   ├── layout/                  # Navbar, Footer, Hero, ...
│   ├── ui/                      # ProductCard, ...
│   ├── chat/                    # ChatBot widget
│   └── admin/                   # AdminSidebar
├── lib/
│   ├── supabase/                # client, server, middleware
│   ├── cart-store.ts            # Zustand cart
│   └── utils.ts                 # Helpers
├── types/index.ts               # TypeScript types
└── supabase/migrations/         # SQL schema + seed data
```

---

## 🎨 Design System

- **Font display**: Playfair Display (headings)
- **Font body**: Lato
- **Primary color**: `moss` (xanh rêu) — `#3d8b40`
- **Secondary**: `earth` (nâu đất) — `#a47038`

---

## 📝 Mở rộng

- [ ] Upload ảnh Supabase Storage
- [ ] Tìm kiếm Algolia / Supabase full-text
- [ ] Thanh toán VNPay / MoMo
- [ ] Email thông báo đơn hàng (Resend)
- [ ] Review & đánh giá sản phẩm
- [ ] Wishlist / yêu thích
- [ ] PWA mobile app
