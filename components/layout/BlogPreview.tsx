import Link from 'next/link'
import { ArrowRight, Calendar, Tag } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  tags: string[]
  created_at: string
}

export default function BlogPreview({ posts }: { posts: Post[] }) {
  if (!posts.length) return null
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-moss-600 font-semibold text-sm uppercase tracking-widest mb-3">Kiến thức</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-800">Blog &amp; Hướng dẫn</h2>
          </div>
          <Link href="/blog" className="hidden sm:flex items-center gap-2 text-moss-600 font-semibold hover:text-moss-700 transition-colors">
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <Link key={post.id} href={`/blog/${post.slug}`}
              className="group bg-white border border-stone-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className={`overflow-hidden ${i === 0 ? 'h-56' : 'h-44'}`}>
                <img
                  src={post.cover_image ?? 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800'}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs text-stone-400 mb-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(post.created_at)}</span>
                  {post.tags?.[0] && (
                    <span className="flex items-center gap-1 text-moss-600"><Tag className="w-3 h-3" />{post.tags[0]}</span>
                  )}
                </div>
                <h3 className="font-bold text-stone-800 mb-2 line-clamp-2 group-hover:text-moss-700 transition-colors leading-snug">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                )}
                <span className="inline-flex items-center gap-1 text-moss-600 text-sm font-semibold mt-3">
                  Đọc tiếp <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link href="/blog" className="btn-outline inline-flex items-center gap-2">
            Xem tất cả bài viết <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
