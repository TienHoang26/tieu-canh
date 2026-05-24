import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/profile')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { count: orderCount } = await supabase
    .from('orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id)

  return <ProfileClient profile={profile} orderCount={orderCount ?? 0} />
}
