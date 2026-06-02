import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/profile')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const statuses = ['pending', 'confirmed', 'shipping', 'delivered'] as const
  const counts = await Promise.all(
    statuses.map(s =>
      supabase.from('orders').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id).eq('status', s)
        .then(({ count }) => count ?? 0)
    )
  )
  const [pendingCount, confirmedCount, shippingCount, deliveredCount] = counts

  return (
    <ProfileClient
      profile={profile}
      pendingCount={pendingCount}
      confirmedCount={confirmedCount}
      shippingCount={shippingCount}
      deliveredCount={deliveredCount}
    />
  )
}