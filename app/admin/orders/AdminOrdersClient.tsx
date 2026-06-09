'use client'

import { useState } from 'react'
import { Eye, X, ChevronDown, CreditCard, BarChart2, Download, TrendingUp, ShoppingBag, Users, Calendar, Truck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import * as XLSX from 'xlsx'

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: 'Chưa thanh toán',
  pending_verification: 'Chờ xác nhận',
  paid: 'Đã thanh toán',
  refunded: 'Đã hoàn tiền',
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  unpaid: 'bg-red-100 text-red-700',
  pending_verification: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  refunded: 'bg-gray-100 text-gray-700',
}

type Period = 'day' | 'week' | 'month' | 'year'

function getDateRange(period: Period): { from: Date; to: Date; label: string } {
  const now = new Date()
  const to = new Date(now)
  let from = new Date(now)
  let label = ''
  if (period === 'day') {
    from.setHours(0, 0, 0, 0)
    to.setHours(23, 59, 59, 999)
    label = now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  } else if (period === 'week') {
    const day = now.getDay() || 7
    from.setDate(now.getDate() - day + 1)
    from.setHours(0, 0, 0, 0)
    label = `Tuần ${from.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })} – ${to.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })}`
  } else if (period === 'month') {
    from = new Date(now.getFullYear(), now.getMonth(), 1)
    label = now.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
  } else {
    from = new Date(now.getFullYear(), 0, 1)
    label = `Năm ${now.getFullYear()}`
  }
  return { from, to, label }
}

function formatVND(n: number) {
  return n.toLocaleString('vi-VN') + 'đ'
}

type Order = {
  id: string
  created_at: string
  status: string
  payment_status: string
  total: number
  note?: string
  shipping_name?: string
  shipping_phone?: string
  shipping_address?: string
  profile?: { full_name: string; email: string }
  items?: {
    quantity: number
    price: number
    product?: { name: string; images: string[] }
  }[]
}

export default function AdminOrdersClient({ orders: initialOrders }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>('month')
  const supabase = createClient()

  // ── Period filter ──────────────────────────────────────────────────────
  const { from, to, label: periodLabel } = getDateRange(period)

  const filteredByPeriod = orders.filter(o => {
    const d = new Date(o.created_at)
    return d >= from && d <= to
  })

  const stats = {
    totalOrders: filteredByPeriod.length,
    totalRevenue: filteredByPeriod.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total, 0),
    delivered: filteredByPeriod.filter(o => o.status === 'delivered').length,
    cancelled: filteredByPeriod.filter(o => o.status === 'cancelled').length,
    uniqueCustomers: new Set(filteredByPeriod.map(o => o.profile?.email).filter(Boolean)).size,
  }

  const revenueByDay: Record<string, number> = {}
  filteredByPeriod.filter(o => o.payment_status === 'paid').forEach(o => {
    const day = new Date(o.created_at).toLocaleDateString('vi-VN')
    revenueByDay[day] = (revenueByDay[day] ?? 0) + o.total
  })

  // ── Actions ────────────────────────────────────────────────────────────
  async function updateOrderStatus(orderId: string, newStatus: string) {
    setUpdatingId(orderId)
    const previousStatus = orders.find((o) => o.id === orderId)?.status
    if (newStatus === 'delivered' && previousStatus !== 'delivered') {
      const { data: items } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId)

      if (items && items.length > 0) {
        await Promise.all(
          items.map(async (item: { product_id: string; quantity: number }) => {
            const { data: product } = await supabase
              .from('products')
              .select('stock')
              .eq('id', item.product_id)
              .single()
            if (product) {
              await supabase
                .from('products')
                .update({ stock: Math.max(0, product.stock - item.quantity) })
                .eq('id', item.product_id)
            }
          })
        )
      }
    }

    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    if (!error) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : prev)
      }
    }
    setUpdatingId(null)
  }

  async function updatePaymentStatus(orderId: string, newPaymentStatus: string) {
    setUpdatingId(orderId)
    const { error } = await supabase.from('orders').update({ payment_status: newPaymentStatus }).eq('id', orderId)
    if (!error) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, payment_status: newPaymentStatus } : o)))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, payment_status: newPaymentStatus } : prev)
      }
    }
    setUpdatingId(null)
  }

  // ── Excel export ───────────────────────────────────────────────────────
  function exportExcel() {
    const wb = XLSX.utils.book_new()

    // Sheet 1: Danh sách đơn hàng
    const orderRows = filteredByPeriod.map((o, i) => ({
      'STT': i + 1,
      'Mã đơn': '#' + o.id.slice(0, 8).toUpperCase(),
      'Khách hàng': o.profile?.full_name ?? '—',
      'Email': o.profile?.email ?? '—',
      'Ngày đặt': new Date(o.created_at).toLocaleDateString('vi-VN'),
      'Tổng tiền (đ)': o.total,
      'Trạng thái đơn': ORDER_STATUS_LABELS[o.status] ?? o.status,
      'Trạng thái thanh toán': PAYMENT_STATUS_LABELS[o.payment_status] ?? o.payment_status,
    }))
    const ws1 = XLSX.utils.json_to_sheet(orderRows)
    ws1['!cols'] = [{ wch: 5 }, { wch: 12 }, { wch: 20 }, { wch: 28 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 22 }]
    XLSX.utils.book_append_sheet(wb, ws1, 'Đơn hàng')

    // Sheet 2: Doanh thu theo ngày
    const dayRows = Object.entries(revenueByDay)
      .sort(([a], [b]) => {
        const parse = (s: string) => s.split('/').reverse().join('-')
        return new Date(parse(a)).getTime() - new Date(parse(b)).getTime()
      })
      .map(([ day, revenue ]) => ({ 'Ngày': day, 'Doanh thu (đ)': revenue }))
    const ws2 = XLSX.utils.json_to_sheet(dayRows)
    ws2['!cols'] = [{ wch: 14 }, { wch: 18 }]
    XLSX.utils.book_append_sheet(wb, ws2, 'Doanh thu theo ngày')

    // Sheet 3: Thống kê theo sản phẩm
    const productMap: Record<string, { name: string; qty: number; revenue: number }> = {}
    filteredByPeriod.filter(o => o.payment_status === 'paid').forEach(o => {
      o.items?.forEach(item => {
        const name = item.product?.name ?? 'Không rõ'
        if (!productMap[name]) productMap[name] = { name, qty: 0, revenue: 0 }
        productMap[name].qty += item.quantity
        productMap[name].revenue += item.price * item.quantity
      })
    })
    const productRows = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .map((p, i) => ({ 'STT': i + 1, 'Sản phẩm': p.name, 'Số lượng bán': p.qty, 'Doanh thu (đ)': p.revenue }))
    const ws3 = XLSX.utils.json_to_sheet(productRows)
    ws3['!cols'] = [{ wch: 5 }, { wch: 36 }, { wch: 16 }, { wch: 18 }]
    XLSX.utils.book_append_sheet(wb, ws3, 'Theo sản phẩm')

    // Sheet 4: Thống kê theo khách hàng
    const customerMap: Record<string, { name: string; email: string; orders: number; revenue: number }> = {}
    filteredByPeriod.filter(o => o.payment_status === 'paid').forEach(o => {
      const key = o.profile?.email ?? 'unknown'
      if (!customerMap[key]) customerMap[key] = { name: o.profile?.full_name ?? '—', email: key, orders: 0, revenue: 0 }
      customerMap[key].orders += 1
      customerMap[key].revenue += o.total
    })
    const customerRows = Object.values(customerMap)
      .sort((a, b) => b.revenue - a.revenue)
      .map((c, i) => ({ 'STT': i + 1, 'Khách hàng': c.name, 'Email': c.email, 'Số đơn': c.orders, 'Tổng chi (đ)': c.revenue }))
    const ws4 = XLSX.utils.json_to_sheet(customerRows)
    ws4['!cols'] = [{ wch: 5 }, { wch: 22 }, { wch: 28 }, { wch: 10 }, { wch: 18 }]
    XLSX.utils.book_append_sheet(wb, ws4, 'Theo khách hàng')

    XLSX.writeFile(wb, `doanh-thu-${period}-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-stone-800">Quản lý đơn hàng</h1>
          <p className="text-stone-400 text-sm mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> {periodLabel}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period tabs */}
          <div className="flex bg-stone-100 rounded-xl p-1 gap-1">
            {([['day', 'Ngày'], ['week', 'Tuần'], ['month', 'Tháng'], ['year', 'Năm']] as [Period, string][]).map(([val, lbl]) => (
              <button key={val} onClick={() => setPeriod(val)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${period === val ? 'bg-moss-600 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
                {lbl}
              </button>
            ))}
          </div>
          {/* Export */}
          <button onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Tổng đơn', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
          { label: 'Doanh thu', value: formatVND(stats.totalRevenue), icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
          { label: 'Đã giao', value: stats.delivered, icon: BarChart2, color: 'bg-moss-50 text-moss-600', border: 'border-moss-100' },
          { label: 'Đã hủy', value: stats.cancelled, icon: X, color: 'bg-red-50 text-red-500', border: 'border-red-100' },
          { label: 'Khách hàng', value: stats.uniqueCustomers, icon: Users, color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl border p-4 flex items-center gap-3 bg-white ${s.border}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-stone-800 leading-none">{s.value}</p>
              <p className="text-xs text-stone-400 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table — hiển thị TẤT CẢ đơn hàng, không lọc theo period */}
      <div className="overflow-hidden border border-stone-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-moss-600/10 border-b border-stone-200">
                <th className="text-center px-4 py-3 text-moss-800 font-bold uppercase text-xs border-r border-stone-200 w-12">STT</th>
                <th className="text-left px-4 py-3 text-moss-800 font-bold uppercase text-xs border-r border-stone-200">Mã đơn</th>
                <th className="text-left px-4 py-3 text-moss-800 font-bold uppercase text-xs border-r border-stone-200">Khách hàng</th>
                <th className="text-center px-4 py-3 text-moss-800 font-bold uppercase text-xs border-r border-stone-200">Ngày đặt</th>
                <th className="text-center px-4 py-3 text-moss-800 font-bold uppercase text-xs border-r border-stone-200">Tổng tiền</th>
                <th className="text-center px-4 py-3 text-moss-800 font-bold uppercase text-xs border-r border-stone-200">Thanh toán</th>
                <th className="text-center px-4 py-3 text-moss-800 font-bold uppercase text-xs border-r border-stone-200">Trạng thái</th>
                <th className="text-center px-4 py-3 text-moss-800 font-bold uppercase text-xs">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={order.id} className="border-b border-stone-200 even:bg-stone-50/60 hover:bg-moss-50/40 transition-colors">
                  <td className="px-4 py-3 text-center text-stone-400 font-medium border-r border-stone-200">{idx + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-500 border-r border-stone-200">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3 border-r border-stone-200">
                    <div className="font-medium text-stone-800">{order.profile?.full_name ?? '—'}</div>
                    <div className="text-xs text-stone-400">{order.profile?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-center text-stone-500 text-xs border-r border-stone-200">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3 text-center font-semibold text-stone-800 border-r border-stone-200">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3 text-center border-r border-stone-200">
                    <div className="relative inline-block">
                      <select
                        value={order.payment_status ?? 'unpaid'}
                        disabled={updatingId === order.id}
                        onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                        className={`appearance-none pl-2 pr-6 py-1 rounded-full text-xs font-medium cursor-pointer border-0 outline-none ${PAYMENT_STATUS_COLORS[order.payment_status] ?? 'bg-gray-100 text-gray-700'}`}
                      >
                        {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border-r border-stone-200">
                    <div className="relative inline-block">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`appearance-none pl-2 pr-6 py-1 rounded-full text-xs font-medium cursor-pointer border-0 outline-none ${ORDER_STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}
                      >
                        {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-medium transition-colors mx-auto"
                    >
                      <Eye className="w-3.5 h-3.5" /> Xem
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-stone-400">Chưa có đơn hàng nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="font-semibold text-lg">Chi tiết đơn hàng</h2>
                <p className="text-xs text-gray-400 font-mono">#{selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Customer */}
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Khách hàng</p>
                <p className="font-medium">{selectedOrder.profile?.full_name}</p>
                <p className="text-sm text-gray-500">{selectedOrder.profile?.email}</p>
              </div>

              {/* Shipping info */}
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1 flex items-center gap-1">
                  <Truck className="w-3 h-3" /> Thông tin giao hàng
                </p>
                <p className="font-medium">{selectedOrder.shipping_name}</p>
                <p className="text-sm text-gray-500">{selectedOrder.shipping_phone}</p>
                <p className="text-sm text-gray-500">{selectedOrder.shipping_address}</p>
              </div>

              {/* Payment status controls */}
              <div>
                <p className="text-xs text-gray-400 uppercase mb-2 flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Thanh toán
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => updatePaymentStatus(selectedOrder.id, value)}
                      disabled={updatingId === selectedOrder.id}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        selectedOrder.payment_status === value
                          ? `${PAYMENT_STATUS_COLORS[value]} border-current font-bold ring-2 ring-offset-1 ring-current`
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order items */}
              <div>
                <p className="text-xs text-gray-400 uppercase mb-2">Sản phẩm</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {item.product?.images?.[0] && (
                        <img src={item.product.images[0]} alt={item.product.name}
                          className="w-10 h-10 rounded object-cover border" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product?.name}</p>
                        <p className="text-xs text-gray-400">x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-3 border-t font-semibold">
                <span>Tổng cộng</span>
                <span className="text-lg">{formatPrice(selectedOrder.total)}</span>
              </div>

              {selectedOrder.note && (
                <div className="bg-yellow-50 rounded-lg p-3 text-sm text-yellow-800">
                  <span className="font-medium">Ghi chú:</span> {selectedOrder.note}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}