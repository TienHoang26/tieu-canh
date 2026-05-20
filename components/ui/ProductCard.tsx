'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Heart, Star } from 'lucide-react'
import { useCart } from '@/lib/cart-store'
import { formatPrice, cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

export default function ProductCard({ product }: { product: Product }) {
  const [mounted, setMounted] = useState(false)
  const [wished, setWished] = useState(false)
  const addItem = useCart(s => s.addItem)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock === 0) return
    addItem(product)
    toast.success(`Đã thêm "${product.name}" vào giỏ!`)
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock === 0) return
    addItem(product)
    router.push('/cart')
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!mounted) return
    setWished(prev => !prev)
    toast.success(wished ? `Đã bỏ yêu thích` : `Đã thêm vào yêu thích ❤️`)
  }

  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'
  const discount = product.sale_price
    ? Math.round((1 - product.sale_price / product.price) * 100)
    : 0

  // Render skeleton khi chưa mounted để tránh hydration error
  if (!mounted) {
    return (
      <div className="group">
        <div className="card animate-pulse">
          <div className="aspect-square bg-stone-100 rounded-t-2xl" />
          <div className="p-4 space-y-3">
            <div className="h-3 bg-stone-100 rounded w-1/3" />
            <div className="h-5 bg-stone-100 rounded w-3/4" />
            <div className="h-6 bg-stone-100 rounded w-1/2" />
            <div className="flex gap-2 pt-2">
              <div className="h-9 bg-stone-100 rounded-xl w-9" />
              <div className="h-9 bg-stone-100 rounded-xl flex-1" />
              <div className="h-9 bg-stone-100 rounded-xl flex-1" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-stone-50 rounded-t-2xl">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.featured && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-earth-500 text-white">
                <Star className="w-3 h-3 fill-current" /> Nổi bật
              </span>
            )}
            {discount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                -{discount}%
              </span>
            )}
            {product.stock === 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-stone-500 text-white">
                Hết hàng
              </span>
            )}
          </div>

          {/* Wishlist button - luôn visible để tránh hydration error */}
          <button
            onClick={handleWishlist}
            aria-label={wished ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            className={cn(
              'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
              'opacity-100',
              wished
                ? 'bg-red-50 border border-red-200 text-red-500'
                : 'bg-white/80 backdrop-blur-sm border border-stone-200 text-stone-400 hover:text-red-500 hover:bg-white'
            )}
          >
            <Heart className={cn('w-4 h-4', wished && 'fill-red-500 stroke-red-500')} />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          {product.category && (
            <p className="text-xs text-moss-600 font-semibold uppercase tracking-wide mb-1">
              {(product.category as { name: string }).name}
            </p>
          )}
          <h3 className="font-semibold text-stone-800 line-clamp-2 mb-2 group-hover:text-moss-700 transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Price */}
          <div className="mb-3">
            {product.sale_price ? (
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-moss-700 text-lg">{formatPrice(product.sale_price)}</span>
                <span className="text-sm text-stone-400 line-through">{formatPrice(product.price)}</span>
              </div>
            ) : (
              <span className="font-bold text-stone-800 text-lg">{formatPrice(product.price)}</span>
            )}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-[36px_1fr_1fr] gap-2">
            {/* Giỏ hàng */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              aria-label="Thêm vào giỏ hàng"
              className={cn(
                'h-9 rounded-xl flex items-center justify-center transition-all border',
                product.stock > 0
                  ? 'border-moss-300 text-moss-700 hover:bg-moss-50 hover:border-moss-400 active:scale-95'
                  : 'border-stone-100 text-stone-300 cursor-not-allowed'
              )}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>

            {/* Mua ngay */}
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className={cn(
                'h-9 rounded-xl text-xs font-semibold transition-all active:scale-95',
                product.stock > 0
                  ? 'bg-moss-600 hover:bg-moss-700 text-white'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              )}
            >
              Mua ngay
            </button>

            {/* Xem chi tiết */}
            <Link
              href={`/products/${product.slug}`}
              onClick={e => e.stopPropagation()}
              className="h-9 rounded-xl text-xs font-medium border border-stone-200 text-stone-600 hover:border-moss-300 hover:text-moss-700 flex items-center justify-center transition-all"
            >
              Chi tiết
            </Link>
          </div>

          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-xs text-orange-500 mt-2 font-medium">
              Chỉ còn {product.stock} sản phẩm
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}