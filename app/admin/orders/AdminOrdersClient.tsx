'use client'

import { useState } from 'react'
import { Eye, X, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Order, OrderStatus } from '@/types'

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled']

export default function AdminOrdersClient({ orders: initial }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initial)
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [selected, setSelected] = useState<Order | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const updateStatus = async (id: string, status: OrderStatus) => {
    setUpdating(id)
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) { toast.error(error.message) }
    else {
      setOrders(os => os.map(o => o.id === id ? { ...o, status } : o))
      if (selected?.id === id) setSelected(s => s ? { ...s, status } : s)
      toast.success('Đã cập nhật trạng thái!')
    }
    setUpdating(null)
  }

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-stone-800">Đơn hàng</h1>
        <p className="text-stone-500 text-sm mt-0.5">{orders.length} đơn tổng cộng</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('all')}
          className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-colors',
            filter === 'all' ? 'bg-stone-800 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300')}>
          Tất cả ({orders.length})
        </button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              filter === s ? 'bg-stone-800 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300')}>
            {ORDER_STATUS_LABELS[s]} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="text-left px-5 py-3 text-stone-500 font-medium">Mã đơn</th>
                <th className="text-left px-5 py-3 text-stone-500 font-medium hidden sm:table-cell">Khách hàng</th>
                <th className="text-left px-5 py-3 text-stone-500 font-medium">Tổng tiền</th>
                <th className="text-left px-5 py-3 text-stone-500 font-medium">Trạng thái</th>
                <th className="text-left px-5 py-3 text-stone-500 font-medium hidden md:table-cell">Ngày đặt</th>
                <th className="text-right px-5 py-3 text-stone-500 font-medium">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-stone-600 text-xs">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <p className="font-medium text-stone-800">{order.shipping_name}</p>
                    <p className="text-xs text-stone-400">{order.shipping_phone}</p>
                  </td>
                  <td className="px-5 py-3 font-bold text-stone-800">{formatPrice(order.total)}</td>
                  <td className="px-5 py-3">
                    <div className="relative inline-flex items-center gap-1">
                      <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-stone-500 hidden md:table-cell text-xs">{formatDate(order.created_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setSelected(order)}
                      className="p-2 text-stone-500 hover:text-moss-700 hover:bg-moss-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-stone-400">Không có đơn hàng</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="font-bold text-stone-800">Đơn #{selected.id.slice(0, 8).toUpperCase()}</h2>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Customer info */}
              <div className="bg-stone-50 rounded-xl p-4 space-y-1.5 text-sm">
                <p><span className="text-stone-500">Tên:</span> <span className="font-semibold">{selected.shipping_name}</span></p>
                <p><span className="text-stone-500">SĐT:</span> <span className="font-semibold">{selected.shipping_phone}</span></p>
                <p><span className="text-stone-500">Địa chỉ:</span> <span className="font-semibold">{selected.shipping_address}</span></p>
                {selected.note && <p><span className="text-stone-500">Ghi chú:</span> <span>{selected.note}</span></p>}
                <p><span className="text-stone-500">Đặt lúc:</span> <span>{formatDate(selected.created_at)}</span></p>
              </div>

              {/* Items */}
              {(selected.items as { id: string; quantity: number; price: number; product: { name: string; images: string[] } }[] | undefined)?.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.product?.images?.[0]} alt="" className="w-12 h-12 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-800 text-sm truncate">{item.product?.name}</p>
                    <p className="text-xs text-stone-500">x{item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <span className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}

              <div className="border-t border-stone-100 pt-3 flex justify-between font-bold text-stone-800">
                <span>Tổng cộng</span>
                <span className="text-moss-700">{formatPrice(selected.total)}</span>
              </div>

              {/* Status update */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Cập nhật trạng thái</label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)}
                      disabled={updating === selected.id}
                      className={cn(
                        'px-3 py-2 rounded-xl text-sm font-medium transition-all border-2',
                        selected.status === s
                          ? 'border-moss-500 bg-moss-50 text-moss-700'
                          : 'border-stone-200 text-stone-600 hover:border-moss-300'
                      )}>
                      {ORDER_STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
