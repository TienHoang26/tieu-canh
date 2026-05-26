'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export default function ProductSort({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const router = useRouter()
  const pathname = usePathname()

  const go = useCallback((overrides: Record<string, string | undefined>) => {
    const base = { ...searchParams, ...overrides }
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(base)) {
      if (v) params.set(k, v)
    }
    const str = params.toString()
    router.push(`${pathname}${str ? `?${str}` : ''}`, { scroll: false })
  }, [searchParams, pathname, router])

  const sortOptions = [
    { value: '',           label: 'Mặc định' },
    { value: 'newest',     label: 'Mới nhất' },
    { value: 'price_asc',  label: 'Giá tăng dần' },
    { value: 'price_desc', label: 'Giá giảm dần' },
    { value: 'bestsell',   label: 'Bán chạy' },
    { value: 'featured',   label: 'Nổi bật' },
  ]

  return (
    <div className="bg-white rounded-2xl border border-stone-100 px-4 py-3 mb-5 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide mr-1 hidden sm:block">Sắp xếp:</span>
      {sortOptions.map(opt => (
        <button
          key={opt.value}
          onClick={() => go({ sort: opt.value || undefined, page: '1' })}
          className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            (searchParams.sort ?? '') === opt.value
              ? 'bg-moss-600 text-white'
              : 'bg-white border border-stone-200 text-stone-600 hover:border-moss-300 hover:text-moss-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}