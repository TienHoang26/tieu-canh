'use client'

import Link from 'next/link'
import { ShoppingCart, Heart, Star } from 'lucide-react'
import { useCart } from '@/lib/cart-store'
import { formatPrice, cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCart(s => s.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock === 0) return
    addItem(product)
    toast.success(`Đã thêm "${product.name}" vào giỏ!`)
  }

  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'
  const discount = product.sale_price
    ? Math.round((1 - product.sale_price / product.price) * 100)
    : 0

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-stone-50">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.featured && (
              <span className="badge bg-earth-500 text-white">
                <Star className="w-3 h-3 fill-current" /> Nổi bật
              </span>
            )}
            {discount > 0 && (
              <span className="badge bg-red-500 text-white">-{discount}%</span>
            )}
            {product.stock === 0 && (
              <span className="badge bg-stone-500 text-white">Hết hàng</span>
            )}
          </div>
          {/* Wishlist */}
          <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-red-500">
            <Heart className="w-4 h-4" />
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

          <div className="flex items-center justify-between gap-2">
            <div>
              {product.sale_price ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-moss-700 text-lg">{formatPrice(product.sale_price)}</span>
                  <span className="text-sm text-stone-400 line-through">{formatPrice(product.price)}</span>
                </div>
              ) : (
                <span className="font-bold text-stone-800 text-lg">{formatPrice(product.price)}</span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                product.stock > 0
                  ? 'bg-moss-600 hover:bg-moss-700 text-white active:scale-90'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              )}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>

          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-xs text-orange-500 mt-1.5 font-medium">
              Chỉ còn {product.stock} sản phẩm
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
