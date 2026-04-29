'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, ShoppingBag, Settings, Camera, Loader2, CheckCircle, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Profile } from '@/types'

export default function ProfileClient({ profile: initial, orderCount }: { profile: Profile | null; orderCount: number }) {
  const [profile, setProfile] = useState(initial)
  const [tab, setTab] = useState<'info' | 'settings'>('info')
  const [form, setForm] = useState({
    full_name: initial?.full_name ?? '',
    phone: initial?.phone ?? '',
    address: initial?.address ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .update(form)
      .eq('id', profile!.id)
      .select()
      .single()
    if (error) { toast.error(error.message) }
    else {
      setProfile(data)
      setSaved(true)
      toast.success('Đã cập nhật hồ sơ!')
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-stone-50 pt-20 lg:pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Avatar card */}
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-stone-100">
              <div className="relative inline-block mb-4">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-24 h-24 rounded-full object-cover ring-4 ring-moss-100" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-moss-100 flex items-center justify-center ring-4 ring-moss-50">
                    <User className="w-10 h-10 text-moss-500" />
                  </div>
                )}
              </div>
              <h2 className="font-bold text-stone-800 text-lg">{profile.full_name ?? 'Người dùng'}</h2>
              <p className="text-stone-400 text-sm">{profile.email}</p>
              {profile.role === 'admin' && (
                <span className="inline-block mt-2 bg-moss-100 text-moss-700 text-xs font-bold px-3 py-1 rounded-full">
                  ⚡ Admin
                </span>
              )}
              <p className="text-xs text-stone-400 mt-3">Thành viên từ {formatDate(profile.created_at)}</p>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="font-display text-2xl font-bold text-moss-600">{orderCount}</p>
                  <p className="text-xs text-stone-500">Đơn hàng</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-stone-100 space-y-1">
              <button onClick={() => setTab('info')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === 'info' ? 'bg-moss-50 text-moss-700' : 'text-stone-600 hover:bg-stone-50'}`}>
                <User className="w-4 h-4" /> Thông tin cá nhân
              </button>
              <Link href="/orders"
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
                <ShoppingBag className="w-4 h-4" /> Đơn hàng của tôi
              </Link>
              {profile.role === 'admin' && (
                <Link href="/admin"
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-moss-600 hover:bg-moss-50 transition-colors">
                  <Settings className="w-4 h-4" /> Quản trị Admin
                </Link>
              )}
              <button onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" /> Đăng xuất
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-7 shadow-sm border border-stone-100">
              <h2 className="font-bold text-stone-800 text-xl mb-6">Thông tin cá nhân</h2>
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-stone-600 mb-1.5">Email</label>
                    <input className="input bg-stone-50 text-stone-400 cursor-not-allowed" value={profile.email} disabled />
                    <p className="text-xs text-stone-400 mt-1">Email không thể thay đổi</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Họ và tên</label>
                    <input className="input" value={form.full_name}
                      onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                      placeholder="Nguyễn Văn A" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Số điện thoại</label>
                    <input className="input" type="tel" value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="0901 234 567" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Địa chỉ giao hàng mặc định</label>
                    <textarea className="input resize-none" rows={3} value={form.address}
                      onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" />
                  </div>
                </div>

                <button type="submit" disabled={saving}
                  className="btn-primary flex items-center gap-2 w-full justify-center py-3">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" />
                    : saved ? <CheckCircle className="w-4 h-4" />
                    : null}
                  {saved ? 'Đã lưu!' : 'Lưu thay đổi'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
