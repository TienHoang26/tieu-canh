import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Tag, ArrowLeft, ArrowRight, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase.from('blog_posts').select('title,excerpt').eq('slug', params.slug).single()
  return { title: data?.title ?? 'Bài viết', description: data?.excerpt ?? '' }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  // Increment views
  await supabase.from('blog_posts').update({ views: (post.views ?? 0) + 1 }).eq('id', post.id)

  // Related posts
  const { data: related } = await supabase
    .from('blog_posts')
    .select('id,title,slug,cover_image,created_at,tags')
    .eq('published', true)
    .neq('id', post.id)
    .limit(3)

  // Parse markdown-like content (simple)
  const renderContent = (content: string) => {
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('## ')) return `<h2 class="font-display text-2xl font-bold text-stone-800 mt-8 mb-4">${line.slice(3)}</h2>`
        if (line.startsWith('### ')) return `<h3 class="font-bold text-xl text-stone-800 mt-6 mb-3">${line.slice(4)}</h3>`
        if (line.startsWith('**') && line.endsWith('**')) return `<p class="font-bold text-stone-800 my-2">${line.slice(2, -2)}</p>`
        if (line.startsWith('- ')) return `<li class="ml-5 list-disc text-stone-600 my-1">${line.slice(2)}</li>`
        if (line.trim() === '') return '<br/>'
        return `<p class="text-stone-600 leading-relaxed my-2">${line}</p>`
      })
      .join('')
  }

  return (
    <div className="min-h-screen bg-white pt-20 lg:pt-24">
      {/* Hero */}
      <div className="relative h-72 lg:h-96 overflow-hidden">
        <img src={post.cover_image ?? 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400'}
          alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10 max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {post.tags?.map((tag: string) => (
              <Link key={tag} href={`/blog?tag=${tag}`}
                className="flex items-center gap-1 text-xs font-semibold bg-white/20 backdrop-blur text-white px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors">
                <Tag className="w-3 h-3" /> {tag}
              </Link>
            ))}
          </div>
          <h1 className="font-display text-2xl lg:text-4xl font-bold text-white leading-tight">{post.title}</h1>
          <div className="flex items-center gap-4 mt-3 text-white/70 text-sm">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(post.created_at)}</span>
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{(post.views ?? 0) + 1} lượt đọc</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Content */}
          <article className="lg:col-span-3">
            <Link href="/blog" className="inline-flex items-center gap-2 text-stone-500 hover:text-moss-600 transition-colors mb-8 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Quay lại Blog
            </Link>

            {post.excerpt && (
              <p className="text-xl text-stone-500 leading-relaxed border-l-4 border-moss-400 pl-5 mb-8 italic">
                {post.excerpt}
              </p>
            )}

            <div
              className="prose-custom"
              dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
            />

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-stone-100">
                <span className="text-sm text-stone-500 font-medium">Tags:</span>
                {post.tags.map((tag: string) => (
                  <Link key={tag} href={`/blog?tag=${tag}`}
                    className="text-sm bg-moss-50 text-moss-700 px-3 py-1 rounded-full hover:bg-moss-100 transition-colors">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="mt-10 p-6 bg-moss-50 rounded-2xl border border-moss-100">
              <h3 className="font-bold text-stone-800 mb-2">🌿 Khám phá sản phẩm liên quan</h3>
              <p className="text-stone-600 text-sm mb-4">Tìm kiếm nguyên liệu và sản phẩm tiểu cảnh chất lượng tại cửa hàng của chúng tôi.</p>
              <Link href="/products" className="btn-primary inline-flex items-center gap-2 text-sm py-2.5">
                Xem sản phẩm <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Related posts */}
            <div className="bg-stone-50 rounded-2xl p-5">
              <h3 className="font-bold text-stone-800 mb-4">Bài viết liên quan</h3>
              <div className="space-y-4">
                {related?.map(r => (
                  <Link key={r.id} href={`/blog/${r.slug}`} className="group flex gap-3 items-start">
                    <img src={r.cover_image ?? 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200'}
                      alt={r.title} className="w-14 h-14 object-cover rounded-xl shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-stone-700 group-hover:text-moss-700 transition-colors line-clamp-2 leading-snug">{r.title}</p>
                      <p className="text-xs text-stone-400 mt-1">{formatDate(r.created_at)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular tags */}
            <div className="bg-stone-50 rounded-2xl p-5">
              <h3 className="font-bold text-stone-800 mb-4">Chủ đề phổ biến</h3>
              <div className="flex flex-wrap gap-2">
                {['zen', 'terrarium', 'bonsai', 'hướng dẫn', 'phong thủy', 'cây cảnh'].map(tag => (
                  <Link key={tag} href={`/blog?tag=${tag}`}
                    className="text-xs bg-white border border-stone-200 text-stone-600 px-3 py-1.5 rounded-full hover:border-moss-300 hover:text-moss-700 transition-colors capitalize">
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
