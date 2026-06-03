'use client'

import { useState, useEffect } from 'react'
import { Star, User, ImageIcon, Loader2, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Session } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Review {
  id: string
  rating: number
  content: string | null
  images: string[]
  created_at: string
  reviewer_name: string | null
  user_id: string | null
}

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => !readonly && setHovered(i)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={cn('transition-colors', readonly ? 'cursor-default' : 'cursor-pointer')}
        >
          <Star
            className={cn('w-5 h-5 transition-colors', (hovered || value) >= i ? 'fill-amber-400 text-amber-400' : 'text-stone-300')}
          />
        </button>
      ))}
    </div>
  )
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-6 text-stone-500 text-xs">{label}★</span>
      <div className="flex-1 bg-stone-100 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-stone-400 text-xs text-right">{count}</span>
    </div>
  )
}

export default function ReviewSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userReview, setUserReview] = useState<Review | null>(null)

  // Form
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [reviewerName, setReviewerName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Stats
  const total = reviews.length
  const avg = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0
  const dist = [5, 4, 3, 2, 1].map(s => ({ star: s, count: reviews.filter(r => r.rating === s).length }))

  const PAGE_SIZE = 5

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        setReviewerName(session.user.user_metadata?.full_name ?? '')
      }
    })
    fetchReviews(0)
  }, [productId])

  const fetchReviews = async (p: number) => {
    p === 0 ? setLoading(true) : setLoadingMore(true)
    const supabase = createClient()
    const from = p * PAGE_SIZE
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE)

    const rows = (data ?? []) as Review[]
    if (p === 0) {
      setReviews(rows)
      // check if user already reviewed
      if (userId) setUserReview(rows.find(r => r.user_id === userId) ?? null)
    } else {
      setReviews(prev => [...prev, ...rows])
    }
    setHasMore(rows.length > PAGE_SIZE - 1)
    setPage(p)
    p === 0 ? setLoading(false) : setLoadingMore(false)
  }

  const handleSubmit = async () => {
    if (!reviewerName.trim()) { toast.error('Vui lòng nhập tên của bạn!'); return }
    if (rating === 0) { toast.error('Vui lòng chọn số sao!'); return }

    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      user_id: userId,
      rating,
      content: content.trim() || null,
      reviewer_name: reviewerName.trim(),
      images: [],
    })

    if (error) {
      toast.error('Lỗi gửi đánh giá: ' + error.message)
    } else {
      toast.success('Cảm ơn bạn đã đánh giá!')
      setContent('')
      setRating(5)
      setShowForm(false)
      fetchReviews(0)
    }
    setSubmitting(false)
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

  if (loading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
    </div>
  )

  return (
    <div className="mt-16">
      <h2 className="font-display text-2xl font-bold text-stone-800 mb-6">
        Đánh giá sản phẩm
      </h2>

      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">

        {/* Summary */}
        <div className="p-6 border-b border-stone-100">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Big avg */}
            <div className="text-center sm:min-w-[120px]">
              <div className="text-5xl font-bold text-stone-800">{total > 0 ? avg.toFixed(1) : '—'}</div>
              <StarRating value={Math.round(avg)} readonly />
              <p className="text-sm text-stone-400 mt-1">{total} đánh giá</p>
            </div>
            {/* Bars */}
            <div className="flex-1 space-y-2 w-full">
              {dist.map(d => <RatingBar key={d.star} label={String(d.star)} count={d.count} total={total} />)}
            </div>
          </div>

          {/* Write review button */}
          {!userReview && (
            <button
              onClick={() => setShowForm(v => !v)}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-moss-600 hover:bg-moss-700 text-white text-sm font-semibold transition-colors"
            >
              <Star className="w-4 h-4" />
              {showForm ? 'Ẩn form' : 'Viết đánh giá'}
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && !userReview && (
          <div className="px-6 py-5 bg-moss-50/50 border-b border-stone-100 space-y-4">
            <p className="text-sm font-semibold text-stone-700">Đánh giá của bạn</p>

            <div className="flex items-center gap-3">
              <span className="text-sm text-stone-500">Chất lượng:</span>
              <StarRating value={rating} onChange={setRating} />
            </div>

            <div>
              <input
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-moss-400 focus:ring-2 focus:ring-moss-100 bg-white"
                placeholder="Tên của bạn *"
                value={reviewerName}
                onChange={e => setReviewerName(e.target.value)}
              />
            </div>

            <textarea
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-moss-400 focus:ring-2 focus:ring-moss-100 bg-white resize-none"
              rows={3}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-moss-600 hover:bg-moss-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
              Gửi đánh giá
            </button>
          </div>
        )}

        {/* Review list */}
        <div className="divide-y divide-stone-50">
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center px-6">
              <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                <Star className="w-6 h-6 text-stone-300" />
              </div>
              <p className="text-base font-medium text-stone-500">Chưa có đánh giá nào</p>
              <p className="text-sm text-stone-400 mt-1">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
            </div>
          ) : (
            reviews.map(r => (
              <div key={r.id} className={cn('px-6 py-5 flex gap-4', r.user_id === userId && 'bg-moss-50/30')}>
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-moss-100 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-moss-600">
                    {(r.reviewer_name || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-800 text-sm">{r.reviewer_name || 'Ẩn danh'}</span>
                      {r.user_id === userId && (
                        <span className="text-[10px] bg-moss-100 text-moss-600 font-semibold px-2 py-0.5 rounded-full">Bạn</span>
                      )}
                    </div>
                    <span className="text-xs text-stone-400">{formatDate(r.created_at)}</span>
                  </div>

                  <StarRating value={r.rating} readonly />

                  {r.content && (
                    <p className="text-sm text-stone-600 mt-2 leading-relaxed">{r.content}</p>
                  )}

                  {r.images?.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {r.images.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded-xl border border-stone-100" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="px-6 py-4 border-t border-stone-100 text-center">
            <button
              onClick={() => fetchReviews(page + 1)}
              disabled={loadingMore}
              className="flex items-center gap-2 mx-auto text-sm text-moss-600 hover:text-moss-800 font-semibold transition-colors"
            >
              {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
              Xem thêm đánh giá
            </button>
          </div>
        )}

      </div>
    </div>
  )
}