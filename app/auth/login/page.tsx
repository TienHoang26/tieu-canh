'use client'

import { useState, useEffect, Suspense } from 'react'
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

  useEffect(() => {
    const hasSbCookie = document.cookie.split(';').some(c => c.trim().startsWith('sb-'))
    if (hasSbCookie && !sessionStorage.getItem('just_logged_in')) {
      window.location.href = '/auth/clear'
    }
    sessionStorage.removeItem('just_logged_in')
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast.error(error.message === 'Invalid login credentials'
          ? 'Email hoặc mật khẩu không đúng'
          : error.message)
        setLoading(false)
        return
      }

      toast.success('Đăng nhập thành công!')
      sessionStorage.setItem('just_logged_in', 'true')

      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

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
      options: { redirectTo: `${window.location.origin}/api/auth/callback?redirect=${redirect}` },
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
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Tiếp tục với Google
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
                placeholder="ban@email.com"
                className="input"
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
                  placeholder="••••••••"
                  className="input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Đăng nhập
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            Chưa có tài khoản?{' '}
            <Link href="/auth/register" className="text-moss-600 font-semibold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-moss-800 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-moss-700 to-moss-900" />
        <div className="absolute inset-0 bg-leaf-pattern opacity-10" />
        <div className="relative text-center text-white px-12">
          <div className="text-8xl mb-8">🌿</div>
          <h2 className="font-display text-3xl font-bold mb-4">Thiên nhiên thu nhỏ</h2>
          <p className="text-moss-200 text-lg leading-relaxed">
            Khám phá hàng trăm sản phẩm tiểu cảnh độc đáo, được chế tác thủ công từ nguyên liệu tự nhiên.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}