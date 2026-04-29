import { createClient } from '@/lib/supabase/server'
import AdminMessagesClient from './AdminMessagesClient'

export default async function AdminMessagesPage() {
  const supabase = createClient()
  const { data: messages } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
  return <AdminMessagesClient messages={messages ?? []} />
}
