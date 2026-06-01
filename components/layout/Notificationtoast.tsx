'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { CheckCircle2, Package, Truck, XCircle, Bell, X, ChevronRight, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Session } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type NotifType = 'order_confirmed' | 'order_shipped' | 'order_delivered' | 'order_cancelled' | 'general'

interface Notification {
  id: string
  type: NotifType
  title: string
  message: string
  order_id: string | null
  created_at: string
  read: boolean
}

const NOTIF_CONFIG: Record<NotifType, {
  icon: React.ReactNode
  color: string
  bg: string
  border: string
  bar: string
  label: string
}> = {
  order_confirmed: {
    icon:  <CheckCircle2 className="w-4 h-4" />,
    color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-400',
    label: 'Đã xác nhận',
  },
  order_shipped: {
    icon:  <Truck className="w-4 h-4" />,
    color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', bar: 'bg-blue-400',
    label: 'Đang giao',
  },
  order_delivered: {
    icon:  <Package className="w-4 h-4" />,
    color: 'text-moss-600', bg: 'bg-moss-50', border: 'border-moss-200', bar: 'bg-moss-500',
    label: 'Đã giao',
  },
  order_cancelled: {
    icon:  <XCircle className="w-4 h-4" />,
    color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', bar: 'bg-red-400',
    label: 'Đã huỷ',
  },
  general: {
    icon:  <Bell className="w-4 h-4" />,
    color: 'text-stone-600', bg: 'bg-stone-50', border: 'border-stone-200', bar: 'bg-stone-400',
    label: 'Thông báo',
  },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Vừa xong'
  if (m < 60) return `${m} phút trước`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} giờ trước`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} ngày trước`
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

// ─── Toast nổi (realtime) ────────────────────────────────────────────────────

function FloatToast({ notif, index, onDismiss }: { notif: Notification; index: number; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const cfg = NOTIF_CONFIG[notif.type] ?? NOTIF_CONFIG.general
  const AUTO_DISMISS = 6000

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 120)
    return () => clearTimeout(t)
  }, [index])

  useEffect(() => {
    const t = setTimeout(dismiss, AUTO_DISMISS)
    return () => clearTimeout(t)
  }, [])

  function dismiss() {
    setVisible(false)
    setTimeout(() => onDismiss(notif.id), 300)
  }

  return (
    <div
      role="alert"
      className={cn(
        'relative flex items-start gap-3 w-72 sm:w-80',
        'bg-white rounded-2xl shadow-xl border px-4 py-3.5 overflow-hidden',
        'transition-all duration-300 ease-out',
        cfg.border,
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
      )}
    >
      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5', cfg.bg, cfg.color)}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0 pr-5">
        <p className={cn('text-base font-semibold leading-snug', cfg.color)}>{notif.title}</p>
        <p className="text-sm text-stone-500 mt-0.5 leading-relaxed">{notif.message}</p>
        {notif.order_id && (
          <Link href={`/orders`} className={cn('inline-flex items-center gap-0.5 text-xs font-medium mt-1 hover:underline', cfg.color)} onClick={dismiss}>
            Xem đơn hàng <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      <button onClick={dismiss} className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors">
        <X className="w-3 h-3" />
      </button>
      <div className="absolute bottom-0 left-0 right-0 h-0.5">
        <div className={cn('h-full', cfg.bar)} style={{ animation: `shrinkWidth ${AUTO_DISMISS}ms linear forwards` }} />
      </div>
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function NotificationToast() {
  const [allNotifs, setAllNotifs] = useState<Notification[]>([])
  const [floatQueue, setFloatQueue] = useState<Notification[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'unread' | 'all'>('unread')
  const [unreadCount, setUnreadCount] = useState(0)
  const [fetching, setFetching] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Đóng panel khi click ngoài
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const fetchAll = useCallback(async (uid: string) => {
    setFetching(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(30)
    setAllNotifs((data as Notification[]) ?? [])
    setFetching(false)
  }, [])

  // Init
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }: { data: { session: Session | null } }) => {
      if (!session?.user) return
      const uid = session.user.id
      setUserId(uid)
      // Đếm unread
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', uid)
        .eq('read', false)
      setUnreadCount(count ?? 0)
      // Fetch unread để hiện float toast lúc đầu vào
      const { data: unread } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', uid)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(3)
      if (unread?.length) {
        setTimeout(() => setFloatQueue(unread as Notification[]), 1200)
      }
    })
  }, [])

  // Realtime
  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`notif:${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload: { new: Notification }) => {
          setFloatQueue(prev => [payload.new, ...prev].slice(0, 3))
          setUnreadCount(prev => prev + 1)
          setAllNotifs(prev => [payload.new, ...prev])
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const dismissFloat = useCallback(async (id: string) => {
    setFloatQueue(prev => prev.filter(n => n.id !== id))
    const supabase = createClient()
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setUnreadCount(prev => Math.max(0, prev - 1))
    setAllNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markRead = useCallback(async (id: string) => {
    const supabase = createClient()
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setAllNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllRead = useCallback(async () => {
    if (!userId) return
    const supabase = createClient()
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
    setAllNotifs(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
    setFloatQueue([])
  }, [userId])

  const handleOpenPanel = async () => {
    if (!open && userId) await fetchAll(userId)
    setOpen(prev => !prev)
  }

  const displayed = tab === 'unread' ? allNotifs.filter(n => !n.read) : allNotifs

  return (
    <>
      <style>{`
        @keyframes shrinkWidth { from { width: 100%; } to { width: 0%; } }
        @keyframes bellRing {
          0%,100% { transform: rotate(0deg); }
          20% { transform: rotate(-15deg); }
          40% { transform: rotate(15deg); }
          60% { transform: rotate(-10deg); }
          80% { transform: rotate(10deg); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div ref={panelRef} className="fixed top-1/2 -translate-y-1/2 left-4 sm:left-5 z-[60] flex items-center gap-3">

        {/* Nút chuông */}
        <button
          onClick={handleOpenPanel}
          className="relative w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 shrink-0"
          aria-label="Thông báo"
        >
          <Bell className={cn('w-5 h-5', unreadCount > 0 && 'animate-[bellRing_0.6s_ease-in-out]')} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Panel lịch sử */}
        {open && (
          <div
            className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden"
            style={{ animation: 'slideIn 0.2s ease-out' }}
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-stone-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-stone-800 text-base">Thông báo</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-sm text-moss-600 hover:text-moss-800 font-medium transition-colors">
                      Đọc tất cả
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {/* Tabs */}
              <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
                {(['unread', 'all'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      'flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all',
                      tab === t ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                    )}
                  >
                    {t === 'unread' ? `Chưa đọc${unreadCount > 0 ? ` (${unreadCount})` : ''}` : 'Tất cả'}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[360px]">
              {fetching ? (
                <div className="flex items-center justify-center gap-2 py-10 text-stone-400 text-sm">
                  <span className="w-4 h-4 border-2 border-stone-200 border-t-moss-500 rounded-full animate-spin" />
                  Đang tải...
                </div>
              ) : displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                    <Bell className="w-6 h-6 text-stone-300" />
                  </div>
                  <p className="text-base font-medium text-stone-500">
                    {tab === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
                  </p>
                  <p className="text-sm text-stone-400 mt-1">
                    {tab === 'unread' ? 'Bạn đã xem hết rồi!' : 'Thông báo đơn hàng sẽ hiện ở đây'}
                  </p>
                </div>
              ) : (
                displayed.map(n => {
                  const cfg = NOTIF_CONFIG[n.type] ?? NOTIF_CONFIG.general
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3.5 border-b border-stone-50 last:border-0 transition-colors',
                        n.read ? 'bg-white hover:bg-stone-50' : 'bg-moss-50/40 hover:bg-moss-50/70'
                      )}
                    >
                      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5', cfg.bg, cfg.color)}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn('text-base font-semibold leading-snug', n.read ? 'text-stone-700' : cfg.color)}>
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-moss-500 shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-stone-500 mt-0.5 leading-relaxed">{n.message}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-stone-400">
                            <Clock className="w-3 h-3" />
                            {timeAgo(n.created_at)}
                          </span>
                          <div className="flex items-center gap-2">
                            {n.order_id && (
                              <Link href={`/orders`} className={cn('text-sm font-medium hover:underline flex items-center gap-0.5', cfg.color)}>
                                Xem đơn <ChevronRight className="w-3 h-3" />
                              </Link>
                            )}
                            {!n.read && (
                              <button onClick={() => markRead(n.id)} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
                                Đánh dấu đã đọc
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Float toasts (realtime) — xổ bên phải, chỉ hiện khi panel đóng */}
        {!open && floatQueue.length > 0 && (
          <div className="flex flex-col gap-2" aria-live="polite">
            {floatQueue.map((n, i) => (
              <FloatToast key={n.id} notif={n} index={i} onDismiss={dismissFloat} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}