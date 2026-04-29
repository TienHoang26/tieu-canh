'use client'

import { useState } from 'react'
import { Mail, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('subscribers').insert({ email })
    if (error?.code === '23505') {
      toast.error('Email này đã đăng ký rồi!')
    } else if (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại!')
    } else {
      setDone(true)
      toast.success('Đăng ký nhận tin thành công! 🌿')
    }
    setLoading(false)
  }

  return (
    <section className="py-20 bg-gradient-to-br from-moss-800 to-moss-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-leaf-pattern opacity-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-moss-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-earth-600/10 rounded-full blur-3xl" />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-5xl mb-6">📬</div>
        <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-4">
          Nhận ưu đãi &amp; kiến thức mỗi tuần
        </h2>
        <p className="text-moss-200 text-lg mb-8 leading-relaxed">
          Đăng ký để nhận thông báo về sản phẩm mới, hướng dẫn chăm sóc cây và ưu đãi độc quyền dành riêng cho thành viên.
        </p>

        {done ? (
          <div className="flex items-center justify-center gap-3 text-green-300 text-lg font-semibold">
            <CheckCircle className="w-6 h-6" />
            Cảm ơn bạn đã đăng ký!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email của bạn..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-moss-300 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
              />
            </div>
            <button type="submit" disabled={loading}
              className="px-6 py-3.5 bg-white text-moss-800 font-bold rounded-xl hover:bg-moss-50 transition-colors flex items-center justify-center gap-2 shrink-0">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Đăng ký
            </button>
          </form>
        )}

        <p className="text-moss-400 text-xs mt-4">Không spam. Có thể huỷ đăng ký bất cứ lúc nào.</p>
      </div>
    </section>
  )
}
