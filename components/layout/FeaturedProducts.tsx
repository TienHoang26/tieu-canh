'use client'

import Link from 'next/link'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'
import type { Product } from '@/types'
import { useRef, useState, useEffect } from 'react'

export default function FeaturedProducts({ products }: { products: Product[] }) {
  const featured = products.filter(p => p.featured).slice(0, 8)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    el?.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)
    return () => {
      el?.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [featured])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.85
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' })
  }

  return (
    <section className="py-20 bg-stone-50 bg-leaf-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div
          className="relative border-4 border-moss-600 rounded-2xl bg-white px-6 pt-12 pb-8"
          style={{
            boxShadow: `
              5px 5px 0 #2d7a3a,
              10px 10px 0 rgba(76,175,80,0.3),
              15px 15px 0 rgba(45,122,58,0.12),
              0 24px 60px rgba(45,122,58,0.10)
            `,
          }}
        >
          {/* Badge */}
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap
              bg-moss-600 text-white text-lg font-bold tracking-widest uppercase
              px-10 py-3 rounded-full border-2 border-moss-400"
            style={{ boxShadow: '0 4px 16px rgba(45,122,58,0.4), 0 2px 0 #1a5227' }}
          >
            ⭐ Sản phẩm nổi bật tuần này
          </div>

          {featured.length > 0 ? (
            <div className="relative">
              <div
                ref={scrollRef}
                className="grid grid-rows-1 grid-flow-col auto-cols-[calc(25%-12px)] gap-4 lg:gap-5 overflow-x-auto scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {featured.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {canScrollLeft && (
                <button
                  onClick={() => scroll('left')}
                  className="absolute -left-5 top-1/2 -translate-y-1/2 z-10
                    w-10 h-10 rounded-full bg-moss-600 text-white shadow-lg
                    flex items-center justify-center hover:bg-moss-700 transition-colors
                    border-2 border-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {canScrollRight && (
                <button
                  onClick={() => scroll('right')}
                  className="absolute -right-5 top-1/2 -translate-y-1/2 z-10
                    w-10 h-10 rounded-full bg-moss-600 text-white shadow-lg
                    flex items-center justify-center hover:bg-moss-700 transition-colors
                    border-2 border-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-stone-400">
              <p>Chưa có sản phẩm nổi bật</p>
            </div>
          )}
        </div>

      </div>
    </section>
  )
}