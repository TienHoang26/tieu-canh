import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, ArrowRight } from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'

export const metadata: Metadata = {
  title: 'Tìm kiếm | Tiểu Cảnh Việt',
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim() ?? ''
  const supabase = createClient()

  const { data: products } = q
    ? await supabase.rpc('search_products', { search_query: q })
    : { data: [] }

  const totalResults = products?.length ?? 0

  return (
    <div className="min-h-screen bg-stone-50 pt-20 lg:pt-24">
      {/* Search Bar */}
      <section className="bg-white border-b border-stone-100 py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-stone-800 text-center mb-6">Tìm kiếm</h1>
          <form method="GET" className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Tìm sản phẩm..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-stone-200 focus:outline-none focus:border-moss-500 text-stone-800 text-lg bg-stone-50"
              autoFocus
            />
            <button type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 btn-primary py-2 px-4 text-sm">
              Tìm
            </button>
          </form>
          {q && (
            <p className="text-center text-stone-500 text-sm mt-4">
              {totalResults > 0
                ? <>Tìm thấy <strong className="text-stone-800">{totalResults}</strong> sản phẩm cho "<strong className="text-moss-700">{q}</strong>"</>
                : <>Không tìm thấy sản phẩm nào cho "<strong className="text-stone-800">{q}</strong>"</>}
            </p>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!q ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="font-display text-2xl font-bold text-stone-700 mb-2">Bạn đang tìm gì?</h2>
            <p className="text-stone-500 mb-8">Thử tìm kiếm: tiểu cảnh zen, terrarium, bonsai, rêu nhung...</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {['tiểu cảnh zen', 'terrarium', 'bonsai mini', 'rêu nhung', 'đá suiseki', 'cây cảnh mini'].map(s => (
                <Link key={s} href={`/search?q=${encodeURIComponent(s)}`}
                  className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-600 hover:border-moss-300 hover:text-moss-700 transition-colors capitalize">
                  {s}
                </Link>
              ))}
            </div>
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="font-display text-2xl font-bold text-stone-700 mb-2">Không tìm thấy kết quả</h2>
            <p className="text-stone-500 mb-6">Hãy thử từ khoá khác hoặc xem tất cả sản phẩm của chúng tôi.</p>
            <Link href="/products" className="btn-primary inline-flex items-center gap-2">
              Xem tất cả sản phẩm <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products?.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}