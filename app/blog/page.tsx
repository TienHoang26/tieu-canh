import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Tag, ArrowRight, Search } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Blog & Kiến thức | Tiểu Cảnh Việt',
  description: 'Hướng dẫn chăm sóc cây cảnh, bí quyết thiết kế tiểu cảnh, kiến thức bonsai và terrarium.',
}

export default async function BlogPage({ searchParams }: { searchParams: { tag?: string; search?: string } }) {
  const supabase = createClient()

  let query = supabase
    .from('blog_posts')
    .select('id,title,slug,excerpt,cover_image,tags,created_at,views')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (searchParams.tag) query = query.contains('tags', [searchParams.tag])

  const { data: posts } = await query

 const allTags = Array.from(new Set(posts?.flatMap(p => p.tags ?? []) ?? []))
  const featured = posts?.[0]
  const rest = posts?.slice(1)

  return (
    <div className="min-h-screen bg-stone-50 pt-20 lg:pt-24">
      {/* Header */}
      <section className="bg-white py-16 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-moss-600 font-semibold text-sm uppercase tracking-widest mb-3">Kiến thức</p>
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-stone-800 mb-4">Blog &amp; Hướng dẫn</h1>
            <p className="text-stone-500 text-lg max-w-xl mx-auto">
              Tổng hợp kiến thức về tiểu cảnh, terrarium, bonsai và nghệ thuật trang trí thiên nhiên.
            </p>
          </div>

          {/* Tags filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/blog"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!searchParams.tag ? 'bg-moss-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              Tất cả
            </Link>
            {allTags.map(tag => (
              <Link key={tag} href={`/blog?tag=${tag}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${searchParams.tag === tag ? 'bg-moss-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts && posts.length > 0 ? (
          <>
            {/* Featured post */}
            {featured && !searchParams.tag && (
              <Link href={`/blog/${featured.slug}`} className="group block mb-12">
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-xl transition-all duration-300 grid md:grid-cols-2">
                  <div className="overflow-hidden h-64 md:h-auto">
                    <img src={featured.cover_image ?? 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800'}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-8 lg:p-10 flex flex-col justify-center">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-moss-600 bg-moss-50 px-3 py-1.5 rounded-full mb-4 w-fit">
                      ✨ Bài viết nổi bật
                    </span>
                    <h2 className="font-display text-2xl lg:text-3xl font-bold text-stone-800 mb-3 group-hover:text-moss-700 transition-colors">
                      {featured.title}
                    </h2>
                    {featured.excerpt && <p className="text-stone-500 leading-relaxed mb-4 line-clamp-3">{featured.excerpt}</p>}
                    <div className="flex items-center gap-4 text-xs text-stone-400 mb-4">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(featured.created_at)}</span>
                      {featured.tags?.[0] && <span className="flex items-center gap-1 text-moss-600"><Tag className="w-3 h-3" />{featured.tags[0]}</span>}
                    </div>
                    <span className="inline-flex items-center gap-2 text-moss-600 font-semibold group-hover:gap-3 transition-all">
                      Đọc bài viết <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(searchParams.tag ? posts : rest ?? []).map(post => (
                <Link key={post.id} href={`/blog/${post.slug}`}
                  className="group bg-white border border-stone-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="overflow-hidden h-48">
                    <img src={post.cover_image ?? 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs text-stone-400 mb-3">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(post.created_at)}</span>
                      {post.tags?.[0] && <span className="flex items-center gap-1 text-moss-600"><Tag className="w-3 h-3" />{post.tags[0]}</span>}
                    </div>
                    <h3 className="font-bold text-stone-800 mb-2 line-clamp-2 group-hover:text-moss-700 transition-colors leading-snug">
                      {post.title}
                    </h3>
                    {post.excerpt && <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed mb-3">{post.excerpt}</p>}
                    <span className="inline-flex items-center gap-1 text-moss-600 text-sm font-semibold">
                      Đọc tiếp <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="font-display text-xl font-bold text-stone-700 mb-2">Chưa có bài viết</h3>
            <p className="text-stone-500">Nội dung đang được chuẩn bị, quay lại sớm nhé!</p>
          </div>
        )}
      </div>
    </div>
  )
}
