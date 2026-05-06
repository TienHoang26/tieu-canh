import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Mail, Users } from 'lucide-react'

export default async function AdminSubscribersPage() {
  const supabase = createClient()
  const { data: subscribers, count } = await supabase
    .from('subscribers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-stone-800">Newsletter</h1>
          <p className="text-stone-500 text-sm mt-0.5">{count ?? 0} người đăng ký nhận tin</p>
        </div>
        <div className="flex items-center gap-2 bg-moss-50 text-moss-700 px-4 py-2 rounded-xl font-semibold">
          <Users className="w-4 h-4" /> {count ?? 0} subscribers
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="text-left px-5 py-3 text-stone-500 font-medium">#</th>
                <th className="text-left px-5 py-3 text-stone-500 font-medium">Email</th>
                <th className="text-left px-5 py-3 text-stone-500 font-medium">Ngày đăng ký</th>
                <th className="text-right px-5 py-3 text-stone-500 font-medium">Liên hệ</th>
              </tr>
            </thead>
            <tbody>
              {subscribers?.map((s, i) => (
                <tr key={s.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-3 text-stone-400">{i + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-moss-100 rounded-full flex items-center justify-center text-moss-600 text-xs font-bold shrink-0">
                        {s.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-stone-700">{s.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-stone-400">{formatDate(s.created_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <a href={`mailto:${s.email}`}
                      className="inline-flex items-center gap-1.5 text-xs text-moss-600 hover:text-moss-700 font-medium bg-moss-50 hover:bg-moss-100 px-3 py-1.5 rounded-lg transition-colors">
                      <Mail className="w-3 h-3" /> Email
                    </a>
                  </td>
                </tr>
              ))}
              {(subscribers?.length ?? 0) === 0 && (
                <tr><td colSpan={4} className="text-center py-12 text-stone-400">
                  <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />Chưa có người đăng ký
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
