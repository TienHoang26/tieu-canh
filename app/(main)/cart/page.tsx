'use client'

import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react'
import { useCart } from '@/lib/use-cart'
import { formatPrice } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const { items, removeItem, updateQuantity, total } = useCart()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/auth/login?redirect=/cart')
      } else {
        setIsLoggedIn(true)
      }
      setAuthChecked(true)
    })
  }, [router])

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(items.map(i => i.product.id))
  )

  useEffect(() => {
    localStorage.setItem('selectedCartIds', JSON.stringify(Array.from(selectedIds)))
  }, [selectedIds])

  const toggleItem = (id: string) => setSelectedIds(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const selectedItems = items.filter(i => selectedIds.has(i.product.id))
  const selectedTotal = () => selectedItems.reduce(
    (sum, { product, quantity }) => sum + (product.sale_price ?? product.price) * quantity, 0
  )

  // Đang kiểm tra auth → hiện loading
  if (!authChecked || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-moss-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-stone-700 mb-2">Giỏ hàng trống</h2>
          <p className="text-stone-500 mb-6">Hãy khám phá các sản phẩm tiểu cảnh độc đáo của chúng tôi!</p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            Mua sắm ngay <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  const shipping = selectedTotal() >= 500000 ? 0 : 30000

  return (
    <div className="min-h-screen bg-stone-50 pt-20 lg:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/products" className="p-2 hover:bg-stone-200 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-3xl font-bold text-stone-800">
            Giỏ hàng <span className="text-moss-600">({items.length})</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="card p-4 flex gap-4">
                <div className="flex items-center shrink-0">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(product.id)}
                    onChange={() => toggleItem(product.id)}
                    className="w-5 h-5 accent-moss-600 cursor-pointer rounded"
                    aria-label={`Chọn ${product.name}`}
                  />
                </div>
                <Link href={`/products/${product.slug}`} className="shrink-0">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200'}
                    alt={product.name}
                    className="w-20 h-20 lg:w-24 lg:h-24 object-cover rounded-xl"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${product.slug}`}
                    className="font-semibold text-stone-800 hover:text-moss-700 transition-colors line-clamp-2">
                    {product.name}
                  </Link>
                  <p className="text-moss-700 font-bold mt-1">
                    {formatPrice(product.sale_price ?? product.price)}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 transition-colors disabled:opacity-40">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-stone-800">
                        {formatPrice((product.sale_price ?? product.price) * quantity)}
                      </span>
                      <button onClick={() => removeItem(product.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="font-bold text-stone-800 text-lg mb-4">Tóm tắt đơn hàng</h2>
              <p className="text-xs text-stone-400 mb-3">
                Đang tính {selectedItems.length}/{items.length} sản phẩm được chọn
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Tạm tính</span>
                  <span>{formatPrice(selectedTotal())}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Phí giao hàng</span>
                  <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                    {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-moss-600 bg-moss-50 px-3 py-2 rounded-lg">
                    Mua thêm {formatPrice(500000 - total())} để được miễn phí ship!
                  </p>
                )}
                <div className="border-t border-stone-100 pt-3 flex justify-between font-bold text-stone-800 text-base">
                  <span>Tổng cộng</span>
                  <span className="text-moss-700">{formatPrice(selectedTotal() + shipping)}</span>
                </div>
              </div>

              {selectedItems.length > 0 ? (
                <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 mt-6 py-3.5">
                  Tiến hành thanh toán <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button disabled className="btn-primary w-full flex items-center justify-center gap-2 mt-6 py-3.5 opacity-40 cursor-not-allowed">
                  Chọn sản phẩm để thanh toán
                </button>
              )}
              <Link href="/products"
                className="w-full flex items-center justify-center gap-2 mt-3 text-sm text-stone-500 hover:text-stone-700 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}