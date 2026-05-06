import { createClient } from '@/lib/supabase/server'
import AdminCategoriesClient from './AdminCategoriesClient'

export default async function AdminCategoriesPage() {
  const supabase = createClient()
  const [{ data: categories }, { data: productCounts }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('products').select('category_id').eq('active', true),
  ])

  const countMap: Record<string, number> = {}
  productCounts?.forEach(p => {
    if (p.category_id) countMap[p.category_id] = (countMap[p.category_id] ?? 0) + 1
  })

  return <AdminCategoriesClient categories={categories ?? []} countMap={countMap} />
}
