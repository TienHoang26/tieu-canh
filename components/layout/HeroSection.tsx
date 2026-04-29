import Link from 'next/link'
import { ArrowRight, Leaf, Sparkles } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-leaf-pattern">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-moss-50 via-white to-earth-50" />

      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-moss-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-earth-200/20 rounded-full blur-3xl" />

      {/* Floating leaves decoration */}
      <div className="absolute top-32 left-1/4 w-3 h-3 bg-moss-400 rounded-full animate-float opacity-60" />
      <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-earth-400 rounded-full animate-float opacity-40" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-32 left-1/3 w-4 h-4 bg-moss-300 rounded-full animate-float opacity-50" style={{ animationDelay: '4s' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-moss-100 text-moss-700 px-4 py-2 rounded-full text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              Nghệ thuật thiên nhiên thu nhỏ
            </div>

            <div>
              <h1 className="font-display text-5xl lg:text-7xl font-bold text-stone-800 leading-tight">
                Mang{' '}
                <span className="text-moss-600 relative">
                  Thiên Nhiên
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                    <path d="M0 4 Q50 8 100 4 Q150 0 200 4" stroke="#5da660" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
                <br />vào Không Gian Sống
              </h1>
              <p className="mt-6 text-xl text-stone-500 font-light leading-relaxed max-w-lg">
                Khám phá bộ sưu tập tiểu cảnh, terrarium, bonsai mini được chế tác thủ công từ nguyên liệu thiên nhiên tự nhiên.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="btn-primary flex items-center gap-2 text-base">
                Khám phá ngay <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/products?category=terrarium" className="btn-outline flex items-center gap-2 text-base">
                <Leaf className="w-5 h-5" /> Terrarium
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              {[
                { value: '500+', label: 'Sản phẩm' },
                { value: '2000+', label: 'Khách hàng' },
                { value: '5★', label: 'Đánh giá' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="font-display text-2xl font-bold text-moss-600">{stat.value}</p>
                  <p className="text-sm text-stone-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Image collage */}
          <div className="relative h-[500px] lg:h-[600px]">
            <div className="absolute inset-0 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-3xl overflow-hidden h-64 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=600"
                    alt="Tiểu cảnh Zen"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden h-48 shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600"
                    alt="Rêu xanh"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="rounded-3xl overflow-hidden h-48 shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1604762524889-3e2fcc145683?w=600"
                    alt="Terrarium"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden h-64 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1599598425947-5202edd56bdb?w=600"
                    alt="Bonsai"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            {/* Badge overlay */}
            <div className="absolute -bottom-4 left-4 bg-white rounded-2xl shadow-xl p-4 border border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-moss-100 rounded-xl flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-moss-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-stone-800">Giao hàng toàn quốc</p>
                  <p className="text-xs text-stone-500">Đóng gói cẩn thận cho cây cảnh</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
