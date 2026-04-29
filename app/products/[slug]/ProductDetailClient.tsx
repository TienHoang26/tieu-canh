'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Minus, Plus, Truck, Shield, Star, ArrowLeft, Tag } from 'lucide-react'
import { useCart } from '@/lib/cart-store'
import { formatPrice, cn } from '@/lib/utils'
import ProductCard from '@/components/ui/ProductCard'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

export default function ProductDetailClient({ product, related }: { product: Product; related: Product[] }) {
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const addItem = useCart(s => s.addItem)

  const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800']
  const price = product.sale_price ?? product.price
  const discount = product.sale_price ? Math.round((1 - product.sale_price / product.price) * 100) : 0

  const handleAddToCart = () => {
    addItem(product, qty)
    toast.success(`Đã thêm ${qty} "${product.name}" vào giỏ!`)
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-20 lg:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-stone-500 mb-8">
          <Link href="/" className="hover:text-moss-600 transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-moss-600 transition-colors">Sản phẩm</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/products?category=${(product.category as { slug: string }).slug}`}
                className="hover:text-moss-600 transition-colors">
                {(product.category as { name: string }).name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-stone-800 font-medium">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-stone-100 shadow-lg">
              <img src={images[activeImg]} alt={product.name}
                className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={cn('w-20 h-20 rounded-xl overflow-hidden border-2 transition-all',
                      activeImg === i ? 'border-moss-500' : 'border-transparent opacity-60 hover:opacity-100')}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {/* Category & Tags */}
            <div className="flex flex-wrap gap-2">
              {product.category && (
                <span className="badge bg-moss-100 text-moss-700">
                  {(product.category as { name: string }).name}
                </span>
              )}
              {product.featured && (
                <span className="badge bg-earth-100 text-earth-700">
                  <Star className="w-3 h-3 fill-current" /> Nổi bật
                </span>
              )}
            </div>

            <div>
              <h1 className="font-display text-3xl font-bold text-stone-800 mb-3">{product.name}</h1>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-bold text-3xl text-moss-700">{formatPrice(price)}</span>
                {product.sale_price && (
                  <>
                    <span className="text-xl text-stone-400 line-through">{formatPrice(product.price)}</span>
                    <span className="badge bg-red-100 text-red-700">-{discount}%</span>
                  </>
                )}
              </div>
            </div>

            <p className="text-stone-600 leading-relaxed">{product.description}</p>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-xs text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full">
                    <Tag className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stock */}
            <div className={cn('text-sm font-medium', product.stock > 0 ? 'text-green-600' : 'text-red-500')}>
              {product.stock > 10 ? '✓ Còn hàng'
                : product.stock > 0 ? `⚠ Chỉ còn ${product.stock} sản phẩm`
                : '✗ Hết hàng'}
            </div>

            {/* Quantity + Add to cart */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-stone-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-stone-100 transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-stone-100 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={handleAddToCart}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 py-3.5">
                  <ShoppingCart className="w-5 h-5" />
                  Thêm vào giỏ
                </button>
              </div>
            )}

            {/* Buy now */}
            {product.stock > 0 && (
              <Link href="/checkout" onClick={() => addItem(product, qty)}
                className="btn-outline w-full flex items-center justify-center gap-2 py-3.5">
                Mua ngay
              </Link>
            )}

            {/* Policies */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                <Truck className="w-5 h-5 text-moss-600 shrink-0" />
                <span className="text-xs text-stone-600">Giao hàng toàn quốc</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                <Shield className="w-5 h-5 text-moss-600 shrink-0" />
                <span className="text-xs text-stone-600">Bảo hành 7 ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-stone-800 mb-6">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
