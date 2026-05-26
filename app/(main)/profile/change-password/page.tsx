'use client'

import {  useState, useEffect  } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Eye, EyeOff, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ChangePasswordPage() {
  console.log('PAGE LOADED V2')
  const router = useRouter()
  const [newPw, setNewPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    setSaving(false)
    setDone(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (newPw.length < 6) { toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!'); return }
  if (newPw !== confirm) { toast.error('Mật khẩu xác nhận không khớp!'); return }

  setSaving(true)
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.updateUser({ password: newPw })
    console.log('UPDATE data:', data)
    console.log('UPDATE error:', error)
    console.log('ERROR status:', error?.status)
    console.log('ERROR message:', error?.message)

if (error) {
      if (error.status === 422 || error.message.includes('session')) {
        toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!')
        setTimeout(() => {
          window.location.href = '/auth/login'
        }, 1500)
      } else {
        toast.error(error.message)
      }
      setSaving(false)
    } else {
      toast.success('Đổi mật khẩu thành công!')
      setSaving(false)   // ← thêm dòng này
      setDone(true)
      setTimeout(() => {
        window.location.href = '/auth/login'
      }, 1000)
    }
  } catch (err) {
    console.error('EXCEPTION:', err)
    toast.error('Có lỗi xảy ra, vui lòng thử lại!')
    setSaving(false)
  }
}
  return (
    <div className="min-h-screen bg-stone-50 pt-20 lg:pt-24">
      <div className="max-w-md mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">

          <div className="px-6 pt-8 pb-6 text-center border-b border-stone-100 relative">
            <button onClick={() => router.back()}
              className="absolute top-5 left-5 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-moss-50 text-stone-400 hover:text-moss-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 bg-moss-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-7 h-7 text-moss-600" />
            </div>
            <h1 className="font-bold text-stone-800 text-lg tracking-wide uppercase mb-1">Đổi mật khẩu</h1>
            <p className="text-sm text-stone-400">Cập nhật mật khẩu để bảo mật tài khoản</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Mật khẩu mới</label>
              <div className="relative">
                <input className="input pr-11" type={showNew ? 'text' : 'password'}
                  value={newPw} onChange={e => setNewPw(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự" required />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <input className="input pr-11" type={showConfirm ? 'text' : 'password'}
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới" required />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
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

            <button type="submit" disabled={saving || done}
              className="btn-primary flex items-center gap-2 w-full justify-center py-3 rounded-xl">
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang cập nhật...</>
                : done
                ? <><CheckCircle className="w-4 h-4" /> Thành công!</>
                : <><KeyRound className="w-4 h-4" /> Cập nhật mật khẩu</>
              }
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}