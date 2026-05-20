import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ui/ProductCard'
import { SlidersHorizontal } from 'lucide-react'

interface SearchParams {
  category?: string
  search?: string
  sort?: string
  price?: string
  status?: string
  page?: string
}

const ITEMS_PER_PAGE = 9

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient()

  const currentPage = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  let query = supabase
    .from('products')
    .select('*, category:categories(name, slug)', { count: 'exact' })
    .eq('active', true)

  // Filter: category
  if (searchParams.category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', searchParams.category)
      .single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  // Filter: search
  if (searchParams.search) {
    query = query.ilike('name', `%${searchParams.search}%`)
  }

  // Filter: price range
  if (searchParams.price) {
    switch (searchParams.price) {
      case 'u500':   query = query.lt('price', 500000); break
      case '500-1m': query = query.gte('price', 500000).lte('price', 1000000); break
      case '1m-3m':  query = query.gt('price', 1000000).lte('price', 3000000); break
      case 'o3m':    query = query.gt('price', 3000000); break
    }
  }

  // Filter: status
  if (searchParams.status === 'sale')     query = query.not('sale_price', 'is', null)
  if (searchParams.status === 'featured') query = query.eq('featured', true)
  if (searchParams.status === 'instock')  query = query.gt('stock', 0)

  // Sort
  switch (searchParams.sort) {
    case 'price_asc':  query = query.order('price', { ascending: true }); break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    case 'newest':     query = query.order('created_at', { ascending: false }); break
    case 'bestsell':   query = query.order('sold_count', { ascending: false }); break
    case 'featured':   query = query.order('featured', { ascending: false }); break
    default: query = query.order('featured', { ascending: false }).order('created_at', { ascending: false })
  }

  const { data: products, error, count } = await query.range(offset, offset + ITEMS_PER_PAGE - 1)
  const { data: categories } = await supabase.from('categories').select('*')

  const totalPages = Math.ceil((count ?? 0) / ITEMS_PER_PAGE)

  function buildUrl(overrides: Record<string, string | undefined>) {
    const base: Record<string, string | undefined> = {
      category: searchParams.category,
      search:   searchParams.search,
      sort:     searchParams.sort,
      price:    searchParams.price,
      status:   searchParams.status,
      page:     searchParams.page,
      ...overrides,
    }
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(base)) {
      if (v) params.set(k, v)
    }
    const str = params.toString()
    return `/products${str ? `?${str}` : ''}`
  }

  const sortOptions = [
    { value: '',          label: 'Mặc định' },
    { value: 'newest',    label: 'Mới nhất' },
    { value: 'price_asc', label: 'Giá tăng dần' },
    { value: 'price_desc',label: 'Giá giảm dần' },
    { value: 'bestsell',  label: 'Bán chạy' },
    { value: 'featured',  label: 'Nổi bật' },
  ]

  const priceOptions = [
    { value: '',      label: 'Tất cả mức giá' },
    { value: 'u500',  label: 'Dưới 500.000đ' },
    { value: '500-1m',label: '500.000 – 1.000.000đ' },
    { value: '1m-3m', label: '1.000.000 – 3.000.000đ' },
    { value: 'o3m',   label: 'Trên 3.000.000đ' },
  ]

  const statusOptions = [
    { value: 'instock',  label: 'Còn hàng' },
    { value: 'sale',     label: 'Đang giảm giá' },
    { value: 'featured', label: 'Sản phẩm nổi bật' },
  ]

  const hasFilters = !!(searchParams.category || searchParams.price || searchParams.status || searchParams.search)

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* ─── SIDEBAR ─── */}
          <aside className="hidden lg:flex flex-col gap-4 w-56 shrink-0">

            {/* Danh mục */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
                Danh mục
              </p>
              <div className="space-y-0.5">
                <a
                  href={buildUrl({ category: undefined, page: '1' })}
                  className={`block px-3 py-2 rounded-xl text-sm transition-colors ${
                    !searchParams.category
                      ? 'bg-moss-600 text-white font-medium'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                  }`}
                >
                  Tất cả
                </a>
                {categories?.map(cat => (
                  <a
                    key={cat.id}
                    href={buildUrl({ category: cat.slug, page: '1' })}
                    className={`block px-3 py-2 rounded-xl text-sm transition-colors ${
                      searchParams.category === cat.slug
                        ? 'bg-moss-600 text-white font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                    }`}
                  >
                    {cat.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Khoảng giá */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
                Khoảng giá
              </p>
              <div className="space-y-0.5">
                {priceOptions.map(opt => (
                  <a
                    key={opt.value}
                    href={buildUrl({ price: opt.value || undefined, page: '1' })}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                      (searchParams.price ?? '') === opt.value
                        ? 'bg-moss-600 text-white font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full border-2 shrink-0 ${
                        (searchParams.price ?? '') === opt.value
                          ? 'border-white bg-white'
                          : 'border-stone-300'
                      }`}
                    />
                    {opt.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Tình trạng */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
                Tình trạng
              </p>
              <div className="space-y-0.5">
                {statusOptions.map(opt => (
                  <a
                    key={opt.value}
                    href={buildUrl({
                      status: searchParams.status === opt.value ? undefined : opt.value,
                      page: '1',
                    })}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                      searchParams.status === opt.value
                        ? 'bg-moss-600 text-white font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded border-2 shrink-0 ${
                        searchParams.status === opt.value
                          ? 'border-white bg-white'
                          : 'border-stone-300'
                      }`}
                    />
                    {opt.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Xóa bộ lọc */}
            {hasFilters && (
              <a
                href="/products"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-500 hover:border-moss-300 hover:text-moss-700 transition-colors bg-white"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Xóa bộ lọc
              </a>
            )}
          </aside>

          {/* ─── CONTENT ─── */}
          <div className="flex-1 min-w-0">

            {/* Sort tabs */}
            <div className="bg-white rounded-2xl border border-stone-100 px-4 py-3 mb-5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide mr-1 hidden sm:block">
                Sắp xếp:
              </span>
              {sortOptions.map(opt => (
                <a
                  key={opt.value}
                  href={buildUrl({ sort: opt.value || undefined, page: '1' })}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                    (searchParams.sort ?? '') === opt.value
                      ? 'bg-moss-600 text-white'
                      : 'bg-white border border-stone-200 text-stone-600 hover:border-moss-300 hover:text-moss-700'
                  }`}
                >
                  {opt.label}
                </a>
              ))}
            </div>

            {/* Active filter tags */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {searchParams.category && (
                  <a
                    href={buildUrl({ category: undefined, page: '1' })}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-moss-50 border border-moss-200 text-moss-700 text-xs font-medium hover:bg-moss-100 transition-colors"
                  >
                    {categories?.find(c => c.slug === searchParams.category)?.name}
                    <span className="text-moss-400 text-sm leading-none">×</span>
                  </a>
                )}
                {searchParams.search && (
                  <a
                    href={buildUrl({ search: undefined, page: '1' })}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-moss-50 border border-moss-200 text-moss-700 text-xs font-medium hover:bg-moss-100 transition-colors"
                  >
                    "{searchParams.search}"
                    <span className="text-moss-400 text-sm leading-none">×</span>
                  </a>
                )}
                {searchParams.price && (
                  <a
                    href={buildUrl({ price: undefined, page: '1' })}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-moss-50 border border-moss-200 text-moss-700 text-xs font-medium hover:bg-moss-100 transition-colors"
                  >
                    {priceOptions.find(p => p.value === searchParams.price)?.label}
                    <span className="text-moss-400 text-sm leading-none">×</span>
                  </a>
                )}
                {searchParams.status && (
                  <a
                    href={buildUrl({ status: undefined, page: '1' })}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-moss-50 border border-moss-200 text-moss-700 text-xs font-medium hover:bg-moss-100 transition-colors"
                  >
                    {statusOptions.find(s => s.value === searchParams.status)?.label}
                    <span className="text-moss-400 text-sm leading-none">×</span>
                  </a>
                )}
              </div>
            )}

            {/* Product grid */}
            {products && products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10 pt-8 border-t border-stone-100">
                    {currentPage > 1 ? (
                      <a
                        href={buildUrl({ page: String(currentPage - 1) })}
                        className="flex items-center justify-center w-9 h-9 rounded-xl border border-stone-200 bg-white text-stone-500 hover:border-moss-300 hover:text-moss-700 transition-colors text-base"
                      >
                        ‹
                      </a>
                    ) : (
                      <span className="flex items-center justify-center w-9 h-9 rounded-xl border border-stone-100 text-stone-300 text-base cursor-not-allowed">
                        ‹
                      </span>
                    )}

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      const showEllipsisBefore = page === 3 && currentPage > 4
                      const showEllipsisAfter  = page === totalPages - 2 && currentPage < totalPages - 3
                      const isVisible =
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1

                      if (!isVisible && !showEllipsisBefore && !showEllipsisAfter) return null

                      if (showEllipsisBefore || showEllipsisAfter) {
                        return (
                          <span key={`ellipsis-${page}`} className="w-9 h-9 flex items-center justify-center text-stone-400 text-sm">
                            …
                          </span>
                        )
                      }

                      return (
                        <a
                          key={page}
                          href={buildUrl({ page: String(page) })}
                          className={`flex items-center justify-center w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                            page === currentPage
                              ? 'bg-moss-600 text-white'
                              : 'bg-white border border-stone-200 text-stone-600 hover:border-moss-300 hover:text-moss-700'
                          }`}
                        >
                          {page}
                        </a>
                      )
                    })}

                    {currentPage < totalPages ? (
                      <a
                        href={buildUrl({ page: String(currentPage + 1) })}
                        className="flex items-center justify-center w-9 h-9 rounded-xl border border-stone-200 bg-white text-stone-500 hover:border-moss-300 hover:text-moss-700 transition-colors text-base"
                      >
                        ›
                      </a>
                    ) : (
                      <span className="flex items-center justify-center w-9 h-9 rounded-xl border border-stone-100 text-stone-300 text-base cursor-not-allowed">
                        ›
                      </span>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">🌱</div>
                <h3 className="font-display text-xl font-bold text-stone-700 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-stone-500 mb-4">Thử tìm kiếm với từ khoá khác hoặc xem tất cả sản phẩm</p>
                <a href="/products" className="btn-primary inline-flex items-center">Xem tất cả</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}