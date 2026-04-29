import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('slug', params.slug)
    .single()
  return { title: product?.name ?? 'Sản phẩm', description: product?.description?.slice(0, 150) }
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(name, slug)')
    .eq('slug', params.slug)
    .eq('active', true)
    .single()

  if (!product) notFound()

  const { data: related } = await supabase
    .from('products')
    .select('*, category:categories(name, slug)')
    .eq('category_id', product.category_id)
    .eq('active', true)
    .neq('id', product.id)
    .limit(4)

  return <ProductDetailClient product={product} related={related ?? []} />
}
