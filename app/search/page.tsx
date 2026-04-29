import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, Package, BookOpen, ArrowRight } from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Tìm kiếm | Tiểu Cảnh Việt',
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim() ?? ''
  const supabase = createClient()

  const [{ data: products }, { data: posts }] = q
    ? await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(name,slug)')
          .eq('active', true)
          .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
          .limit(12),
        supabase
          .from('blog_posts')
          .select('id,title,slug,excerpt,cover_image,created_at,tags')
          .eq('published', true)
          .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
          .limit(6),
      ])
    : [{ data: [] }, { data: [] }]

  const totalResults = (products?.length ?? 0) + (posts?.length ?? 0)

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
              placeholder="Tìm sản phẩm, bài viết..."
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
                ? <>Tìm thấy <strong className="text-stone-800">{totalResults}</strong> kết quả cho "<strong className="text-moss-700">{q}</strong>"</>
                : <>Không tìm thấy kết quả nào cho "<strong className="text-stone-800">{q}</strong>"</>}
            </p>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {!q ? (
          /* No query - show suggestions */
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
          <>
            {/* Products Results */}
            {(products?.length ?? 0) > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold text-stone-800 flex items-center gap-2">
                    <Package className="w-6 h-6 text-moss-600" />
                    Sản phẩm
                    <span className="text-lg font-normal text-stone-400">({products?.length})</span>
                  </h2>
                  <Link href={`/products?search=${encodeURIComponent(q)}`}
                    className="text-sm text-moss-600 font-semibold hover:underline flex items-center gap-1">
                    Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {products?.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </section>
            )}

            {/* Blog Results */}
            {(posts?.length ?? 0) > 0 && (
              <section>
                <h2 className="font-display text-2xl font-bold text-stone-800 flex items-center gap-2 mb-6">
                  <BookOpen className="w-6 h-6 text-moss-600" />
                  Bài viết
                  <span className="text-lg font-normal text-stone-400">({posts?.length})</span>
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {posts?.map(post => (
                    <Link key={post.id} href={`/blog/${post.slug}`}
                      className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-lg transition-all">
                      {post.cover_image && (
                        <img src={post.cover_image} alt={post.title}
                          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                      <div className="p-4">
                        <p className="text-xs text-stone-400 mb-2">{formatDate(post.created_at)}</p>
                        <h3 className="font-bold text-stone-800 group-hover:text-moss-700 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-stone-500 line-clamp-2 mt-1">{post.excerpt}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
