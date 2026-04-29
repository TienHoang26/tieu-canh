import { createClient } from '@/lib/supabase/server'
import AdminOrdersClient from './AdminOrdersClient'

export default async function AdminOrdersPage() {
  const supabase = createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*, profile:profiles(full_name, email), items:order_items(*, product:products(name, images))')
    .order('created_at', { ascending: false })
  return <AdminOrdersClient orders={orders ?? []} />
}
