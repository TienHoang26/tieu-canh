import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ui/ProductCard'
import { Search } from 'lucide-react'

interface SearchParams {
  category?: string
  search?: string
  sort?: string
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient()

  let query = supabase
    .from('products')
    .select('*, category:categories(name, slug)')
    .eq('active', true)

  if (searchParams.category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', searchParams.category)
      .single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (searchParams.search) {
    query = query.ilike('name', `%${searchParams.search}%`)
  }

  switch (searchParams.sort) {
    case 'price_asc': query = query.order('price', { ascending: true }); break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    case 'newest': query = query.order('created_at', { ascending: false }); break
    default: query = query.order('featured', { ascending: false }).order('created_at', { ascending: false })
  }

  const { data: products } = await query.limit(24)
  const { data: categories } = await supabase.from('categories').select('*')

  return (
    <div className="min-h-screen bg-stone-50 pt-20 lg:pt-24">
      <div className="bg-white border-b border-stone-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-stone-800 mb-4">
            {searchParams.category
              ? categories?.find(c => c.slug === searchParams.category)?.name ?? 'Sản phẩm'
              : 'Tất cả sản phẩm'}
          </h1>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <form method="GET">
              {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
              {searchParams.sort && <input type="hidden" name="sort" value={searchParams.sort} />}
              <div className="relative">
                <input
                  name="search"
                  defaultValue={searchParams.search}
                  placeholder="Tìm sản phẩm..."
                  className="pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-moss-500 bg-white"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              </div>
            </form>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-2">
              <a href="/products"
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${!searchParams.category ? 'bg-moss-600 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-moss-300'}`}>
                Tất cả
              </a>
              {categories?.map(cat => (
                <a key={cat.id}
                  href={`/products?category=${cat.slug}${searchParams.sort ? `&sort=${searchParams.sort}` : ''}`}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${searchParams.category === cat.slug ? 'bg-moss-600 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-moss-300'}`}>
                  {cat.name}
                </a>
              ))}
            </div>

            {/* Sort */}
            <form method="GET" className="ml-auto flex items-center gap-2">
              {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
              {searchParams.search && <input type="hidden" name="search" value={searchParams.search} />}
              <select
                name="sort"
                defaultValue={searchParams.sort ?? ''}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-moss-500 bg-white text-stone-700"
              >
                <option value="">Mặc định</option>
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
              </select>
              <button type="submit" className="px-4 py-2.5 bg-moss-600 text-white rounded-xl text-sm font-medium hover:bg-moss-700 transition-colors">
                Lọc
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products && products.length > 0 ? (
          <>
            <p className="text-sm text-stone-500 mb-6">
              Hiển thị <span className="font-semibold text-stone-800">{products.length}</span> sản phẩm
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
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
  )
}
