import { Star } from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  avatar_url: string | null
  content: string
  rating: number
  product: string | null
}

export default function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials.length) return null
  return (
    <section className="py-20 bg-moss-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-moss-600 font-semibold text-sm uppercase tracking-widest mb-3">Đánh giá</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-800">Khách hàng nói gì về chúng tôi?</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-stone-200'}`} />
                ))}
              </div>
              <p className="text-stone-600 leading-relaxed text-sm flex-1">"{t.content}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
                {t.avatar_url ? (
                  <img src={t.avatar_url} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-moss-100 flex items-center justify-center text-moss-600 font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-stone-800 text-sm">{t.name}</p>
                  {t.product && <p className="text-xs text-moss-600">{t.product}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
