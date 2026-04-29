import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'
import type { Product } from '@/types'

export default function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="py-20 bg-stone-50 bg-leaf-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-moss-600 font-semibold text-sm uppercase tracking-widest mb-3">Sản phẩm</p>
            <h2 className="section-title">Nổi bật tuần này</h2>
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-2 text-moss-600 font-semibold hover:text-moss-700 transition-colors">
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-stone-400">
            <p>Chưa có sản phẩm nổi bật</p>
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/products" className="btn-outline inline-flex items-center gap-2">
            Xem tất cả sản phẩm <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
