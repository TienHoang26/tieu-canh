import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import { ShoppingBag, ArrowRight } from 'lucide-react'

export default async function OrdersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/orders')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(name, images))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-stone-50 pt-20 lg:pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-3xl font-bold text-stone-800 mb-8">Đơn hàng của tôi</h1>

        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-mono text-sm text-stone-500 mb-1">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-stone-500">{formatDate(order.created_at)}</p>
                  </div>
                  <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>

                {/* Items preview */}
                <div className="flex gap-3 mb-4 flex-wrap">
                  {order.items?.slice(0, 4).map((item: { id: string; quantity: number; product: { name: string; images: string[] } }) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <img src={item.product?.images?.[0] || ''} alt={item.product?.name}
                        className="w-12 h-12 object-cover rounded-lg" />
                      <div className="text-sm">
                        <p className="font-medium text-stone-700 line-clamp-1 max-w-[120px]">{item.product?.name}</p>
                        <p className="text-stone-400">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {(order.items?.length ?? 0) > 4 && (
                    <div className="flex items-center text-sm text-stone-400">
                      +{(order.items?.length ?? 0) - 4} sản phẩm
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                  <div>
                    <span className="text-sm text-stone-500">Tổng tiền: </span>
                    <span className="font-bold text-moss-700 text-lg">{formatPrice(order.total)}</span>
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
