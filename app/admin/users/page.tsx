import { createClient } from '@/lib/supabase/server'
import AdminUsersClient from './AdminUsersClient'

export default async function AdminUsersPage() {
  const supabase = createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return <AdminUsersClient profiles={profiles ?? []} />
}
