import { createClient } from '@/lib/supabase/server'
import AdminBlogClient from './AdminBlogClient'

export default async function AdminBlogPage() {
  const supabase = createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
  return <AdminBlogClient posts={posts ?? []} />
}
