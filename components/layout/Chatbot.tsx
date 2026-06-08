'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Leaf } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_REPLIES = [
  { label: '🌿 Sản phẩm hot',  value: 'Cho tôi xem những sản phẩm bán chạy nhất' },
  { label: '🪴 Chăm sóc cây', value: 'Hướng dẫn chăm sóc cây cảnh' },
  { label: '🚚 Giao hàng',     value: 'Chính sách giao hàng như thế nào?' },
  { label: '💰 Ưu đãi',        value: 'Có chương trình khuyến mãi gì không?' },
]

const WELCOME: Message = {
  role: 'assistant',
  content:
    'Xin chào! 🌿 Tôi là trợ lý AI của **Tiểu Cảnh NVM**.\n\nTôi có thể giúp bạn:\n• Tư vấn sản phẩm phù hợp\n• Hướng dẫn chăm sóc cây\n• Hỏi về đơn hàng, giao hàng\n• Giải đáp thắc mắc khác\n\nBạn cần hỗ trợ gì hôm nay?',
}

type ProductRow = {
  name: string
  price: number
  sale_price: number | null
  stock: number
  featured: boolean
  category: unknown
  tags: unknown
}

async function buildSystemPrompt(): Promise<string> {
  const supabase = createClient()

  const [
    { data: products },
    { data: categories },
  ] = await Promise.all([
    supabase
      .from('products')
      .select('name, price, sale_price, stock, featured, category:categories(name), tags')
      .eq('active', true)
      .gt('stock', 0)
      .order('featured', { ascending: false })
      .limit(100),
    supabase
      .from('categories')
      .select('name, description'),
  ])

  const formatProduct = (p: ProductRow) => {
    const price = p.sale_price
      ? `${p.price.toLocaleString('vi-VN')}đ → Giá sale: ${p.sale_price.toLocaleString('vi-VN')}đ`
      : `${p.price.toLocaleString('vi-VN')}đ`
    const cat = (p.category as unknown as { name: string } | null)?.name ?? ''
    const tags = (p.tags as string[])?.join(', ') ?? ''
    return `- ${p.name} | Danh mục: ${cat} | Giá: ${price} | Kho: ${p.stock}${tags ? ` | Tags: ${tags}` : ''}`
  }

  const featured = (products as ProductRow[] | null)?.filter(p => p.featured) ?? []
  const normal   = (products as ProductRow[] | null)?.filter(p => !p.featured) ?? []

  const productList = `SẢN PHẨM NỔI BẬT / BÁN CHẠY:
${featured.length > 0 ? featured.map(formatProduct).join('\n') : 'Chưa có sản phẩm nổi bật'}

TẤT CẢ SẢN PHẨM CÒN HÀNG:
${normal.length > 0 ? normal.map(formatProduct).join('\n') : 'Không có sản phẩm khác'}`

  const categoryList = categories?.map((c: { name: string; description: string | null }) =>
    `- ${c.name}${c.description ? ': ' + c.description : ''}`
  ).join('\n') ?? ''

  return `Bạn là trợ lý AI của cửa hàng "Sân Vườn Tiểu Cảnh NVM" - chuyên bán cây cảnh, tiểu cảnh, đá phong thuỷ, chậu cây nghệ thuật tại TP. Hồ Chí Minh, Việt Nam.

THÔNG TIN CỬA HÀNG:
- Hotline: 0966.556.234 - 0982.424.345
- Email: tranhdadep@gmail.com
- Website: sanvuontieucanhnvm.vn

DANH MỤC SẢN PHẨM:
${categoryList}

${productList}

CHÍNH SÁCH:
- Giao hàng nội thành HCM: miễn phí đơn ≥500k, phí 30k dưới 500k
- Giao hàng toàn quốc: theo bưu cục, đơn ≥1 triệu được hỗ trợ phí
- Đổi trả: 7 ngày nếu cây hỏng do vận chuyển (kèm ảnh chứng minh)
- Thanh toán: COD, chuyển khoản, ví điện tử

NGUYÊN TẮC BẮT BUỘC - KHÔNG ĐƯỢC VI PHẠM:
1. CHỈ được nhắc đến sản phẩm có TÊN CHÍNH XÁC trong danh sách "SẢN PHẨM NỔI BẬT" hoặc "TẤT CẢ SẢN PHẨM CÒN HÀNG" ở trên
2. KHÔNG được tự tạo ra tên sản phẩm, giá, kích thước, mô tả không có trong danh sách
3. Nếu khách hỏi sản phẩm không có trong danh sách → trả lời: "Hiện tại cửa hàng chưa có sản phẩm này, bạn vui lòng gọi hotline 0966.556.234 để được tư vấn thêm nhé!"
4. Khi liệt kê sản phẩm → chỉ dùng tên và giá từ danh sách, không thêm bất kỳ thông tin nào khác ngoài danh sách

CÁCH TRẢ LỜI:
- Thân thiện, ngắn gọn, dùng emoji phù hợp 🌿
- Khi hỏi sản phẩm hot/bán chạy → liệt kê đúng nhóm SẢN PHẨM NỔI BẬT
- Khi hỏi theo danh mục (VD: "tiểu cảnh để bàn") → lọc theo cột "Danh mục" trong danh sách và chỉ liệt kê sản phẩm thuộc danh mục đó
- Khi hỏi tên/mã sản phẩm cụ thể → tìm chính xác trong danh sách
- Hỏi về đơn hàng → hướng vào /profile/orders
- Muốn mua → hướng vào /products
- Luôn trả lời bằng tiếng Việt`
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  const key = 'chat_session_id'
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(key, id)
  }
  return id
}

function renderContent(content: string) {
  const parts = content.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="font-semibold">{part}</strong>
      : <span key={i}>{part}</span>
  )
}

export default function ChatBot() {
  const [open, setOpen]           = useState(false)
  const [hasNewMsg, setHasNewMsg] = useState(false)
  const [messages, setMessages]   = useState<Message[]>([WELCOME])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [userId, setUserId]       = useState<string | null>(null)
  const [sessionId]               = useState(getSessionId)

  const systemPromptRef = useRef<string | null>(null)
  const messagesEndRef  = useRef<HTMLDivElement>(null)
  const inputRef        = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [])

  useEffect(() => {
    if (!sessionId) return
    const supabase = createClient()
    supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .then(({ data }: { data: Message[] | null }) => {
        if (data && data.length > 0) {
          setMessages([WELCOME, ...data])
        }
      })
  }, [sessionId])

  useEffect(() => {
    if (open) setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [messages, open])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300)
      setHasNewMsg(false)
      // Reset cache và fetch lại mỗi lần mở để đảm bảo data mới nhất
      systemPromptRef.current = null
      buildSystemPrompt().then(prompt => {
        systemPromptRef.current = prompt
      })
    }
  }, [open])

  const saveMessage = useCallback(async (msg: Message) => {
    const supabase = createClient()
    await supabase.from('chat_messages').insert({
      session_id: sessionId,
      user_id:    userId ?? null,
      role:       msg.role,
      content:    msg.content,
    })
  }, [sessionId, userId])

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMsg: Message = { role: 'user', content }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)
    await saveMessage(userMsg)

    try {
      if (!systemPromptRef.current) {
        systemPromptRef.current = await buildSystemPrompt()
      }

      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.slice(1),
          system:   systemPromptRef.current,
        }),
      })
      const data  = await res.json()
      const reply = data.message || 'Xin lỗi, tôi chưa hiểu câu hỏi. Bạn thử hỏi lại nhé!'
      const assistantMsg: Message = { role: 'assistant', content: reply }
      setMessages(prev => [...prev, assistantMsg])
      await saveMessage(assistantMsg)
      if (!open) setHasNewMsg(true)
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Xin lỗi, có lỗi kết nối 😔 Vui lòng thử lại hoặc gọi hotline **0966.556.234**!',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat window */}
      <div
        style={{
          position: 'fixed',
          bottom: '88px',
          right: '24px',
          zIndex: 50,
          width: 'min(calc(100vw - 2rem), 384px)',
        }}
        className={cn(
          'transition-all duration-300 ease-out',
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-5 pointer-events-none'
        )}
      >
        <div className="flex flex-col h-[520px] bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden">

          {/* Header */}
          <div className="bg-moss-700 text-white px-4 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 bg-moss-500 rounded-full flex items-center justify-center">
                  <Leaf className="w-4 h-4" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-moss-700 rounded-full" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-none mb-0.5">Tư vấn AI · NVM</p>
                <p className="text-xs text-moss-200">Trực tuyến · Phản hồi ngay</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-moss-600 flex items-center justify-center transition-colors"
              aria-label="Đóng chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
            {messages.map((msg, i) => (
              <div key={i} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-moss-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Leaf className="w-3.5 h-3.5 text-moss-600" />
                  </div>
                )}
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line',
                  msg.role === 'user'
                    ? 'bg-moss-600 text-white rounded-tr-sm'
                    : 'bg-stone-100 text-stone-800 rounded-tl-sm'
                )}>
                  {renderContent(msg.content)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 bg-moss-100 rounded-full flex items-center justify-center shrink-0">
                  <Leaf className="w-3.5 h-3.5 text-moss-600" />
                </div>
                <div className="bg-stone-100 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-moss-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-moss-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-moss-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          <div className="px-4 pb-2 flex gap-1.5 flex-wrap shrink-0">
            {QUICK_REPLIES.map(q => (
              <button
                key={q.value}
                onClick={() => sendMessage(q.value)}
                className="text-xs bg-moss-50 text-moss-700 border border-moss-200 px-2.5 py-1.5 rounded-full hover:bg-moss-100 transition-colors whitespace-nowrap"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-stone-100 flex gap-2 shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Nhập câu hỏi..."
              disabled={loading}
              className="flex-1 bg-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-moss-500 text-stone-800 placeholder-stone-400 disabled:opacity-60"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-moss-600 hover:bg-moss-700 disabled:bg-stone-300 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
              aria-label="Gửi"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 50,
        }}
        className={cn(
          'flex items-center gap-2 relative',
          'px-5 h-12 rounded-full shadow-xl',
          'transition-all duration-200 hover:scale-105 active:scale-95',
          open ? 'bg-stone-600 hover:bg-stone-700' : 'bg-moss-600 hover:bg-moss-700',
          'text-white font-medium text-sm'
        )}
        aria-label={open ? 'Đóng chat' : 'Mở chat tư vấn'}
      >
        {open ? (
          <>
            <X className="w-4 h-4" />
            <span>Đóng</span>
          </>
        ) : (
          <>
            <MessageCircle className="w-4 h-4" />
            <span>Tư vấn AI</span>
            <span className="absolute inset-0 rounded-full animate-ping bg-moss-400 opacity-20 pointer-events-none" />
            {hasNewMsg && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
            )}
          </>
        )}
      </button>
    </>
  )
}