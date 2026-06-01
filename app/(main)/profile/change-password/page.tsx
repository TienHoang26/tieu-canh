'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Eye, EyeOff, Loader2, CheckCircle, ArrowLeft, ShieldCheck } from 'lucide-react'
import { changePassword } from './action'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const strength = newPw.length === 0 ? 0 : newPw.length < 6 ? 1 : newPw.length < 10 ? 2 : 3
  const strengthLabel = ['', 'Yếu', 'Trung bình', 'Mạnh']
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-moss-500']
  const strengthText = ['', 'text-red-500', 'text-yellow-600', 'text-moss-600']

  const doChange = async () => {
    if (!currentPw) { toast.error('Vui lòng nhập mật khẩu hiện tại!'); return }
    if (!newPw || newPw.length < 6) { toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!'); return }
    if (newPw !== confirm) { toast.error('Mật khẩu xác nhận không khớp!'); return }
    if (currentPw === newPw) { toast.error('Mật khẩu mới phải khác mật khẩu hiện tại!'); return }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      toast.error('Không tìm thấy thông tin người dùng!')
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPw })
    if (signInError) {
      toast.error('Mật khẩu hiện tại không đúng!')
      setLoading(false)
      return
    }

    const result = await changePassword(newPw)
    if (result.error) {
      toast.error('Lỗi: ' + result.error)
      setLoading(false)
    } else {
      toast.success('Đổi mật khẩu thành công!')
      setLoading(false)
      setCurrentPw(''); setNewPw(''); setConfirm('')
      router.back()
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-20 lg:pt-24">
      <div className="max-w-md mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">

          {/* Header */}
          <div className="relative px-6 pt-8 pb-6 text-center border-b border-stone-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="absolute top-5 left-5 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-moss-50 text-stone-400 hover:text-moss-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-moss-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-moss-600" />
            </div>
            <h1 className="font-bold text-stone-800 text-lg tracking-wide uppercase mb-1">Đổi mật khẩu</h1>
            <p className="text-sm text-stone-400">Cập nhật mật khẩu để bảo mật tài khoản</p>
            <div className="flex justify-center gap-1 mt-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-stone-300" />
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-6 space-y-5">

            {/* Mật khẩu hiện tại */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-moss-400 focus:ring-2 focus:ring-moss-100 bg-stone-50 focus:bg-white transition-all pr-11"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <button type="button" onClick={() => setShowCurrent(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-moss-400 focus:ring-2 focus:ring-moss-100 bg-stone-50 focus:bg-white transition-all pr-11"
                  type={showNew ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {newPw.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor[strength] : 'bg-stone-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strengthText[strength]}`}>
                    Độ mạnh: {strengthLabel[strength]}
                  </p>
                </div>
              )}
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-moss-400 focus:ring-2 focus:ring-moss-100 bg-stone-50 focus:bg-white transition-all pr-11"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirm.length > 0 && (
                newPw !== confirm
                  ? <p className="text-xs text-red-500 mt-1.5">Mật khẩu không khớp</p>
                  : <p className="text-xs text-moss-600 mt-1.5 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Mật khẩu khớp
                    </p>
              )}
            </div>

            {/* Tips */}
            <div className="bg-moss-50 rounded-2xl p-4 border border-moss-100">
              <p className="text-xs font-semibold text-moss-700 mb-2 uppercase tracking-wider">Lưu ý bảo mật</p>
              <ul className="space-y-1">
                {['Mật khẩu phải có ít nhất 6 ký tự', 'Nên kết hợp chữ hoa, chữ thường và số', 'Không dùng thông tin cá nhân dễ đoán'].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-moss-600">
                    <span className="mt-0.5 w-1 h-1 rounded-full bg-moss-400 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Button */}
            <button
              type="button"
              onClick={doChange}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all bg-moss-600 hover:bg-moss-700 text-white disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang cập nhật...</>
                : <><ShieldCheck className="w-4 h-4" /> Cập nhật mật khẩu</>
              }
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}