import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Package, Users, TrendingUp, Clock } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = createClient()

  const [
    { count: totalOrders },
    { count: totalProducts },
    { count: totalUsers },
    { data: recentOrders },
    { data: revenue },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('orders').select('*, profile:profiles(full_name, email)').order('created_at', { ascending: false }).limit(5),
    supabase.from('orders').select('total').eq('status', 'delivered'),
  ])

  const totalRevenue = revenue?.reduce((sum, o) => sum + o.total, 0) ?? 0

  const stats = [
    { label: 'Tổng đơn hàng', value: totalOrders ?? 0, icon: ShoppingBag, color: 'bg-blue-100 text-blue-600' },
    { label: 'Sản phẩm', value: totalProducts ?? 0, icon: Package, color: 'bg-moss-100 text-moss-600' },
    { label: 'Khách hàng', value: totalUsers ?? 0, icon: Users, color: 'bg-purple-100 text-purple-600' },
    { label: 'Doanh thu', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'bg-earth-100 text-earth-600' },
  ]

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipping: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  const statusLabels: Record<string, string> = {
    pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận',
    shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã huỷ',
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-stone-800">Dashboard 🌿</h1>
        <p className="text-stone-500 mt-1">Tổng quan hoạt động cửa hàng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="font-bold text-2xl text-stone-800">{value}</p>
            <p className="text-sm text-stone-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-stone-400" />
            <h2 className="font-bold text-stone-800">Đơn hàng gần đây</h2>
          </div>
          <a href="/admin/orders" className="text-sm text-moss-600 hover:underline font-medium">Xem tất cả →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left px-6 py-3 text-stone-500 font-medium">Mã đơn</th>
                <th className="text-left px-6 py-3 text-stone-500 font-medium">Khách hàng</th>
                <th className="text-left px-6 py-3 text-stone-500 font-medium">Tổng tiền</th>
                <th className="text-left px-6 py-3 text-stone-500 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.map((order) => (
                <tr key={order.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-stone-600">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4 text-stone-700">
                    {(order.profile as { full_name: string } | null)?.full_name ?? order.shipping_name}
                  </td>
                  <td className="px-6 py-4 font-semibold text-stone-800">{formatPrice(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
