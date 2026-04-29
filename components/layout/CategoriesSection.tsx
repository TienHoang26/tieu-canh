import Link from 'next/link'
import type { Category } from '@/types'

const categoryEmojis: Record<string, string> = {
  'zen': '🪨',
  'terrarium': '🫙',
  'bonsai-mini': '🌳',
  'da-cat': '💎',
  'reu-cay-canh': '🌿',
}

export default function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-moss-600 font-semibold text-sm uppercase tracking-widest mb-3">Danh mục</p>
          <h2 className="section-title">Khám phá theo chủ đề</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center p-6 rounded-2xl border-2 border-stone-100 hover:border-moss-300 hover:bg-moss-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="text-4xl mb-3">{categoryEmojis[cat.slug] ?? '🌱'}</span>
              <span className="font-semibold text-stone-700 group-hover:text-moss-700 text-sm text-center transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}

          {/* View all */}
          <Link
            href="/products"
            className="group flex flex-col items-center p-6 rounded-2xl border-2 border-dashed border-moss-200 hover:border-moss-400 hover:bg-moss-50 transition-all duration-300"
          >
            <span className="text-4xl mb-3">✨</span>
            <span className="font-semibold text-moss-600 text-sm text-center">Tất cả</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
