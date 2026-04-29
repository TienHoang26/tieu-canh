'use client'

import { useState } from 'react'
import { Search, Shield, User, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Profile } from '@/types'

export default function AdminUsersClient({ profiles: initial }: { profiles: Profile[] }) {
  const [profiles, setProfiles] = useState(initial)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const filtered = profiles.filter(p =>
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.full_name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const toggleRole = async (p: Profile) => {
    const newRole = p.role === 'admin' ? 'customer' : 'admin'
    if (newRole === 'admin' && !confirm(`Cấp quyền admin cho ${p.email}?`)) return
    setUpdating(p.id)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', p.id)
    if (error) { toast.error(error.message) }
    else {
      setProfiles(ps => ps.map(x => x.id === p.id ? { ...x, role: newRole } : x))
      toast.success(`Đã ${newRole === 'admin' ? 'cấp quyền admin' : 'thu hồi quyền admin'}!`)
    }
    setUpdating(null)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-stone-800">Người dùng</h1>
        <p className="text-stone-500 text-sm mt-0.5">{profiles.length} tài khoản đăng ký</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-sm">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-stone-800">{profiles.filter(p => p.role === 'customer').length}</p>
          <p className="text-sm text-stone-500 mt-0.5">Khách hàng</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-moss-700">{profiles.filter(p => p.role === 'admin').length}</p>
          <p className="text-sm text-stone-500 mt-0.5">Admin</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc email..." className="input pl-10 py-2.5 text-sm" />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="text-left px-5 py-3 text-stone-500 font-medium">Người dùng</th>
                <th className="text-left px-5 py-3 text-stone-500 font-medium hidden sm:table-cell">Ngày đăng ký</th>
                <th className="text-left px-5 py-3 text-stone-500 font-medium">Vai trò</th>
                <th className="text-right px-5 py-3 text-stone-500 font-medium">Quyền</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-3">
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
                  <td className="px-5 py-3 text-stone-500 text-xs hidden sm:table-cell">{formatDate(p.created_at)}</td>
                  <td className="px-5 py-3">
                    <span className={cn(
                      'badge',
                      p.role === 'admin' ? 'bg-moss-100 text-moss-700' : 'bg-stone-100 text-stone-600'
                    )}>
                      {p.role === 'admin' ? <><Shield className="w-3 h-3" /> Admin</> : 'Khách hàng'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => toggleRole(p)}
                      disabled={updating === p.id}
                      className={cn(
                        'text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
                        p.role === 'admin'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-moss-50 text-moss-700 hover:bg-moss-100'
                      )}
                    >
                      {updating === p.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : p.role === 'admin' ? 'Thu hồi admin' : 'Cấp admin'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="text-center py-12 text-stone-400">Không tìm thấy người dùng</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
