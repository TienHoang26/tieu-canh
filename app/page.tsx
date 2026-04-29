import { createClient } from '@/lib/supabase/server'
import HeroSection from '@/components/layout/HeroSection'
import FeaturedProducts from '@/components/layout/FeaturedProducts'
import CategoriesSection from '@/components/layout/CategoriesSection'
import WhyUs from '@/components/layout/WhyUs'
import TestimonialsSection from '@/components/layout/TestimonialsSection'
import BlogPreview from '@/components/layout/BlogPreview'
import NewsletterSection from '@/components/layout/NewsletterSection'
import StatsBanner from '@/components/layout/StatsBanner'

export default async function HomePage() {
  const supabase = createClient()

  const [
    { data: products },
    { data: categories },
    { data: testimonials },
    { data: posts },
  ] = await Promise.all([
    supabase.from('products').select('*, category:categories(name, slug)').eq('featured', true).eq('active', true).limit(6),
    supabase.from('categories').select('*').limit(8),
    supabase.from('testimonials').select('*').eq('active', true).limit(6),
    supabase.from('blog_posts').select('id,title,slug,excerpt,cover_image,tags,created_at').eq('published', true).order('created_at', { ascending: false }).limit(3),
  ])

  return (
    <>
      <HeroSection />
      <StatsBanner />
      <CategoriesSection categories={categories ?? []} />
      <FeaturedProducts products={products ?? []} />
      <WhyUs />
      <TestimonialsSection testimonials={testimonials ?? []} />
      <BlogPreview posts={posts ?? []} />
      <NewsletterSection />
    </>
  )
}
