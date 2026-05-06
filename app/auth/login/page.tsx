'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Leaf, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const supabase = createClient()
      
      // 1. Dọn dẹp session cũ để tránh xung đột
      await supabase.auth.signOut()

      // 2. Thực hiện đăng nhập
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        toast.error('Email hoặc mật khẩu không chính xác')
        setLoading(false)
        return
      }

      if (data?.user) {
        toast.success('Đăng nhập thành công!')

        // 3. Kiểm tra quyền hạn
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        // Đợi 600ms để Vercel ghi cookie xuống Edge Network
        await new Promise(r => setTimeout(r, 600))

        // 4. Ép trình duyệt tải lại toàn bộ trang (Hard Navigation)
        const target = profile?.role === 'admin' ? '/admin' : redirectPath
        window.location.href = target 
      }
    } catch (err) {
      console.error('Login error:', err)
      toast.error('Lỗi hệ thống, vui lòng thử lại sau!')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-stone-200">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-moss-600 rounded-xl flex items-center justify-center">
            <Leaf className="text-white w-7 h-7" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-stone-800 mb-2">Chào mừng trở lại</h2>
        <p className="text-center text-stone-500 mb-8">Vui lòng đăng nhập để tiếp tục</p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <input 
              type="email" required placeholder="name@company.com"
              className="w-full p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-moss-500 outline-none transition-all"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <input 
                type={showPass ? 'text' : 'password'} required placeholder="••••••••"
                className="w-full p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-moss-500 outline-none transition-all"
                value={password} onChange={e => setPassword(e.target.value)}
              />
              <button 
                type="button" className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-600"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button 
            disabled={loading} type="submit" 
            className="w-full bg-moss-600 text-white py-3.5 rounded-xl font-bold hover:bg-moss-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}