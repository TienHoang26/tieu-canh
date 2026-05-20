import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'

export const metadata = { title: 'Sản phẩm yêu thích — Tiểu Cảnh Việt' }

export default async function WishlistPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Chưa đăng nhập → chuyển về login
  if (!user) redirect('/auth/login')

  // Lấy wishlist kèm thông tin sản phẩm
  const { data: wishlistRows } = await supabase
    .from('wishlists')
    .select(`
      product_id,
      created_at,
      products (
        *,
        category:categories(name, slug)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const products = wishlistRows
    ?.map(row => row.products)
    .filter(Boolean) ?? []

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/products"
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-stone-200 bg-white text-stone-500 hover:border-moss-300 hover:text-moss-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <h1 className="text-2xl font-bold text-stone-800">Sản phẩm yêu thích</h1>
            </div>
            <p className="text-sm text-stone-500 mt-0.5">
              {products.length > 0
                ? `${products.length} sản phẩm đã lưu`
                : 'Chưa có sản phẩm nào'}
            </p>
          </div>
        </div>

        {/* Nội dung */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5">
              <Heart className="w-10 h-10 text-red-300" />
            </div>
            <h2 className="text-xl font-bold text-stone-700 mb-2">
              Chưa có sản phẩm yêu thích
            </h2>
            <p className="text-stone-500 mb-6 max-w-sm">
              Bấm vào icon ❤️ trên bất kỳ sản phẩm nào để lưu vào danh sách yêu thích của bạn.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-moss-600 text-white text-sm font-semibold hover:bg-moss-700 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Khám phá sản phẩm
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}