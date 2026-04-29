'use client'

import { useState } from 'react'
import { Mail, MailOpen, X, Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Message {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  read: boolean
  created_at: string
}

export default function AdminMessagesClient({ messages: initial }: { messages: Message[] }) {
  const [messages, setMessages] = useState(initial)
  const [selected, setSelected] = useState<Message | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const unreadCount = messages.filter(m => !m.read).length
  const filtered = filter === 'unread' ? messages.filter(m => !m.read) : messages

  const openMessage = async (m: Message) => {
    setSelected(m)
    if (!m.read) {
      const supabase = createClient()
      await supabase.from('contact_messages').update({ read: true }).eq('id', m.id)
      setMessages(ms => ms.map(x => x.id === m.id ? { ...x, read: true } : x))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá tin nhắn này?')) return
    setDeleting(id)
    const supabase = createClient()
    const { error } = await supabase.from('contact_messages').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      setMessages(ms => ms.filter(m => m.id !== id))
      if (selected?.id === id) setSelected(null)
      toast.success('Đã xoá!')
    }
    setDeleting(null)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-stone-800">Tin nhắn liên hệ</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            {messages.length} tin nhắn{unreadCount > 0 && <span className="ml-2 badge bg-red-100 text-red-600">{unreadCount} chưa đọc</span>}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'unread'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              filter === f ? 'bg-stone-800 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300')}>
            {f === 'all' ? `Tất cả (${messages.length})` : `Chưa đọc (${unreadCount})`}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />Không có tin nhắn nào
            </div>
          ) : filtered.map(m => (
            <button key={m.id} onClick={() => openMessage(m)}
              className={cn(
                'w-full text-left p-4 rounded-2xl border-2 transition-all',
                selected?.id === m.id ? 'border-moss-400 bg-moss-50' : 'border-stone-100 bg-white hover:border-stone-200',
                !m.read && 'border-l-4 border-l-moss-500'
              )}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {m.read
                    ? <MailOpen className="w-4 h-4 text-stone-400 shrink-0" />
                    : <Mail className="w-4 h-4 text-moss-600 shrink-0" />}
                  <span className={cn('font-medium truncate', !m.read ? 'text-stone-900' : 'text-stone-600')}>{m.name}</span>
                </div>
                <span className="text-xs text-stone-400 shrink-0">{formatDate(m.created_at)}</span>
              </div>
              <p className="text-sm text-stone-500 mt-1 truncate pl-6">{m.subject ?? m.message}</p>
            </button>
          ))}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm h-fit sticky top-24">
            <div className="flex items-start justify-between mb-5">
              <h3 className="font-bold text-stone-800 text-lg">{selected.subject ?? 'Không có tiêu đề'}</h3>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-stone-100 rounded-lg">
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>
            <div className="space-y-2 text-sm bg-stone-50 rounded-xl p-4 mb-4">
              <div className="flex gap-2"><span className="text-stone-400 w-20 shrink-0">Họ tên:</span><span className="font-semibold text-stone-800">{selected.name}</span></div>
              <div className="flex gap-2"><span className="text-stone-400 w-20 shrink-0">Email:</span><a href={`mailto:${selected.email}`} className="text-moss-600 hover:underline">{selected.email}</a></div>
              {selected.phone && <div className="flex gap-2"><span className="text-stone-400 w-20 shrink-0">SĐT:</span><span className="font-medium">{selected.phone}</span></div>}
              <div className="flex gap-2"><span className="text-stone-400 w-20 shrink-0">Ngày:</span><span>{formatDate(selected.created_at)}</span></div>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 text-stone-700 leading-relaxed text-sm whitespace-pre-line mb-4">
              {selected.message}
            </div>
            <div className="flex gap-2">
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject ?? ''}`}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm">
                <Mail className="w-4 h-4" /> Trả lời qua Email
              </a>
              <button onClick={() => handleDelete(selected.id)} disabled={deleting === selected.id}
                className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-stone-200">
                {deleting === selected.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 flex items-center justify-center h-64">
            <div className="text-center text-stone-400">
              <Mail className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Chọn tin nhắn để xem chi tiết</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
