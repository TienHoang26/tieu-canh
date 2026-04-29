'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Leaf, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Xin chào! 🌿 Tôi là trợ lý AI của Tiểu Cảnh Việt. Tôi có thể giúp bạn:\n• Tìm sản phẩm phù hợp\n• Tư vấn cách chăm sóc cây\n• Trả lời câu hỏi về đơn hàng\n\nBạn cần tư vấn gì?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat window */}
      <div className={cn(
        'fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 z-50 transition-all duration-300',
        open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      )}>
        <div className="card shadow-2xl flex flex-col h-[500px]">
          {/* Header */}
          <div className="bg-moss-700 text-white px-4 py-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-moss-500 rounded-full flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">Tư vấn AI</p>
                <p className="text-xs text-moss-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Trực tuyến 24/7
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full hover:bg-moss-600 flex items-center justify-center transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-moss-100 rounded-full flex items-center justify-center mr-2 mt-0.5 shrink-0">
                    <Leaf className="w-3.5 h-3.5 text-moss-600" />
                  </div>
                )}
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line',
                  msg.role === 'user'
                    ? 'bg-moss-600 text-white rounded-tr-sm'
                    : 'bg-stone-100 text-stone-800 rounded-tl-sm'
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-moss-100 rounded-full flex items-center justify-center mr-2 shrink-0">
                  <Leaf className="w-3.5 h-3.5 text-moss-600" />
                </div>
                <div className="bg-stone-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-moss-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            {['Sản phẩm hot', 'Cách chăm cây', 'Giao hàng?'].map(q => (
              <button key={q} onClick={() => setInput(q)}
                className="text-xs bg-moss-50 text-moss-700 border border-moss-200 px-3 py-1.5 rounded-full hover:bg-moss-100 transition-colors">
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-stone-100 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Nhập câu hỏi..."
              className="flex-1 bg-stone-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-moss-500 text-stone-800 placeholder-stone-400"
            />
            <button onClick={sendMessage} disabled={!input.trim() || loading}
              className="w-10 h-10 bg-moss-600 hover:bg-moss-700 disabled:bg-stone-300 text-white rounded-xl flex items-center justify-center transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 bg-moss-600 hover:bg-moss-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </>
  )
}
