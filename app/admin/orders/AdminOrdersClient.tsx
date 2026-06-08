'use client'

import { useState } from 'react'
import { Eye, X, ChevronDown, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'

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

type Order = {
  id: string
  created_at: string
  status: string
  payment_status: string
  total_price: number
  note?: string
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
  const supabase = createClient()

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setUpdatingId(orderId)

    // Trừ kho khi chuyển sang "đã giao"
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

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : prev)
      }
    }
    setUpdatingId(null)
  }

  async function updatePaymentStatus(orderId: string, newPaymentStatus: string) {
    setUpdatingId(orderId)
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: newPaymentStatus })
      .eq('id', orderId)

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, payment_status: newPaymentStatus } : o))
      )
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, payment_status: newPaymentStatus } : prev)
      }
    }
    setUpdatingId(null)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Mã đơn</th>
              <th className="px-4 py-3 text-left">Khách hàng</th>
              <th className="px-4 py-3 text-left">Ngày đặt</th>
              <th className="px-4 py-3 text-left">Tổng tiền</th>
              <th className="px-4 py-3 text-left">Thanh toán</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                  #{order.id.slice(0, 8)}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{order.profile?.full_name ?? '—'}</div>
                  <div className="text-xs text-gray-400">{order.profile?.email}</div>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(order.created_at)}</td>
                <td className="px-4 py-3 font-semibold">{formatPrice(order.total_price)}</td>

                {/* Payment status dropdown */}
                <td className="px-4 py-3">
                  <div className="relative inline-block">
                    <select
                      value={order.payment_status ?? 'unpaid'}
                      disabled={updatingId === order.id}
                      onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                      className={`appearance-none pl-2 pr-6 py-1 rounded-full text-xs font-medium cursor-pointer border-0 outline-none ${
                        PAYMENT_STATUS_COLORS[order.payment_status] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                  </div>
                </td>

                {/* Order status dropdown */}
                <td className="px-4 py-3">
                  <div className="relative inline-block">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`appearance-none pl-2 pr-6 py-1 rounded-full text-xs font-medium cursor-pointer border-0 outline-none ${
                        ORDER_STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                  </div>
                </td>

                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-10 h-10 rounded object-cover border"
                        />
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
                <span className="text-lg">{formatPrice(selectedOrder.total_price)}</span>
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