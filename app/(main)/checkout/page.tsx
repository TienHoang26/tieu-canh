'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ShoppingBag, Truck, CreditCard, Wallet, Smartphone, Banknote, ChevronRight, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/lib/use-cart'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import PaymentModal from '@/components/payment-modal'

const PAYMENT_METHODS = [
  { value: 'cod',           label: 'Thanh toán khi nhận hàng (COD)', lucide: Banknote,  color: '#6366f1', bg: '#eef2ff' },
  { value: 'bank_transfer', label: 'Chuyển khoản Ngân hàng',         lucide: CreditCard, color: '#0ea5e9', bg: '#e0f2fe' },
  { value: 'momo',          label: 'Ví điện tử Momo',                lucide: Smartphone, color: '#ec4899', bg: '#fce7f3' },
  { value: 'vnpay',         label: 'Ví điện tử ZaloPay',             lucide: Wallet,     color: '#0284c7', bg: '#dbeafe' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, removeItem } = useCart()

  const [selectedIds, setSelectedIds]     = useState<Set<string>>(new Set())
  const [mounted, setMounted]             = useState(false)
  const [loading, setLoading]             = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [form, setForm]                   = useState({ name: '', phone: '', address: '', note: '' })
  const [frozenItems, setFrozenItems]     = useState<typeof items>([])
  const [orderPlaced, setOrderPlaced]     = useState(false)

  const formRef = useRef<HTMLFormElement>(null)

  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean
    orderId: string
    orderCode: string
    total: number
    method: string
  }>({ isOpen: false, orderId: '', orderCode: '', total: 0, method: '' })

  useEffect(() => {
    const saved = localStorage.getItem('selectedCartIds')
    if (saved) setSelectedIds(new Set<string>(JSON.parse(saved)))
    setMounted(true)
  }, [])

  const checkoutItems = orderPlaced
    ? frozenItems
    : items.filter(i => selectedIds.has(i.product.id))

  const subtotal = checkoutItems.reduce(
    (s, { product, quantity }) => s + (product.sale_price ?? product.price) * quantity, 0
  )
  const shipping = subtotal >= 500000 ? 0 : 30000
  const total    = subtotal + shipping

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (checkoutItems.length === 0) { toast.error('Giỏ hàng trống!'); return }
    if (!form.name.trim())    { toast.error('Vui lòng nhập họ tên!'); return }
    if (!form.phone.trim())         { toast.error('Vui lòng nhập số điện thoại!'); return }
    if (form.phone.length !== 10)   { toast.error('Số điện thoại phải đủ 10 số!'); return }
    if (!form.address.trim()) { toast.error('Vui lòng nhập địa chỉ giao hàng!'); return }

    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login?redirect=/checkout'); return }

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id:          user.id,
        total,
        shipping_name:    form.name,
        shipping_phone:   form.phone,
        shipping_address: form.address,
        note:             form.note || null,
        status:           'pending',
        payment_method:   paymentMethod,
        payment_status:   'unpaid',
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
        order_id:   order.id,
        product_id: i.product.id,
        quantity:   i.quantity,
        price:      i.product.sale_price ?? i.product.price,
      }))
    )

    setFrozenItems(checkoutItems)
    setOrderPlaced(true)
    checkoutItems.forEach(i => removeItem(i.product.id))
    localStorage.removeItem('selectedCartIds')
    setLoading(false)

    const orderCode   = order.id.slice(0, 8).toUpperCase()
    const savedMethod = paymentMethod

    if (savedMethod === 'cod') {
      toast.success('Đặt hàng thành công! 🎉')
      router.push(`/orders/${order.id}?success=1`)
      return
    }

    // Không toast ở đây — chờ user xác nhận trong modal
    setPaymentModal({ isOpen: true, orderId: order.id, orderCode, total, method: savedMethod })
  }

  const handlePaymentModalClose = async (switchToCOD?: boolean) => {
    const orderId = paymentModal.orderId

    if (switchToCOD && orderId) {
      const supabase = createClient()
      await supabase
        .from('orders')
        .update({ payment_method: 'cod' })
        .eq('id', orderId)
      toast.success('Đã đổi sang COD! Đơn hàng đã được đặt 🎉')
    } else {
      toast.success('Đặt hàng thành công! 🎉')
    }

    setPaymentModal(m => ({ ...m, isOpen: false }))
    router.push(`/orders/${orderId}?success=1`)
  }

  if (mounted && !orderPlaced && checkoutItems.length === 0) {
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

  return (
    <>
      <div className="min-h-screen bg-[#f5f5f0] pt-20 lg:pt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-6">
            <span className="hover:text-moss-600 cursor-pointer" onClick={() => router.push('/')}>Trang chủ</span>
            <ChevronRight className="w-3 h-3" />
            <span className="hover:text-moss-600 cursor-pointer" onClick={() => router.push('/cart')}>Giỏ hàng</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-stone-700 font-medium">Thanh toán</span>
          </div>

          <div className="grid lg:grid-cols-[1fr_420px] gap-6">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <h2 className="font-bold text-stone-800 text-base mb-5 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-moss-600" />
                  Thông tin giao hàng
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1.5">Họ và tên <span className="text-red-400">*</span>:</label>
                    <input className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-moss-400 focus:ring-2 focus:ring-moss-100 bg-white placeholder:text-stone-300 transition"
                      required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nguyễn Tiến Hoàng" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1.5">Số điện thoại <span className="text-red-400">*</span>:</label>
                    <input className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 bg-white placeholder:text-stone-300 transition ${
                        form.phone && form.phone.length !== 10
                          ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                          : 'border-stone-200 focus:border-moss-400 focus:ring-moss-100'
                      }`}
                      required type="tel" maxLength={10} value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                      placeholder="Nhập số điện thoại liên hệ" />
                    {form.phone && form.phone.length !== 10 && (
                      <p className="text-xs text-red-500 mt-1">Số điện thoại phải đủ 10 số</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1.5">Địa chỉ giao hàng <span className="text-red-400">*</span>:</label>
                    <textarea className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-moss-400 focus:ring-2 focus:ring-moss-100 bg-white placeholder:text-stone-300 resize-none transition"
                      required rows={3} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Nhập địa chỉ chi tiết (Số nhà, đường, xã/phường, quận/huyện, tỉnh/thành phố)" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1.5">Ghi chú (Không bắt buộc):</label>
                    <textarea className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-moss-400 focus:ring-2 focus:ring-moss-100 bg-white placeholder:text-stone-300 resize-none transition"
                      rows={2} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Ví dụ: Giao hàng giờ hành chính, gọi trước 30 phút..." />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <h2 className="font-bold text-stone-800 text-base mb-5 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-moss-600" />
                  Phương thức thanh toán
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PAYMENT_METHODS.map(method => {
                    const Icon = method.lucide
                    const isActive = paymentMethod === method.value
                    return (
                      <button key={method.value} type="button" onClick={() => setPaymentMethod(method.value)}
                        className="flex flex-col items-center gap-2.5 py-4 px-2 rounded-2xl border-2 transition-all text-center"
                        style={{ borderColor: isActive ? method.color : '#e7e5e4', background: isActive ? method.bg : '#fafaf9' }}>
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
                          style={{ background: isActive ? method.color : '#f0efee' }}>
                          <Icon className="w-5 h-5" style={{ color: isActive ? '#fff' : '#a8a29e' }} />
                        </div>
                        <span className="text-xs font-semibold leading-tight" style={{ color: isActive ? method.color : '#78716c' }}>
                          {method.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {paymentMethod !== 'cod' && (
                  <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <p className="text-xs text-stone-500">
                      {paymentMethod === 'bank_transfer' && '🏦 Sau khi đặt hàng, bạn sẽ nhận được thông tin tài khoản ngân hàng và mã QR để chuyển khoản.'}
                      {paymentMethod === 'momo'          && '📱 Sau khi đặt hàng, bạn sẽ nhận được thông tin số điện thoại Momo và mã QR để thanh toán.'}
                      {paymentMethod === 'vnpay'         && '💙 Sau khi đặt hàng, bạn sẽ nhận được thông tin số điện thoại ZaloPay và mã QR để thanh toán.'}
                    </p>
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading || !mounted || orderPlaced}
                className="lg:hidden w-full py-4 rounded-2xl bg-[#5a6e3a] hover:bg-[#4a5c2e] text-white font-bold text-sm tracking-widest uppercase transition flex items-center justify-center gap-2 shadow-md disabled:opacity-60">
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                Hoàn tất đặt hàng ngay
              </button>
            </form>

            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <h2 className="font-bold text-stone-800 text-base mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-moss-600" /> Tóm tắt đơn hàng
                </h2>
                <div className="divide-y divide-stone-50">
                  {checkoutItems.map(({ product, quantity }) => {
                    const price = product.sale_price ?? product.price
                    return (
                      <div key={product.id} className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
                        <img src={product.images?.[0] || ''} alt={product.name}
                          className="w-16 h-16 object-cover rounded-xl border border-stone-100 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-stone-800 text-sm line-clamp-2 leading-snug">{product.name}</p>
                          <p className="text-xs text-stone-400 mt-1">SL: {quantity} | Đơn giá: {formatPrice(price)}</p>
                          <p className="text-sm font-bold text-red-500 mt-1">Thành tiền: {formatPrice(price * quantity)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <h2 className="font-bold text-stone-800 text-base mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-moss-600" /> Chi tiết thanh toán
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-stone-500">
                    <span>Tạm tính ({checkoutItems.length} sản phẩm):</span>
                    <span className="font-medium text-stone-700">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Phí vận chuyển 🚚:</span>
                    {shipping === 0
                      ? <span className="font-medium text-green-600">Miễn phí</span>
                      : <span className="font-medium text-stone-700">{formatPrice(shipping)}</span>}
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Phương thức:</span>
                    <span className="font-medium text-stone-700 text-xs">
                      {PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label}
                    </span>
                  </div>
                  <div className="border-t border-dashed border-stone-100 pt-3 flex justify-between items-baseline">
                    <span className="font-bold text-stone-800 text-base">Tổng thanh toán:</span>
                    <span className="font-extrabold text-xl text-red-500">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <button type="button" disabled={loading || !mounted || orderPlaced}
                onClick={() => formRef.current?.requestSubmit()}
                className="hidden lg:flex w-full py-4 rounded-2xl bg-[#5a6e3a] hover:bg-[#4a5c2e] text-white font-bold text-sm tracking-widest uppercase transition items-center justify-center gap-2 shadow-md disabled:opacity-60">
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                Hoàn tất đặt hàng ngay
              </button>

              {shipping > 0 && (
                <p className="text-center text-xs text-stone-400">
                  🚚 Miễn phí vận chuyển cho đơn từ {formatPrice(500000)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => handlePaymentModalClose(false)}
        onSwitchToCOD={() => handlePaymentModalClose(true)}
        paymentMethod={paymentModal.method || paymentMethod}
        orderId={paymentModal.orderId}
        orderCode={paymentModal.orderCode}
        total={paymentModal.total}
      />
    </>
  )
}