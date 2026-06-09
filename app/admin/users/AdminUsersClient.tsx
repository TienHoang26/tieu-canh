'use client'

import { useState } from 'react'
import { Search, Shield, User, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Profile } from '@/types'

export default function AdminUsersClient({ profiles: initial }: { profiles: Profile[] }) {
  const [profiles, setProfiles] = useState(initial.filter(p => p.role === 'customer'))
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const filtered = profiles.filter(p =>
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.full_name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const toggleLock = async (p: Profile) => {
    if (p.role === 'admin') return
    const newLocked = !p.is_locked
    if (newLocked && !confirm(`Khóa tài khoản ${p.email}?`)) return
    setUpdating(p.id)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ is_locked: newLocked })
      .eq('id', p.id)
    if (error) { toast.error(error.message) }
    else {
      setProfiles(ps => ps.map(x => x.id === p.id ? { ...x, is_locked: newLocked } : x))
      toast.success(newLocked ? 'Đã khóa tài khoản!' : 'Đã mở khóa tài khoản!')
    }
    setUpdating(null)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-stone-800">Quản lý người dùng</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
  <div className="card p-4 text-center">
    <p className="text-2xl font-bold text-stone-800">{profiles.filter(p => p.role === 'customer').length}</p>
    <p className="text-sm text-stone-500 mt-0.5">Tổng khách hàng</p>
  </div>
  <div className="card p-4 text-center">
    <p className="text-2xl font-bold text-green-700">{profiles.filter(p => p.role === 'customer' && !p.is_locked).length}</p>
    <p className="text-sm text-stone-500 mt-0.5">Đang hoạt động</p>
  </div>
  <div className="card p-4 text-center">
    <p className="text-2xl font-bold text-red-600">{profiles.filter(p => p.role === 'customer' && p.is_locked).length}</p>
    <p className="text-sm text-stone-500 mt-0.5">Đã khóa</p>
  </div>
</div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc email..." className="input pl-10 py-2.5 text-sm" />
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
               <tr className="bg-moss-600/10 border-b border-stone-200">
                <th className="text-center px-4 py-3 text-moss-800 font-bold uppercase text-xs border-r border-moss-200 w-12">STT</th>
                <th className="text-left px-5 py-3 text-moss-800 font-bold uppercase text-xs border-r border-moss-200">Người dùng</th>
                <th className="text-center px-5 py-3 text-moss-800 font-bold uppercase text-xs border-r border-moss-200 hidden sm:table-cell">Ngày đăng ký</th>
                <th className="text-center px-5 py-3 text-moss-800 font-bold uppercase text-xs border-r border-moss-200">Vai trò</th>
                <th className="text-center px-5 py-3 text-moss-800 font-bold uppercase text-xs">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => (
                <tr key={p.id} className="border-b border-stone-200 even:bg-stone-50/60 hover:bg-moss-50/40 transition-colors">
                  <td className="px-4 py-3 text-center text-stone-400 font-medium border-r border-stone-200">{idx + 1}</td>
                  <td className="px-5 py-3 border-r border-stone-200">
                    <div className="flex items-center gap-3">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 bg-stone-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-stone-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-stone-800">{p.full_name ?? 'Chưa cập nhật'}</p>
                        <p className="text-xs text-stone-400">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center text-stone-500 text-xs hidden sm:table-cell border-r border-stone-200">{formatDate(p.created_at)}</td>
                  <td className="px-5 py-3 text-center border-r border-stone-200">
                    <span className={cn(
                      'badge',
                      p.role === 'admin' ? 'bg-moss-100 text-moss-700' : 'bg-stone-100 text-stone-600'
                    )}>
                      {p.role === 'admin' ? <><Shield className="w-3 h-3" /> Admin</> : 'Khách hàng'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {p.role === 'admin' ? null : (
                      <button
                        onClick={() => toggleLock(p)}
                        disabled={updating === p.id}
                        className={cn(
                          'text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors',
                          p.is_locked
                            ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                            : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                        )}
                      >
                        {updating === p.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : p.is_locked ? 'Mở khóa' : 'Khóa tài khoản'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-stone-400">Không tìm thấy người dùng</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}