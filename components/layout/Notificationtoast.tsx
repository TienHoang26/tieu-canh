'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, Package, Truck, XCircle, Bell, X, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
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
}> = {
  order_confirmed: {
    icon:   <CheckCircle2 className="w-5 h-5" />,
    color:  'text-emerald-600',
    bg:     'bg-emerald-50',
    border: 'border-emerald-200',
    bar:    'bg-emerald-400',
  },
  order_shipped: {
    icon:   <Truck className="w-5 h-5" />,
    color:  'text-blue-600',
    bg:     'bg-blue-50',
    border: 'border-blue-200',
    bar:    'bg-blue-400',
  },
  order_delivered: {
    icon:   <Package className="w-5 h-5" />,
    color:  'text-moss-600',
    bg:     'bg-moss-50',
    border: 'border-moss-200',
    bar:    'bg-moss-500',
  },
  order_cancelled: {
    icon:   <XCircle className="w-5 h-5" />,
    color:  'text-red-500',
    bg:     'bg-red-50',
    border: 'border-red-200',
    bar:    'bg-red-400',
  },
  general: {
    icon:   <Bell className="w-5 h-5" />,
    color:  'text-stone-600',
    bg:     'bg-stone-50',
    border: 'border-stone-200',
    bar:    'bg-stone-400',
  },
}

// ─── Single toast (xổ ra bên phải chuông) ────────────────────────────────────

function Toast({
  notif,
  index,
  onDismiss,
}: {
  notif: Notification
  index: number
  onDismiss: (id: string) => void
}) {
  const [visible, setVisible] = useState(false)
  const cfg = NOTIF_CONFIG[notif.type] ?? NOTIF_CONFIG.general
  const AUTO_DISMISS = 8000

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
        'relative flex items-start gap-3',
        'w-72 sm:w-80',
        'bg-white rounded-2xl shadow-lg border px-4 py-3.5 overflow-hidden',
        'transition-all duration-300 ease-out',
        cfg.border,
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
      )}
    >
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5', cfg.bg, cfg.color)}>
        {cfg.icon}
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <p className={cn('text-sm font-semibold leading-snug', cfg.color)}>{notif.title}</p>
        <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{notif.message}</p>
        {notif.order_id && (
          <Link
            href={`/profile/orders/${notif.order_id}`}
            className={cn('inline-flex items-center gap-0.5 text-xs font-medium mt-1.5 hover:underline', cfg.color)}
            onClick={dismiss}
          >
            Xem đơn hàng <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      <button
        onClick={dismiss}
        className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors"
        aria-label="Đóng thông báo"
      >
        <X className="w-3 h-3" />
      </button>

      <div className="absolute bottom-0 left-0 right-0 h-0.5">
        <div
          className={cn('h-full', cfg.bar)}
          style={{ animation: `shrinkWidth ${AUTO_DISMISS}ms linear forwards` }}
        />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NotificationToast() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const dismiss = useCallback(async (id: string) => {
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id)
      if (next.length === 0) setOpen(false)
      return next
    })
    const supabase = createClient()
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  // Fetch unread khi login lần đầu trong session
  useEffect(() => {
    const supabase = createClient()
    const SESSION_KEY = 'notif_fetched'

    supabase.auth.getUser().then(async ({ data }: { data: { user: { id: string } | null } }) => {
      if (!data.user) return
      setUserId(data.user.id)

      if (sessionStorage.getItem(SESSION_KEY) === data.user.id) {
        // Vẫn đếm số unread dù đã fetch rồi
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', data.user.id)
          .eq('read', false)
        setUnreadCount(count ?? 0)
        return
      }
      sessionStorage.setItem(SESSION_KEY, data.user.id)

      const { data: rows } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', data.user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(4)

      if (rows?.length) {
        setNotifications(rows as Notification[])
        setUnreadCount(rows.length)
        // Tự xổ ra sau 1 giây
        setTimeout(() => setOpen(true), 1000)
      }
    })
  }, [])

  // Realtime
  useEffect(() => {
    if (!userId) return
    const supabase = createClient()

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: { new: Notification }) => {
          setNotifications(prev => [payload.new, ...prev].slice(0, 4))
          setUnreadCount(prev => prev + 1)
          setOpen(true) // tự xổ ra ngay khi có thông báo mới
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return (
    <>
      <style>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to   { width: 0%; }
        }
        @keyframes bellRing {
          0%, 100% { transform: rotate(0deg); }
          20%       { transform: rotate(-15deg); }
          40%       { transform: rotate(15deg); }
          60%       { transform: rotate(-10deg); }
          80%       { transform: rotate(10deg); }
        }
      `}</style>

      {/* Chuông cố định giữa màn hình bên trái */}
      <div className="fixed top-1/2 -translate-y-1/2 left-4 sm:left-6 z-50 flex items-center gap-3">

        {/* Nút chuông */}
        <button
          onClick={() => setOpen(prev => !prev)}
          className="relative w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shrink-0 bg-yellow-400 hover:bg-yellow-500 text-yellow-900"
          aria-label="Thông báo"
        >
          <Bell className={cn('w-5 h-5', unreadCount > 0 && 'animate-[bellRing_0.6s_ease-in-out]')} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Toasts xổ ra bên phải chuông */}
        {open && notifications.length > 0 && (
          <div className="flex flex-col gap-2" aria-live="polite">
            {notifications.map((n, i) => (
              <Toast key={n.id} notif={n} index={i} onDismiss={dismiss} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}