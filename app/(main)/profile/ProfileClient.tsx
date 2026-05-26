'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  User, Mail, ShoppingBag, Settings, Loader2, CheckCircle,
  LogOut, Heart, Clock, Tag, Star, ClipboardList, Package, Truck
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Profile } from '@/types'

export default function ProfileClient({
  profile: initial,
  orderCount,
}: {
  profile: Profile | null
  orderCount: number
}) {
  const [profile, setProfile] = useState(initial)
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
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">

          {/* Header */}
          <div className="relative px-6 pt-8 pb-6 text-center border-b border-stone-100">
            <Link
              href="/profile/change-password"
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-moss-50 text-stone-400 hover:text-moss-600 transition-colors"
              title="Đổi mật khẩu"
            >
              <Settings className="w-5 h-5" />
            </Link>

            <h1 className="font-bold text-stone-800 text-lg tracking-wide uppercase mb-1">
              Hồ sơ của tôi
            </h1>
            <p className="text-sm text-stone-400">Xem và chỉnh sửa thông tin cá nhân</p>
            <div className="flex justify-center gap-1 mt-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-stone-300" />
              ))}
            </div>

            {/* Avatar */}
            <div className="mt-5 flex justify-center">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-moss-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-moss-100 flex items-center justify-center ring-4 ring-moss-50">
                  <User className="w-10 h-10 text-moss-500" />
                </div>
              )}
            </div>
          </div>

          {/* Info fields */}
          <div className="px-6 py-5 space-y-3 border-b border-stone-100">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-200 bg-stone-50">
              <User className="w-4 h-4 text-moss-500 flex-shrink-0" />
              <span className="text-sm text-stone-700">{profile.full_name || 'Chưa có tên'}</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-200 bg-stone-50">
              <Mail className="w-4 h-4 text-moss-500 flex-shrink-0" />
              <span className="text-sm text-stone-700">{profile.email}</span>
            </div>
          </div>

          {/* Đơn mua */}
          <div className="px-6 py-5 border-b border-stone-100">
            <p className="text-sm font-semibold text-stone-700 mb-3">Đơn mua</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: <ClipboardList className="w-5 h-5" />, label: 'Chờ xác nhận', count: 0 },
                { icon: <Package className="w-5 h-5" />, label: 'Chờ lấy hàng', count: 0 },
                { icon: <Truck className="w-5 h-5" />, label: 'Đang giao', count: orderCount },
                { icon: <Star className="w-5 h-5" />, label: 'Đánh giá', count: 0 },
              ].map((item) => (
                <Link
                  key={item.label}
                  href="/orders"
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-stone-100 hover:border-moss-200 hover:bg-moss-50 transition-colors text-center"
                >
                  <span className="text-moss-500">{item.icon}</span>
                  <span className="text-xs text-stone-600 leading-tight">
                    {item.label} ({item.count})
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Tiện ích */}
          <div className="px-6 py-5 border-b border-stone-100">
            <p className="text-sm font-semibold text-stone-700 mb-3">Tiện ích của tôi</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: <Heart className="w-5 h-5" />, label: 'Yêu thích', sub: 'Sản phẩm bạn đã thích', href: '/wishlist' },
                { icon: <Clock className="w-5 h-5" />, label: 'Đã xem', sub: 'Xem lại nhanh', href: '/recently-viewed' },
                { icon: <ShoppingBag className="w-5 h-5" />, label: 'Đơn hàng', sub: 'Quản lý đơn', href: '/orders' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-stone-100 hover:border-moss-200 hover:bg-moss-50 transition-colors text-center"
                >
                  <span className="text-moss-500">{item.icon}</span>
                  <span className="text-xs font-medium text-stone-700">{item.label}</span>
                  <span className="text-[10px] text-stone-400 leading-tight">{item.sub}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Form chỉnh sửa */}
          <form onSubmit={handleSave} className="px-6 py-5 space-y-4 border-b border-stone-100">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5">Họ và tên</label>
                <input
                  className="input"
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5">Số điện thoại</label>
                <input
                  className="input"
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="0901 234 567"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-500 mb-1.5">Địa chỉ giao hàng</label>
                <textarea
                  className="input resize-none"
                  rows={2}
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2 w-full justify-center py-3 rounded-xl"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : null}
              {saved ? 'Đã lưu!' : 'Lưu thay đổi'}
            </button>
          </form>

          {/* Footer actions */}
          <div className="px-6 py-4 flex flex-col gap-2">
            {profile.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-moss-600 hover:bg-moss-50 transition-colors"
              >
                <Settings className="w-4 h-4" /> Quản trị Admin
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}