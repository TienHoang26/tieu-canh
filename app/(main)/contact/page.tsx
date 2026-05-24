'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/lib/cart-store'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()

  const selectedIds = typeof window !== 'undefined'
    ? new Set<string>(JSON.parse(localStorage.getItem('selectedCartIds') ?? '[]'))
    : new Set<string>()
  const checkoutItems = items.filter(i => selectedIds.has(i.product.id))
  const selectedTotal = checkoutItems.reduce(
    (sum, { product, quantity }) => sum + (product.sale_price ?? product.price) * quantity, 0
  )
  const shipping = selectedTotal >= 500000 ? 0 : 30000

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', address: '', note: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (checkoutItems.length === 0) { toast.error('Giỏ hàng trống!'); return }
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login?redirect=/checkout'); return }

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total: selectedTotal + shipping,
        shipping_name: form.name,
        shipping_phone: form.phone,
        shipping_address: form.address,
        note: form.note || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error || !order) {
      toast.error('Đặt hàng thất bại, vui lòng thử lại!')
      setLoading(false)
      return
    }

    await supabase.from('order_items').insert(
      checkoutItems.map(i => ({
        order_id: order.id,
        product_id: i.product.id,
        quantity: i.quantity,
        price: i.product.sale_price ?? i.product.price,
      }))
    )

    clearCart()
    setSuccess(true)
    setLoading(false)
  }

  if (checkoutItems.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-600 mb-4">Giỏ hàng trống</p>
          <button onClick={() => router.push('/products')} className="btn-primary">Mua sắm ngay</button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <CheckCircle className="w-20 h-20 text-moss-600 mx-auto mb-6" />
          <h2 className="font-display text-3xl font-bold text-stone-800 mb-3">Đặt hàng thành công! 🎉</h2>
          <p className="text-stone-500 mb-6 leading-relaxed">
            Cảm ơn bạn đã mua hàng! Chúng tôi sẽ liên hệ xác nhận đơn trong vòng 30 phút.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push('/orders')} className="btn-primary">Xem đơn hàng</button>
            <button onClick={() => router.push('/products')} className="btn-outline">Tiếp tục mua</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-20 lg:pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-3xl font-bold text-stone-800 mb-8">Thanh toán</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="font-bold text-stone-800 text-lg">Thông tin giao hàng</h2>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Họ và tên *</label>
              <input className="input" required value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Số điện thoại *</label>
              <input className="input" required type="tel" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="0901 234 567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Địa chỉ giao hàng *</label>
              <textarea className="input resize-none" required rows={3} value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Ghi chú</label>
              <textarea className="input resize-none" rows={2} value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                placeholder="Ghi chú cho người giao hàng..." />
            </div>

            <div className="bg-moss-50 border border-moss-200 rounded-xl p-4 text-sm text-moss-700">
              <strong>Thanh toán:</strong> COD (thanh toán khi nhận hàng) hoặc chuyển khoản sau khi xác nhận đơn.
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base">
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              Đặt hàng ngay
            </button>
          </form>

          {/* Order summary */}
          <div className="card p-6 h-fit">
            <h2 className="font-bold text-stone-800 text-lg mb-4">Đơn hàng của bạn</h2>
            <div className="space-y-3 mb-4">
              {checkoutItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3 items-center">
                  <img src={product.images?.[0] || ''} alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{product.name}</p>
                    <p className="text-xs text-stone-500">x{quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-stone-800">
                    {formatPrice((product.sale_price ?? product.price) * quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Tạm tính</span><span>{formatPrice(selectedTotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Giao hàng</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-stone-800 text-base pt-1 border-t border-stone-100">
                <span>Tổng cộng</span>
                <span className="text-moss-700">{formatPrice(selectedTotal + shipping)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}