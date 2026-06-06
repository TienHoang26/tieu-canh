'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Loader2, Leaf, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const LOGIN_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Nunito:wght@400;500;600;700&display=swap');

.lp-root {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-family: 'Nunito', sans-serif;
}
.lp-card {
  display: flex;
  width: 100%;
  max-width: 900px;
  min-height: 560px;
  background: #fff;
  border-radius: 24px;
  overflow: visible;
  box-shadow: 0 8px 48px rgba(45,110,48,0.14);
  position: relative;
}
.lp-left {
  position: relative;
  width: 44%;
  flex-shrink: 0;
  background: linear-gradient(160deg, #3d8b40 0%, #2d6e30 45%, #255728 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 32px;
  overflow: hidden;
  border-radius: 24px 0 0 24px;
}
.lp-left-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.lp-left-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(10,40,10,0.15) 0%, rgba(5,20,5,0.78) 100%);
}
.lp-left-info { position: relative; z-index: 2; }
.lp-left-icon {
  width: 42px;
  height: 42px;
  background: rgba(255,255,255,0.18);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  backdrop-filter: blur(6px);
}
.lp-left-title {
  font-family: 'Playfair Display', serif;
  font-size: 19px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 6px 0;
  letter-spacing: 0.02em;
  text-shadow: 0 2px 8px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9);
  line-height: 1.35;
}
.lp-left-sub {
  font-size: 12.5px;
  color: rgba(255,255,255,0.82);
  margin: 0 0 12px 0;
  line-height: 1.6;
}
.lp-left-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.lp-left-tag {
  font-size: 11.5px;
  color: rgba(255,255,255,0.92);
  background: rgba(255,255,255,0.14);
  border: 1px solid rgba(255,255,255,0.22);
  border-radius: 20px;
  padding: 4px 11px;
  backdrop-filter: blur(4px);
}
.lp-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 44px 40px;
  border-radius: 0 24px 24px 0;
}
.lp-heading {
  font-family: 'Playfair Display', serif;
  font-size: 30px;
  font-weight: 800;
  color: #1f4522;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin: 0 0 6px 0;
}
.lp-subheading { font-size: 14px; color: #5a8a5e; margin: 0 0 26px 0; }
.lp-input-group { position: relative; margin-bottom: 14px; }
.lp-input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #5a8a5e;
  width: 17px;
  height: 17px;
}
.lp-input {
  width: 100%;
  box-sizing: border-box;
  padding: 13px 42px 13px 42px;
  border: 1.5px solid #b9ddb9;
  border-radius: 10px;
  font-family: 'Nunito', sans-serif;
  font-size: 14.5px;
  color: #1f4522;
  background: #f4f9f4;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.lp-input::placeholder { color: #8cc48d; }
.lp-input:focus {
  border-color: #2d6e30;
  box-shadow: 0 0 0 3px rgba(45,110,48,0.12);
  background: #fff;
}
.lp-input-eye {
  position: absolute;
  right: 13px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #5a8a5e;
  padding: 0;
  display: flex;
  align-items: center;
}
.lp-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.lp-remember {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13.5px;
  color: #3d6e40;
  cursor: pointer;
  user-select: none;
}
.lp-remember input[type="checkbox"] {
  accent-color: #2d6e30;
  width: 15px;
  height: 15px;
  cursor: pointer;
}
.lp-forgot {
  font-size: 13.5px;
  color: #3d6e40;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.18s;
}
.lp-forgot:hover { color: #1f4522; }
.lp-btn {
  width: 100%;
  padding: 14px;
  background: #2d6e30;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: 'Nunito', sans-serif;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s, transform 0.15s;
  margin-bottom: 18px;
}
.lp-btn:hover:not(:disabled) { background: #1f4522; transform: translateY(-1px); }
.lp-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.lp-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.lp-divider-line { flex: 1; height: 1px; background: #b9ddb9; }
.lp-divider-text { font-size: 13px; color: #5a8a5e; white-space: nowrap; }
.lp-social-row { display: flex; gap: 10px; margin-bottom: 20px; }
.lp-social-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 8px;
  border-radius: 10px;
  border: 1.5px solid #b9ddb9;
  background: #f4f9f4;
  font-family: 'Nunito', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s, transform 0.15s;
}
.lp-social-btn:hover:not(:disabled) { background: #dceedd; border-color: #2d6e30; transform: translateY(-1px); }
.lp-social-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.lp-social-google { color: #1f4522; }
.lp-social-fb { color: #fff; background: #1877F2; border-color: #1877F2; }
.lp-social-fb:hover:not(:disabled) { background: #1464d8; border-color: #1464d8; }
.lp-google-g { width: 18px; height: 18px; }
.lp-footer { text-align: center; font-size: 13.5px; color: #5a8a5e; }
.lp-footer a {
  color: #1f4522;
  font-weight: 700;
  font-size: 13.5px;
  text-decoration: underline;
  transition: color 0.18s;
}
.lp-footer a:hover { color: #2d6e30; }

@media (max-width: 600px) {
  .lp-left { display: none; }
  .lp-right { padding: 32px 24px; border-radius: 24px; }
  .lp-card { border-radius: 24px; }
}
`

function LoginForm() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [facebookLoading, setFacebookLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        toast.error(
          error.message === 'Invalid login credentials'
            ? 'Email hoặc mật khẩu không đúng'
            : error.message
        )
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      toast.success('Đăng nhập thành công!')

      const destination = profile?.role === 'admin' ? '/admin' : redirect
      router.push(destination)
      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      toast.error('Có lỗi xảy ra, thử lại!')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      const supabase = createClient()
      const callbackUrl = `${window.location.origin}/api/auth/callback`
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          queryParams: { prompt: 'select_account' },
        },
      })
    } catch (err) {
      console.error('Google login error:', err)
      toast.error('Có lỗi xảy ra, thử lại!')
      setGoogleLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    setFacebookLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
    } catch (err) {
      console.error('Facebook login error:', err)
      toast.error('Có lỗi xảy ra, thử lại!')
      setFacebookLoading(false)
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LOGIN_CSS }} />

      <div className="lp-root">
        <div className="lp-card">

          {/* LEFT panel */}
          <div className="lp-left">
            <img
              src="/Login.jpg"
              alt="Sân Vườn Tiểu Cảnh NVM"
              className="lp-left-img"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div className="lp-left-overlay" />
            <div className="lp-left-info">
              <div className="lp-left-icon">
                <Leaf style={{ width: 22, height: 22, color: '#fff' }} />
              </div>
              <p className="lp-left-title">SÂN VƯỜN TIỂU CẢNH NVM</p>
              <p className="lp-left-sub">Kho tàng tri thức và hoài niệm đang chờ bạn khám phá.</p>
              <div className="lp-left-tags">
                <span className="lp-left-tag">🌿 Bonsai</span>
                <span className="lp-left-tag">💧 Thác nước</span>
                <span className="lp-left-tag">🪨 Hòn non bộ</span>
              </div>
            </div>
          </div>

          {/* RIGHT panel */}
          <div className="lp-right">
            <h1 className="lp-heading">Chào mừng trở lại!</h1>
            <p className="lp-subheading">Đăng nhập để tiếp tục</p>

            <div className="lp-input-group">
              <Mail className="lp-input-icon" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="lp-input"
                onKeyDown={e => e.key === 'Enter' && handleLogin(e as any)}
              />
            </div>

            <div className="lp-input-group">
              <Lock className="lp-input-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Mật khẩu"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="lp-input"
                onKeyDown={e => e.key === 'Enter' && handleLogin(e as any)}
              />
              <button type="button" className="lp-input-eye" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>

            <div className="lp-row">
              <label className="lp-remember">
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                Nhớ mật khẩu
              </label>
              <Link href="/forgot-password" className="lp-forgot">Quên mật khẩu?</Link>
            </div>

            <button onClick={handleLogin} disabled={loading} className="lp-btn">
              {loading ? <Loader2 style={{ width: 17, height: 17 }} className="animate-spin" /> : <LogIn style={{ width: 17, height: 17 }} />}
              Đăng nhập
            </button>

            <div className="lp-divider">
              <div className="lp-divider-line" />
              <span className="lp-divider-text">hoặc đăng nhập với</span>
              <div className="lp-divider-line" />
            </div>

            <div className="lp-social-row">
              <button onClick={handleGoogleLogin} disabled={googleLoading} className="lp-social-btn lp-social-google">
                {googleLoading ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : (
                  <svg className="lp-google-g" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Google
              </button>
              <button onClick={handleFacebookLogin} disabled={facebookLoading} className="lp-social-btn lp-social-fb">
                {facebookLoading ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )}
                Facebook
              </button>
            </div>

            <div className="lp-footer">
              Chưa có tài khoản?{' '}
              <Link href="/auth/register">Đăng ký ngay</Link>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}