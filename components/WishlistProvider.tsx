'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useWishlist } from '@/lib/wishlist-store'

export default function WishlistProvider() {
  const fetch = useWishlist(s => s.fetch)
  const reset = useWishlist(s => s.reset)

  useEffect(() => {
    const supabase = createClient()

    // Fetch lần đầu
    fetch()

    // Lắng nghe auth thay đổi
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        fetch()  // load wishlist của user mới
      }
      if (event === 'SIGNED_OUT') {
        reset()  // xóa sạch wishlist khỏi store
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [fetch, reset])

  return null
}