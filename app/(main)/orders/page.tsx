import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'
import { ShoppingBag, ArrowRight, Eye, ClipboardList, Package, Hourglass, Truck, CheckCircle, XCircle } from 'lucide-react'

// ---- Status config (khớp với DB) ----
const TABS = [
  { label: 'Tất cả',       value: 'all',       icon: ClipboardList },
  { label: 'Chờ xác nhận', value: 'pending',   icon: Package },
  { label: 'Đã xác nhận',  value: 'confirmed', icon: Hourglass },
  { label: 'Đang giao',    value: 'shipping',  icon: Truck },
  { label: 'Đã giao',      value: 'delivered', icon: CheckCircle },
  { label: 'Đã hủy',       value: 'cancelled', icon: XCircle },
]

const STATUS_LABELS: Record<string, string> = {
  pending:   'CHỜ XÁC NHẬN',
  confirmed: 'ĐÃ XÁC NHẬN',
  shipping:  'ĐANG GIAO',
  delivered: 'ĐÃ GIAO',
  cancelled: 'ĐÃ HỦY',
}

const STATUS_TEXT_COLOR: Record<string, string> = {
  pending:   'text-amber-500',
  confirmed: 'text-indigo-500',
  shipping:  'text-blue-500',
  delivered: 'text-moss-600',
  cancelled: 'text-red-400',
}

const STATUS_ACCENT: Record<string, string> = {
  pending:   'bg-amber-400',
  confirmed: 'bg-indigo-400',
  shipping:  'bg-blue-400',
  delivered: 'bg-moss-500',
  cancelled: 'bg-red-300',
}

// ---- Page ----
export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/orders')

  const activeTab = searchParams.tab ?? 'all'

  let query = supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(name, images))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (activeTab !== 'all') {
    query = query.eq('status', activeTab)
  }

  const { data: orders } = await query

  return (
    <div className="min-h-screen bg-stone-50 pt-20 lg:pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Title */}
        <h1 className="font-display text-2xl font-bold text-stone-800 text-center tracking-wide uppercase mb-8">
          Lịch sử đơn hàng
        </h1>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.value
            return (
              <Link
                key={tab.value}
                href={tab.value === 'all' ? '/orders' : `/orders?tab=${tab.value}`}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'bg-white border-stone-200 text-stone-600 hover:border-indigo-300 hover:text-indigo-600'}
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Link>
            )
          })}
        </div>

        {/* Order list */}
        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden flex"
              >
                {/* Left accent bar */}
                <div className={`w-1 flex-shrink-0 ${STATUS_ACCENT[order.status] ?? 'bg-stone-300'}`} />

                <div className="flex-1 p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="font-bold text-stone-800 text-base">
                        Đơn hàng{' '}
                        <span className="text-indigo-600 font-mono">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </p>
                      <p className="text-sm text-stone-400 mt-0.5">{formatDate(order.created_at)}</p>
                    </div>
                    <span className={`text-xs font-bold tracking-wider ${STATUS_TEXT_COLOR[order.status] ?? 'text-stone-500'}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>

                  {/* Items preview */}
                  {order.items && order.items.length > 0 && (
                    <div className="flex gap-3 mb-4 flex-wrap">
                      {order.items.slice(0, 4).map((item: {
                        id: string
                        quantity: number
                        product: { name: string; images: string[] }
                      }) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <img
                            src={item.product?.images?.[0] || ''}
                            alt={item.product?.name}
                            className="w-12 h-12 object-cover rounded-xl border border-stone-100"
                          />
                          <div className="text-sm">
                            <p className="font-medium text-stone-700 line-clamp-1 max-w-[120px]">
                              {item.product?.name}
                            </p>
                            <p className="text-stone-400 text-xs">x{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="flex items-center text-sm text-stone-400">
                          +{order.items.length - 4} sản phẩm
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                    <div>
                      <span className="text-sm text-stone-500">Tổng tiền: </span>
                      <span className="font-bold text-red-500 text-lg">{formatPrice(order.total)}</span>
                    </div>
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-stone-700 mb-2">Chưa có đơn hàng</h3>
            <p className="text-stone-500 mb-6">Hãy khám phá các sản phẩm tiểu cảnh độc đáo!</p>
            <Link href="/products" className="btn-primary inline-flex items-center gap-2">
              Mua sắm ngay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}