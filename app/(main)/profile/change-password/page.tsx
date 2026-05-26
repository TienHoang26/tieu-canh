'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Eye, EyeOff, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { changePassword } from './action'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [currentPw, setCurrentPw] = useState<string>('')
  const [newPw, setNewPw] = useState<string>('')
  const [confirm, setConfirm] = useState<string>('')
  const [showCurrent, setShowCurrent] = useState<boolean>(false)
  const [showNew, setShowNew] = useState<boolean>(false)
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const doChange = async () => {
    if (!currentPw) {
      toast.error('Vui lòng nhập mật khẩu hiện tại!')
      return
    }
    if (!newPw || newPw.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!')
      return
    }
    if (newPw !== confirm) {
      toast.error('Mật khẩu xác nhận không khớp!')
      return
    }
    if (currentPw === newPw) {
      toast.error('Mật khẩu mới phải khác mật khẩu hiện tại!')
      return
    }

    setLoading(true)

    // Xác minh mật khẩu cũ bằng cách đăng nhập lại
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      toast.error('Không tìm thấy thông tin người dùng!')
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPw,
    })

    if (signInError) {
      toast.error('Mật khẩu hiện tại không đúng!')
      setLoading(false)
      return
    }

    // Đổi mật khẩu mới
    const result = await changePassword(newPw)

    if (result.error) {
      toast.error('Lỗi: ' + result.error)
      setLoading(false)
    } else {
      toast.success('Đổi mật khẩu thành công!')
      setLoading(false)
      setCurrentPw('')
      setNewPw('')
      setConfirm('')
      router.back()
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-20 lg:pt-24">
      <div className="max-w-md mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">

          <div className="px-6 pt-8 pb-6 text-center border-b border-stone-100 relative">
            <button
              type="button"
              onClick={() => router.back()}
              className="absolute top-5 left-5 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-moss-50 text-stone-400 hover:text-moss-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 bg-moss-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-7 h-7 text-moss-600" />
            </div>
            <h1 className="font-bold text-stone-800 text-lg tracking-wide uppercase mb-1">Đổi mật khẩu</h1>
            <p className="text-sm text-stone-400">Cập nhật mật khẩu để bảo mật tài khoản</p>
          </div>

          <div className="px-6 py-6 space-y-5">

            {/* Mật khẩu hiện tại */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Mật khẩu hiện tại</label>
              <div className="relative">
                <input
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl outline-none focus:border-moss-500 pr-11"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Mật khẩu mới</label>
              <div className="relative">
                <input
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl outline-none focus:border-moss-500 pr-11"
                  type={showNew ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <input
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl outline-none focus:border-moss-500 pr-11"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirm.length > 0 && (
                newPw !== confirm
                  ? <p className="text-xs text-red-500 mt-1">Mật khẩu không khớp</p>
                  : <p className="text-xs text-moss-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Mật khẩu khớp
                    </p>
              )}
            </div>

            <div className="bg-moss-50 rounded-xl p-4 space-y-1">
              <p className="text-sm font-medium text-moss-700">Lưu ý:</p>
              <ul className="list-disc list-inside text-xs text-moss-600 space-y-0.5">
                <li>Mật khẩu phải có ít nhất 6 ký tự</li>
                <li>Nên kết hợp chữ hoa, chữ thường và số</li>
                <li>Không dùng thông tin cá nhân dễ đoán</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => doChange()}
              disabled={loading}
              className="bg-stone-900 hover:bg-stone-800 text-white disabled:bg-stone-300 flex items-center gap-2 w-full justify-center py-3 rounded-xl transition-colors"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang cập nhật...</>
                : <><KeyRound className="w-4 h-4" /> Cập nhật mật khẩu</>
              }
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}