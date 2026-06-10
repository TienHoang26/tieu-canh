'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  CheckCircle2, Clock, Package, Truck, MapPin, Phone, User,
  CreditCard, ChevronRight, ArrowLeft, Loader2, XCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import type { Order, OrderItem, Product } from '@/types'
import CancelOrderButton from '@/components/cancel-order-button'

type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[]
  payment_method?: string
  payment_status?: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:   { label: 'Chờ xác nhận', color: '#f59e0b', bg: '#fef3c7', icon: Clock },
  confirmed: { label: 'Đã xác nhận',  color: '#3b82f6', bg: '#dbeafe', icon: CheckCircle2 },
  shipping:  { label: 'Đang giao',    color: '#8b5cf6', bg: '#ede9fe', icon: Truck },
  delivered: { label: 'Đã giao',      color: '#10b981', bg: '#d1fae5', icon: CheckCircle2 },
  cancelled: { label: 'Đã huỷ',       color: '#ef4444', bg: '#fee2e2', icon: XCircle },
}

const PAYMENT_LABEL: Record<string, string> = {
  cod:           'Thanh toán khi nhận hàng (COD)',
  bank_transfer: 'Chuyển khoản ngân hàng',
  momo:          'Ví điện tử Momo',
  vnpay:         'Ví điện tử ZaloPay',
}

const STEPS = [
  { key: 'pending',   label: 'Đặt hàng' },
  { key: 'confirmed', label: 'Xác nhận' },
  { key: 'shipping',  label: 'Đang giao' },
  { key: 'delivered', label: 'Đã giao' },
]

function StatusStepper({ status }: { status: string }) {
  if (status === 'cancelled') return null
  const currentIdx = STEPS.findIndex(s => s.key === status)
  return (
    <div className="flex items-center justify-between w-full px-2">
      {STEPS.map((step, idx) => {
        const done    = idx <= currentIdx
        const current = idx === currentIdx
        return (
          <div key={step.key} className="flex-1 flex flex-col items-center relative">
            {idx < STEPS.length - 1 && (
              <div className="absolute top-4 left-1/2 w-full h-0.5 z-0"
                style={{ background: idx < currentIdx ? '#5a6e3a' : '#e7e5e4' }} />
            )}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 transition-all ${
              done ? 'bg-[#5a6e3a] border-[#5a6e3a]' : 'bg-white border-stone-200'
            } ${current ? 'ring-4 ring-[#5a6e3a]/20' : ''}`}>
              {done
                ? <CheckCircle2 className="w-4 h-4 text-white" />
                : <div className="w-2 h-2 rounded-full bg-stone-300" />}
            </div>
            <span className={`mt-1.5 text-xs font-medium ${done ? 'text-[#5a6e3a]' : 'text-stone-400'}`}>
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function OrderDetailPage() {
  const params       = useParams()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const isSuccess    = searchParams.get('success') === '1'

  const [order,   setOrder]   = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data, error } = await supabase
        .from('orders')
        .select(`*, items:order_items (*, product:products (*))`)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

      if (error || !data) { setError(true); setLoading(false); return }
      setOrder(data as OrderWithItems)
      setLoading(false)
    }
    fetchOrder()
  }, [params.id])

  if (loading) return (
    <div className="min-h-screen bg-[#f5f5f0] pt-24 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#5a6e3a]" />
    </div>
  )

  if (error || !order) return (
    <div className="min-h-screen bg-[#f5f5f0] pt-24 flex items-center justify-center">
      <div className="text-center">
        <XCircle className="w-16 h-16 text-stone-300 mx-auto mb-4" />
        <p className="text-stone-600 mb-4">Không tìm thấy đơn hàng</p>
        <button onClick={() => router.push('/')}
          className="px-6 py-2.5 rounded-xl bg-[#5a6e3a] text-white text-sm font-semibold">
          Về trang chủ
        </button>
      </div>
    </div>
  )

  const cfg        = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
  const StatusIcon = cfg.icon
  const orderCode  = order.id.slice(0, 8).toUpperCase()

  return (
    <div className="min-h-screen bg-[#f5f5f0] pt-20 lg:pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-stone-400">
          <span className="hover:text-[#5a6e3a] cursor-pointer" onClick={() => router.push('/')}>Trang chủ</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-stone-700 font-medium">Đơn hàng #{orderCode}</span>
        </div>

        {/* Success banner */}
        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-green-800 text-sm">Đặt hàng thành công! 🎉</p>
              <p className="text-green-700 text-xs mt-0.5">
                Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ xác nhận đơn sớm nhất.
              </p>
            </div>
          </div>
        )}

        {/* Status card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 font-medium">Mã đơn hàng</p>
              <p className="font-bold text-stone-800 text-lg">#{orderCode}</p>
              <p className="text-xs text-stone-400 mt-0.5">
                {new Date(order.created_at).toLocaleDateString('vi-VN', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: cfg.bg, color: cfg.color }}>
              <StatusIcon className="w-4 h-4" />
              {cfg.label}
            </div>
          </div>
          <StatusStepper status={order.status} />
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <h2 className="font-bold text-stone-800 text-sm mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#5a6e3a]" /> Sản phẩm đã đặt
          </h2>
          <div className="divide-y divide-stone-50">
            {order.items?.map(item => {
              const product = item.product
              if (!product) return null
              return (
                <div key={item.id} className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
                  <img src={product.images?.[0] || ''} alt={product.name}
                    className="w-16 h-16 object-cover rounded-xl border border-stone-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-800 text-sm line-clamp-2 leading-snug">{product.name}</p>
                    <p className="text-xs text-stone-400 mt-1">SL: {item.quantity} | Đơn giá: {formatPrice(item.price)}</p>
                    <p className="text-sm font-bold text-red-500 mt-1">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Shipping info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 space-y-3">
          <h2 className="font-bold text-stone-800 text-sm flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#5a6e3a]" /> Thông tin giao hàng
          </h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2 text-stone-600">
              <User className="w-4 h-4 text-stone-400 shrink-0" />
              <span>{order.shipping_name}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-600">
              <Phone className="w-4 h-4 text-stone-400 shrink-0" />
              <span>{order.shipping_phone}</span>
            </div>
            <div className="flex items-start gap-2 text-stone-600">
              <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <span>{order.shipping_address}</span>
            </div>
            {order.note && (
              <div className="bg-stone-50 rounded-xl px-3 py-2 text-xs text-stone-500 border border-stone-100">
                📝 {order.note}
              </div>
            )}
          </div>
        </div>

        {/* Payment summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 space-y-3">
          <h2 className="font-bold text-stone-800 text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#5a6e3a]" /> Chi tiết thanh toán
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-stone-500">
              <span>Phương thức:</span>
              <span className="font-medium text-stone-700 text-xs text-right">
                {PAYMENT_LABEL[order.payment_method ?? ''] ?? order.payment_method ?? '—'}
              </span>
            </div>
            <div className="flex justify-between text-stone-500">
              <span>Trạng thái thanh toán:</span>
              <span className={`font-semibold text-xs ${order.payment_status === 'paid' ? 'text-green-600' : 'text-amber-500'}`}>
                {order.payment_status === 'paid' ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
              </span>
            </div>
            <div className="border-t border-dashed border-stone-100 pt-2 flex justify-between items-baseline">
              <span className="font-bold text-stone-800">Tổng cộng:</span>
              <span className="font-extrabold text-xl text-red-500">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
<div className="flex flex-col gap-3">
  {/* ✅ Thêm nút hủy */}
  {order.status === 'pending' && (
    <CancelOrderButton orderId={order.id} />
  )}
  <div className="flex gap-3">
    <button onClick={() => router.push('/')}
      className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-700 font-semibold text-sm hover:bg-stone-50 transition flex items-center justify-center gap-2">
      <ArrowLeft className="w-4 h-4" /> Về trang chủ
    </button>
    <button onClick={() => router.push('/products')}
      className="flex-1 py-3 rounded-2xl bg-moss-400 hover:bg-moss-500 text-white font-semibold text-sm transition">
      Tiếp tục mua sắm
    </button>
  </div>
</div>

      </div>
    </div>
  )
}