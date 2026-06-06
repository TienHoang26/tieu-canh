'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Loader2, Leaf, User, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const REGISTER_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Nunito:wght@400;500;600;700&display=swap');

.rp-root {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-family: 'Nunito', sans-serif;
}
.rp-card {
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
.rp-left {
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
.rp-left-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.rp-left-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(10,40,10,0.15) 0%, rgba(5,20,5,0.78) 100%);
}
.rp-left-info { position: relative; z-index: 2; }
.rp-left-icon {
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
.rp-left-title {
  font-family: 'Playfair Display', serif;
  font-size: 19px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 6px 0;
  letter-spacing: 0.02em;
  text-shadow: 0 2px 8px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9);
  line-height: 1.35;
}
.rp-left-sub {
  font-size: 12.5px;
  color: rgba(255,255,255,0.82);
  margin: 0 0 12px 0;
  line-height: 1.6;
}
.rp-left-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.rp-left-tag {
  font-size: 11.5px;
  color: rgba(255,255,255,0.92);
  background: rgba(255,255,255,0.14);
  border: 1px solid rgba(255,255,255,0.22);
  border-radius: 20px;
  padding: 4px 11px;
  backdrop-filter: blur(4px);
}
.rp-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 44px 40px;
  border-radius: 0 24px 24px 0;
}
.rp-heading {
  font-family: 'Playfair Display', serif;
  font-size: 30px;
  font-weight: 800;
  color: #1f4522;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin: 0 0 6px 0;
}
.rp-subheading { font-size: 14px; color: #5a8a5e; margin: 0 0 22px 0; }
.rp-input-group { position: relative; margin-bottom: 14px; }
.rp-input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #5a8a5e;
  width: 17px;
  height: 17px;
}
.rp-input {
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
.rp-input::placeholder { color: #8cc48d; }
.rp-input:focus {
  border-color: #2d6e30;
  box-shadow: 0 0 0 3px rgba(45,110,48,0.12);
  background: #fff;
}
.rp-input-eye {
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
.rp-btn {
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
  margin-top: 6px;
  margin-bottom: 18px;
}
.rp-btn:hover:not(:disabled) { background: #1f4522; transform: translateY(-1px); }
.rp-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.rp-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.rp-divider-line { flex: 1; height: 1px; background: #b9ddb9; }
.rp-divider-text { font-size: 13px; color: #5a8a5e; white-space: nowrap; }
.rp-social-btn {
  width: 100%;
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
  color: #1f4522;
  transition: background 0.18s, border-color 0.18s, transform 0.15s;
  margin-bottom: 20px;
}
.rp-social-btn:hover:not(:disabled) { background: #dceedd; border-color: #2d6e30; transform: translateY(-1px); }
.rp-social-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.rp-google-g { width: 18px; height: 18px; }
.rp-footer { text-align: center; font-size: 13.5px; color: #5a8a5e; }
.rp-footer a {
  color: #1f4522;
  font-weight: 700;
  font-size: 13.5px;
  text-decoration: underline;
  transition: color 0.18s;
}
.rp-footer a:hover { color: #2d6e30; }

@media (max-width: 600px) {
  .rp-left { display: none; }
  .rp-right { padding: 32px 24px; border-radius: 24px; }
  .rp-card { border-radius: 24px; }
}
`

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Mật khẩu tối thiểu 6 ký tự')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
      router.push('/auth/login')
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: REGISTER_CSS }} />

      <div className="rp-root">
        <div className="rp-card">

          {/* LEFT panel */}
          <div className="rp-left">
            <img
              src="/Login.jpg"
              alt="Sân Vườn Tiểu Cảnh NVM"
              className="rp-left-img"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div className="rp-left-overlay" />
            <div className="rp-left-info">
              <div className="rp-left-icon">
                <Leaf style={{ width: 22, height: 22, color: '#fff' }} />
              </div>
              <p className="rp-left-title">SÂN VƯỜN TIỂU CẢNH NVM</p>
              <p className="rp-left-sub">Tạo tài khoản để lưu đơn hàng, nhận ưu đãi và tư vấn cá nhân hoá.</p>
              <div className="rp-left-tags">
                <span className="rp-left-tag">🌿 Bonsai</span>
                <span className="rp-left-tag">💧 Thác nước</span>
                <span className="rp-left-tag">🪨 Hòn non bộ</span>
              </div>
            </div>
          </div>

          {/* RIGHT panel */}
          <div className="rp-right">
            <h1 className="rp-heading">Tạo tài khoản!</h1>
            <p className="rp-subheading">Tham gia cùng chúng tôi ngay hôm nay 🌱</p>

            <div className="rp-input-group">
              <User className="rp-input-icon" />
              <input
                type="text"
                placeholder="Họ và tên"
                value={name}
                onChange={e => setName(e.target.value)}
                className="rp-input"
                required
              />
            </div>

            <div className="rp-input-group">
              <Mail className="rp-input-icon" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="rp-input"
                required
              />
            </div>

            <div className="rp-input-group">
              <Lock className="rp-input-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="rp-input"
                required
              />
              <button type="button" className="rp-input-eye" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>

            <button onClick={handleRegister} disabled={loading} className="rp-btn">
              {loading ? <Loader2 style={{ width: 17, height: 17 }} className="animate-spin" /> : <UserPlus style={{ width: 17, height: 17 }} />}
              Tạo tài khoản
            </button>

            <div className="rp-divider">
              <div className="rp-divider-line" />
              <span className="rp-divider-text">hoặc đăng ký với</span>
              <div className="rp-divider-line" />
            </div>

            <button onClick={handleGoogleLogin} disabled={googleLoading} className="rp-social-btn">
              {googleLoading ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : (
                <svg className="rp-google-g" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Đăng ký với Google
            </button>

            <div className="rp-footer">
              Đã có tài khoản?{' '}
              <Link href="/auth/login">Đăng nhập</Link>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}