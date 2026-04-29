import Link from 'next/link'
import { Leaf, Home, Search, ShoppingBag } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="text-center max-w-lg mx-auto">
        {/* Decorative */}
        <div className="relative inline-block mb-8">
          <div className="text-[120px] leading-none select-none">🌿</div>
          <div className="absolute -top-2 -right-2 bg-moss-600 text-white font-display font-bold text-2xl w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg rotate-6">
            404
          </div>
        </div>

        <h1 className="font-display text-4xl font-bold text-stone-800 mb-3">
          Trang không tồn tại
        </h1>
        <p className="text-stone-500 text-lg leading-relaxed mb-8">
          Trang bạn đang tìm không tồn tại hoặc đã bị di chuyển. Hãy thử tìm kiếm hoặc quay về trang chủ.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/"
            className="btn-primary flex items-center gap-2">
            <Home className="w-4 h-4" /> Về trang chủ
          </Link>
          <Link href="/products"
            className="btn-outline flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> Xem sản phẩm
          </Link>
          <Link href="/search"
            className="flex items-center gap-2 px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition-colors">
            <Search className="w-4 h-4" /> Tìm kiếm
          </Link>
        </div>
      </div>
    </div>
  )
}
