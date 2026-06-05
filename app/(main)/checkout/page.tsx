'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2, ShoppingBag, Banknote, CreditCard, Wallet, Smartphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/lib/use-cart'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

// ─── Payment methods (khớp với DB enum) ───────────────────────────────────────
const PAYMENT_METHODS = [
  {
    value: 'cod',
    label: 'Thanh toán khi nhận hàng',
    short: 'COD',
    icon: Banknote,
    desc: 'Trả tiền mặt khi nhận hàng',
  },
  {
    value: 'bank_transfer',
    label: 'Chuyển khoản ngân hàng',
    short: 'Bank',
    icon: CreditCard,
    desc: 'Chuyển khoản sau khi đặt hàng, shop xác nhận và giao',
  },
  {
    value: 'momo',
    label: 'Ví MoMo',
    short: 'MoMo',
    icon: Smartphone,
    desc: 'Thanh toán qua ví điện tử MoMo',
  },
  {
    value: 'vnpay',
    label: 'Ví điện tử ZaloPay',
    short: 'ZaloPay',
    icon: Wallet,
    desc: 'Thanh toán qua ZaloPay',
  },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, removeItem, clearCart } = useCart()

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>('cod')
  const [form, setForm] = useState({
    name: '', phone: '', address: '', note: '',
  })

  useEffect(() => {
    const saved = localStorage.getItem('selectedCartIds')
    if (saved) {
      setSelectedIds(new Set<string>(JSON.parse(saved)))
      setMounted(true)
    }
  }, [])

  const checkoutItems = items.filter(i => selectedIds.has(i.product.id))
  const selectedTotal = checkoutItems.reduce(
    (sum, { product, quantity }) => sum + (product.sale_price ?? product.price) * quantity, 0
  )
  const shipping = selectedTotal >= 500000 ? 0 : 30000

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
        payment_method: paymentMethod,
        payment_status: 'unpaid',
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

    checkoutItems.forEach(i => removeItem(i.product.id))
    localStorage.removeItem('selectedCartIds')
    setSuccess(true)
    setLoading(false)
  }

  if (mounted && checkoutItems.length === 0 && !success) {
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
    const chosenMethod = PAYMENT_METHODS.find(m => m.value === paymentMethod)!
    return (
      <div className="min-h-screen bg-stone-50 pt-24 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <CheckCircle className="w-20 h-20 text-moss-600 mx-auto mb-6" />
          <h2 className="font-display text-3xl font-bold text-stone-800 mb-3">Đặt hàng thành công! 🎉</h2>
          <p className="text-stone-500 mb-4 leading-relaxed">
            Cảm ơn bạn đã mua hàng! Chúng tôi sẽ liên hệ xác nhận đơn trong vòng 30 phút.
          </p>

          {/* Payment reminder */}
          {paymentMethod !== 'cod' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-6 text-left">
              <p className="font-semibold mb-1">
                <chosenMethod.icon className="inline w-4 h-4 mr-1" />
                Thanh toán qua {chosenMethod.label}
              </p>
              {paymentMethod === 'bank_transfer' && (
                <p>Vui lòng chuyển khoản sau khi nhận được thông tin tài khoản từ shop qua điện thoại/Zalo.</p>
              )}
              {paymentMethod === 'momo' && (
                <p>Shop sẽ gửi số điện thoại MoMo để bạn thanh toán sau khi xác nhận đơn.</p>
              )}
              {paymentMethod === 'vnpay' && (
                <p>Shop sẽ gửi thông tin thanh toán ZaloPay sau khi xác nhận đơn.</p>
              )}
            </div>
          )}

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

            {/* Payment method selector */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Phương thức thanh toán *
              </label>
              <div className="space-y-2">
                {PAYMENT_METHODS.map(method => {
                  const Icon = method.icon
                  const isActive = paymentMethod === method.value
                  return (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                        isActive
                          ? 'border-moss-500 bg-moss-50'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      {/* Radio dot */}
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isActive ? 'border-moss-500' : 'border-stone-300'
                      }`}>
                        {isActive && <div className="w-2 h-2 rounded-full bg-moss-500" />}
                      </div>

                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-moss-600' : 'text-stone-400'}`} />

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${isActive ? 'text-moss-700' : 'text-stone-700'}`}>
                          {method.label}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">{method.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !mounted || checkoutItems.length === 0}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
            >
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
              <div className="flex justify-between text-stone-600">
                <span>Thanh toán</span>
                <span className="font-medium text-stone-700">
                  {PAYMENT_METHODS.find(m => m.value === paymentMethod)?.short}
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