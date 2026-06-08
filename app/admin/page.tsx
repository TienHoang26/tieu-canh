'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts'

// ── Types ──────────────────────────────────────────────────────────────────
type Order = {
  id: string
  total: number
  status: string
  created_at: string
  shipping_name: string
  profile?: { full_name: string; email: string } | null
}
type Product = {
  id: string
  name: string
  price: number
  stock: number
  category: { name: string } | null
  active: boolean
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatPrice(v: number) {
  return v.toLocaleString('vi-VN') + '₫'
}
function formatDate(s: string) {
  return new Date(s).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit' })
}
function buildSparkPath(values: number[], w = 64, h = 24): string {
  if (values.length < 2) return ''
  const min = Math.min(...values), max = Math.max(...values)
  const range = max - min || 1
  const pts = values.map((v, i) => {
    const x = ((i / (values.length - 1)) * w).toFixed(1)
    const y = (h - ((v - min) / range) * (h - 2) - 1).toFixed(1)
    return `${x},${y}`
  })
  return 'M' + pts.join(' L')
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipping:  'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}
const STATUS_LABELS: Record<string, string> = {
  pending:   'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping:  'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã huỷ',
}

// ── Component ──────────────────────────────────────────────────────────────
export default function DashboardClient() {
  const router = useRouter()
  const [loading,       setLoading]       = useState(true)
  const [lastUpdate,    setLastUpdate]    = useState(new Date())
  const [totalOrders,   setTotalOrders]   = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalUsers,    setTotalUsers]    = useState(0)
  const [totalRevenue,  setTotalRevenue]  = useState(0)
  const [recentOrders,  setRecentOrders]  = useState<Order[]>([])
  const [lowStock,      setLowStock]      = useState<Product[]>([])
  const [ordersByDay,   setOrdersByDay]   = useState<{ date: string; đơn: number; doanh_thu: number }[]>([])
  const [ordersByStatus,setOrdersByStatus]= useState<{ status: string; count: number }[]>([])
  const [chartTab,      setChartTab]      = useState<'đơn' | 'doanh_thu'>('doanh_thu')
  const [kpiHover,      setKpiHover]      = useState<number | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const [
      { count: orders },
      { count: products },
      { count: users },
      { data: recent },
      { data: delivered },
      { data: allOrders },
      { data: stockProds },
    ] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('orders')
        .select('*, profile:profiles(full_name, email)')
        .order('created_at', { ascending: false }).limit(7),
      supabase.from('orders')
  .select('total')
  .or('status.eq.delivered,payment_status.eq.paid'),
      supabase.from('orders')
        .select('created_at, total, status, payment_status')
        .order('created_at', { ascending: true })
        .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
      supabase.from('products')
        .select('id, name, price, stock, active, category:categories(name)')
        .eq('active', true)
        .lt('stock',3)
        .order('stock', { ascending: true }),
    ])

    setTotalOrders(orders ?? 0)
    setTotalProducts(products ?? 0)
    setTotalUsers(users ?? 0)
    setTotalRevenue(delivered?.reduce((s: number, o: { total: number }) => s + o.total, 0) ?? 0)
    setRecentOrders((recent as Order[]) ?? [])
    setLowStock((stockProds as unknown as Product[]) ?? [])

    // Build 30-day chart data
    const dayMap: Record<string, { đơn: number; doanh_thu: number }> = {}
    allOrders?.forEach((o: { created_at: string; total: number; status: string; payment_status: string }) => {
  const d = formatDate(o.created_at)
  if (!dayMap[d]) dayMap[d] = { đơn: 0, doanh_thu: 0 }
  dayMap[d].đơn++
  if (o.status === 'delivered' || o.payment_status === 'paid') 
    dayMap[d].doanh_thu += o.total
})
    setOrdersByDay(Object.entries(dayMap).map(([date, v]) => ({ date, ...v })))

    // Build status breakdown
    const statusMap: Record<string, number> = {}
    allOrders?.forEach((o: { status: string }) => { statusMap[o.status] = (statusMap[o.status] || 0) + 1 })
    setOrdersByStatus(Object.entries(statusMap).map(([status, count]) => ({ status, count })))

    setLastUpdate(new Date())
    setLoading(false)
  }

  // Sparkline seeds from real data
  const revenueValues = ordersByDay.map(d => d.doanh_thu / 1000)
  const orderValues   = ordersByDay.map(d => d.đơn)

  const kpiSparks = [
    Array.from({ length: 12 }, (_, i) => totalOrders   * (0.5 + i * 0.05 + Math.sin(i) * 0.1)),
    Array.from({ length: 12 }, (_, i) => totalProducts  * (0.8 + Math.sin(i * 0.7) * 0.1)),
    Array.from({ length: 12 }, (_, i) => totalUsers     * (0.6 + i * 0.04 + Math.cos(i) * 0.05)),
    revenueValues.length > 2 ? revenueValues : Array.from({ length: 12 }, (_, i) => totalRevenue / 1000 * (0.4 + i * 0.06)),
  ]

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string
  }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            <span style={{ color: '#475569' }}>{p.name}:</span>
            <strong style={{ color: '#0f172a' }}>
              {p.name === 'Doanh thu' ? formatPrice(p.value) : p.value}
            </strong>
          </div>
        ))}
      </div>
    )
  }

  const tabBtn = (active: boolean, label: string, onClick: () => void) => (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 20, fontSize: 13, cursor: 'pointer', fontWeight: 500,
      background: active ? '#16a34a' : '#f8fafc',
      color: active ? '#fff' : '#64748b',
      border: active ? '1px solid #16a34a' : '1px solid #e2e8f0',
    }}>{label}</button>
  )

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 4px 16px rgba(22,163,74,0.3)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M3 3h18v4H3zM3 10h8v11H3zM14 10h7v11h-7z" /></svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>Đang tải dữ liệu...</div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Đang phân tích dashboard</div>
          <style>{`@keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}`}</style>
          <div style={{ width: 180, height: 4, background: '#e2e8f0', borderRadius: 4, margin: '16px auto 0', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '50%', background: 'linear-gradient(90deg,#16a34a,#4ade80)', borderRadius: 4, animation: 'slide 1.4s ease-in-out infinite' }} />
          </div>
        </div>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        .db-grid-4      { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
        .db-grid-2      { display:grid; grid-template-columns:1fr; gap:14px; }
        .db-grid-3col   { display:grid; grid-template-columns:1fr; gap:14px; }
        @media(min-width:768px){
          .db-grid-4    { grid-template-columns:repeat(4,1fr); gap:16px; }
          .db-grid-2    { grid-template-columns:1fr 1fr; gap:16px; }
          .db-grid-3col { grid-template-columns:1fr 340px; gap:16px; }
        }
        @media(min-width:1280px){
          .db-grid-4    { gap:20px; }
          .db-grid-2    { gap:20px; }
          .db-grid-3col { grid-template-columns:1fr 380px; gap:20px; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Dashboard 🌿</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>
            Tổng quan · Cập nhật {lastUpdate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button onClick={load} style={{ fontSize: 13, padding: '8px 14px', borderRadius: 8, background: '#fff', color: '#475569', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          ↻ Làm mới
        </button>
      </div>

      {/* ── Summary bar ── */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', flexShrink: 0 }}>📋 Trạng thái đơn hàng</div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ display: 'flex', gap: 2, height: 7, borderRadius: 6, overflow: 'hidden' }}>
            {ordersByStatus.map(s => (
              <div key={s.status} style={{ flex: s.count, minWidth: 4, background: s.status === 'delivered' ? '#4ade80' : s.status === 'cancelled' ? '#f87171' : s.status === 'shipping' ? '#a78bfa' : s.status === 'confirmed' ? '#60a5fa' : '#fbbf24' }} title={`${STATUS_LABELS[s.status]}: ${s.count}`} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flexShrink: 0 }}>
          {ordersByStatus.map(s => (
            <span key={s.status} style={{ fontSize: 12, color: '#64748b' }}>
              {STATUS_LABELS[s.status] || s.status}: <strong style={{ color: '#0f172a' }}>{s.count}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* ── 4 KPI cards ── */}
      <div className="db-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Tổng đơn hàng',  value: totalOrders,               unit: 'đơn',      desc: 'Tất cả trạng thái',            bg: '#eff6ff', border: '#bfdbfe', num: '#1d4ed8', sparkColor: '#3b82f6', icon: '🛍️' },
          { label: 'Sản phẩm active', value: totalProducts,             unit: 'sp',       desc: 'Đang bán trên store',          bg: '#f0fdf4', border: '#bbf7d0', num: '#15803d', sparkColor: '#16a34a', icon: '📦' },
          { label: 'Khách hàng',      value: totalUsers,                unit: 'người',    desc: 'Tài khoản đã đăng ký',         bg: '#faf5ff', border: '#e9d5ff', num: '#7e22ce', sparkColor: '#a855f7', icon: '👥' },
          { label: 'Doanh thu',       value: Math.round(totalRevenue / 1000), unit: 'K₫', desc: 'Từ đơn đã giao thành công',   bg: '#fff7ed', border: '#fed7aa', num: '#c2410c', sparkColor: '#f97316', icon: '💰' },
        ].map((k, i) => (
          <div key={i}
            onMouseEnter={() => setKpiHover(i)}
            onMouseLeave={() => setKpiHover(null)}
            style={{ background: k.bg, border: `1px solid ${k.border}`, borderRadius: 14, padding: '16px 18px', position: 'relative', overflow: 'hidden', cursor: 'default', transition: 'box-shadow 0.15s', boxShadow: kpiHover === i ? '0 4px 16px rgba(0,0,0,0.08)' : 'none' }}>
            {/* Sparkline */}
            <svg width="100%" height="36" viewBox="0 0 80 24" preserveAspectRatio="none"
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: kpiHover === i ? 0.22 : 0.1, transition: 'opacity 0.2s' }}>
              <path d={buildSparkPath(kpiSparks[i], 80, 24)} fill="none" stroke={k.sparkColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{k.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: k.num, letterSpacing: '-0.02em', lineHeight: 1 }}>
                {k.value.toLocaleString()}<span style={{ fontSize: 13, fontWeight: 500, marginLeft: 4 }}>{k.unit}</span>
              </div>
              <div style={{ fontSize: 13, color: '#334155', marginTop: 6, fontWeight: 600 }}>{k.label}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{k.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart + Low stock ── */}
      <div className="db-grid-3col" style={{ marginBottom: 20 }}>

        {/* Chart */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>📊 Xu hướng 30 ngày qua</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Theo ngày đặt hàng</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {tabBtn(chartTab === 'doanh_thu', '💰 Doanh thu', () => setChartTab('doanh_thu'))}
              {tabBtn(chartTab === 'đơn', '📦 Số đơn', () => setChartTab('đơn'))}
            </div>
          </div>
          {ordersByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={ordersByDay} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} interval={Math.floor(ordersByDay.length / 6)} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} width={34} />
                <Tooltip content={<CustomTooltip />} />
                {chartTab === 'doanh_thu'
                  ? <Area type="monotone" dataKey="doanh_thu" name="Doanh thu" stroke="#16a34a" strokeWidth={2} fill="url(#gRevenue)" dot={false} />
                  : <Area type="monotone" dataKey="đơn" name="Số đơn" stroke="#3b82f6" strokeWidth={2} fill="url(#gOrders)" dot={false} />
                }
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>
              Chưa có đơn hàng trong 30 ngày qua
            </div>
          )}
          <div style={{ marginTop: 10, padding: '8px 12px', background: '#f0fdf4', borderRadius: 10, fontSize: 13, color: '#15803d' }}>
            💡 {chartTab === 'doanh_thu' ? 'Chỉ tính đơn đã giao thành công.' : 'Tổng tất cả đơn trong ngày.'}
          </div>
        </div>

        {/* Low stock */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>⚠️ Sắp hết hàng</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Sản phẩm còn dưới 3 sp</div>
          </div>
          {lowStock.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 14, color: '#16a34a', fontWeight: 600 }}>Kho hàng ổn định!</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Không có sản phẩm nào sắp hết</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
              {lowStock.map(p => {
                const pct = Math.min(100, Math.round((p.stock / 3) * 100))
                const isEmpty = p.stock === 0
                const isCrit = p.stock === 1
                const isWarn = p.stock === 2
                return (
                  <div key={p.id} style={{ padding: '12px', borderRadius: 12, background: isEmpty ? '#fff1f2' : isCrit ? '#fff7ed' : '#fefce8', border: `1px solid ${isEmpty ? '#fecdd3' : isCrit ? '#fed7aa' : '#fde68a'}` }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{p.name}</span>
    <span style={{ fontSize: 13, fontWeight: 700, color: isEmpty ? '#be123c' : isCrit ? '#c2410c' : '#92400e', flexShrink: 0 }}>
      {isEmpty ? '🔴' : isCrit ? '🟠' : '🟡'} {p.stock} sp
    </span>
  </div>
  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>{p.category?.name ?? '—'} · {formatPrice(p.price)}</div>
  <div style={{ height: 4, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
    <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: isEmpty ? '#ef4444' : isCrit ? '#f97316' : '#eab308' }} />
  </div>
  <div style={{ fontSize: 12, color: isEmpty ? '#be123c' : isCrit ? '#c2410c' : '#92400e', fontWeight: 500, marginTop: 5 }}>
    {isEmpty ? '🚫 Hết hàng!' : isCrit ? '⚡ Cảnh báo gấp!' : '👁️ Cần theo dõi'}
  </div>
</div>
                )
              })}
              <Link href="/admin/products" style={{ textAlign: 'center', fontSize: 13, color: '#16a34a', textDecoration: 'none', fontWeight: 500, padding: '8px', display: 'block' }}>
                Quản lý sản phẩm →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── 2 col: Recent orders + Quick actions ── */}
      <div className="db-grid-2" style={{ marginBottom: 20 }}>

        {/* Recent orders */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>🕐 Đơn hàng gần đây</div>
            <Link href="/admin/orders" style={{ fontSize: 13, color: '#16a34a', textDecoration: 'none', fontWeight: 500 }}>Xem tất cả →</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {['Mã đơn', 'Khách hàng', 'Tổng tiền', 'Trạng thái'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: '#94a3b8', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f8fafc' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#64748b' }}>
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#334155', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {(order.profile as { full_name: string } | null)?.full_name ?? order.shipping_name}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
                      {formatPrice(order.total)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 500 }}
                        className={STATUS_COLORS[order.status] || 'bg-stone-100 text-stone-600'}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>Chưa có đơn hàng nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>⚡ Thao tác nhanh</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>Truy cập nhanh các tính năng chính</div>
          {[
            { href: '/admin/products',    emoji: '📦', label: 'Quản lý sản phẩm',  sub: 'Thêm, sửa, xoá · Điều chỉnh giá & kho',    bg: '#f0fdf4', color: '#15803d' },
            { href: '/admin/orders',      emoji: '🛍️', label: 'Quản lý đơn hàng',  sub: 'Cập nhật trạng thái · Xác nhận đơn mới',   bg: '#eff6ff', color: '#1d4ed8' },
            { href: '/admin/blog',        emoji: '📝', label: 'Quản lý blog',       sub: 'Viết bài mới · Chỉnh sửa · Đăng/ẩn',       bg: '#faf5ff', color: '#7e22ce' },
            { href: '/admin/messages',    emoji: '💬', label: 'Tin nhắn liên hệ',   sub: 'Đọc & trả lời tin nhắn từ khách hàng',      bg: '#fff7ed', color: '#c2410c' },
            { href: '/admin/users',       emoji: '👥', label: 'Người dùng',         sub: 'Quản lý tài khoản · Cấp quyền admin',       bg: '#fdf4ff', color: '#86198f' },
            { href: '/admin/subscribers', emoji: '📬', label: 'Newsletter',         sub: 'Danh sách email đăng ký nhận tin',           bg: '#f0fdfa', color: '#0f766e' },
          ].map(a => (
            <Link key={a.href} href={a.href} style={{ textDecoration: 'none', display: 'block', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: a.bg, border: '1px solid #e2e8f0', transition: 'opacity 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{a.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{a.label}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.sub}</div>
                </div>
                <span style={{ fontSize: 16, color: a.color, flexShrink: 0 }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Status breakdown bar chart ── */}
      {ordersByStatus.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px', marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>📈 Phân bổ trạng thái đơn hàng (30 ngày)</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>Tổng số đơn theo từng giai đoạn xử lý</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={ordersByStatus.map(s => ({ ...s, tên: STATUS_LABELS[s.status] || s.status }))} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="tên" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} width={28} allowDecimals={false} />
              <Tooltip formatter={(v) => [String(v) + ' đơn', 'Số lượng']} />
              <Bar dataKey="count" name="Số đơn" radius={[6, 6, 0, 0]}>
                {ordersByStatus.map((s, i) => (
                  <Cell key={i} fill={
                    s.status === 'delivered' ? '#4ade80' :
                    s.status === 'cancelled' ? '#f87171' :
                    s.status === 'shipping'  ? '#a78bfa' :
                    s.status === 'confirmed' ? '#60a5fa' : '#fbbf24'
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  )
}