import { createClient } from '@/lib/supabase/server'
import AdminProductsClient from './AdminProductsClient'

export default async function AdminProductsPage() {
  const supabase = createClient()
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*, category:categories(name, slug)').order('created_at', { ascending: false }),
    supabase.from('categories').select('*'),
  ])
  return <AdminProductsClient products={products ?? []} categories={categories ?? []} />
}
