'use client'

import { useRouter, usePathname } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'
import { useCallback } from 'react'

interface Category {
  id: string
  name: string
  slug: string
}

interface Props {
  categories: Category[]
  searchParams: Record<string, string | undefined>
}

export default function ProductFilters({ categories, searchParams }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const buildUrl = useCallback((overrides: Record<string, string | undefined>) => {
    const base = { ...searchParams, ...overrides }
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(base)) {
      if (v) params.set(k, v)
    }
    const str = params.toString()
    return `${pathname}${str ? `?${str}` : ''}`
  }, [searchParams, pathname])

  const go = (overrides: Record<string, string | undefined>) => {
    router.push(buildUrl(overrides), { scroll: false })
  }

  const priceOptions = [
    { value: '',       label: 'Tất cả mức giá' },
    { value: 'u500',   label: 'Dưới 500.000đ' },
    { value: '500-1m', label: '500.000 – 1.000.000đ' },
    { value: '1m-3m',  label: '1.000.000 – 3.000.000đ' },
    { value: 'o3m',    label: 'Trên 3.000.000đ' },
  ]

  const statusOptions = [
    { value: 'instock',  label: 'Còn hàng' },
    { value: 'sale',     label: 'Đang giảm giá' },
    { value: 'featured', label: 'Sản phẩm nổi bật' },
  ]

  const hasFilters = !!(searchParams.category || searchParams.price || searchParams.status || searchParams.search)

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-56 shrink-0">

      {/* Danh mục */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Danh mục</p>
        <div className="space-y-0.5">
          <button
            onClick={() => go({ category: undefined, page: '1' })}
            className={`block w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
              !searchParams.category ? 'bg-moss-600 text-white font-medium' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
            }`}
          >
            Tất cả
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => go({ category: cat.slug, page: '1' })}
              className={`block w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                searchParams.category === cat.slug ? 'bg-moss-600 text-white font-medium' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Khoảng giá */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Khoảng giá</p>
        <div className="space-y-0.5">
          {priceOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => go({ price: opt.value || undefined, page: '1' })}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm transition-colors ${
                (searchParams.price ?? '') === opt.value ? 'bg-moss-600 text-white font-medium' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
              }`}
            >
              <span className={`w-3 h-3 rounded-full border-2 shrink-0 ${
                (searchParams.price ?? '') === opt.value ? 'border-white bg-white' : 'border-stone-300'
              }`} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tình trạng */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Tình trạng</p>
        <div className="space-y-0.5">
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => go({ status: searchParams.status === opt.value ? undefined : opt.value, page: '1' })}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm transition-colors ${
                searchParams.status === opt.value ? 'bg-moss-600 text-white font-medium' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
              }`}
            >
              <span className={`w-3 h-3 rounded border-2 shrink-0 ${
                searchParams.status === opt.value ? 'border-white bg-white' : 'border-stone-300'
              }`} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Xóa bộ lọc */}
      {hasFilters && (
        <button
          onClick={() => router.push('/products', { scroll: false })}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-500 hover:border-moss-300 hover:text-moss-700 transition-colors bg-white"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Xóa bộ lọc
        </button>
      )}
    </aside>
  )
}