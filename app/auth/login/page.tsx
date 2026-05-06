'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Leaf, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

function LoginForm() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        toast.error(
          error.message === 'Invalid login credentials'
            ? 'Email hoặc mật khẩu không đúng'
            : error.message
        )
        setLoading(false)
        return
      }

      toast.success('Đăng nhập thành công!')

      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

      // Dùng window.location.href thay router.push để force full page reload
      // giúp middleware đọc đúng cookie session mới, tránh vòng lặp xoay tròn
      if (profile?.role === 'admin') {
        window.location.href = '/admin'
      } else {
        window.location.href = redirect
      }

    } catch (err) {
      console.error('Login error:', err)
      toast.error('Có lỗi xảy ra, thử lại!')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?redirect=${redirect}`,
        queryParams: { prompt: 'select_account' },
      },
    })
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-4 py-16 lg:py-24">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-moss-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-stone-800">Tiểu Cảnh Việt</span>
          </Link>

          <h1 className="font-display text-3xl font-bold text-stone-800 mb-2">Đăng nhập</h1>
          <p className="text-stone-500 mb-8">Chào mừng bạn trở lại! 🌿</p>

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border-2 border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-xl py-3 font-medium text-stone-700 transition-all mb-6"
          >
            {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tiếp tục với Google'}
          </button>

          <div className="relative flex items-center gap-4 mb-6">
            <div className="flex-1 border-t border-stone-200" />
            <span className="text-sm text-stone-400">hoặc</span>
            <div className="flex-1 border-t border-stone-200" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-moss-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-moss-500 outline-none pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-moss-600 hover:bg-moss-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Đăng nhập
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}