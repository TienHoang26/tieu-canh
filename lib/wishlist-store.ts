'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

interface WishlistStore {
  wishlistIds: Set<string>
  loaded: boolean
  fetch: () => Promise<void>
  reset: () => void
  toggle: (productId: string) => Promise<'added' | 'removed' | 'unauthenticated'>
  isWished: (productId: string) => boolean
}

export const useWishlist = create<WishlistStore>((set, get) => ({
  wishlistIds: new Set(),
  loaded: false,

  fetch: async () => {
    const supabase = createClient()
    const response = await supabase.auth.getUser()
    const user = response.data.user
    
    if (!user) { 
      set({ loaded: true }); 
      return 
    }

    const { data } = await supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', user.id)

    set({
      wishlistIds: new Set(data?.map((r: { product_id: string }) => r.product_id) ?? []),
      loaded: true,
    })
  },

  // Xóa sạch khi logout
  reset: () => set({ wishlistIds: new Set(), loaded: false }),

  toggle: async (productId: string) => {
    const supabase = createClient()
    const response = await supabase.auth.getUser()
    const user = response.data.user
    
    if (!user) return 'unauthenticated'

    const current = get().wishlistIds

    if (current.has(productId)) {
      await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)

      const next = new Set(current)
      next.delete(productId)
      set({ wishlistIds: next })
      return 'removed'
    } else {
      await supabase
        .from('wishlists')
        .insert({ user_id: user.id, product_id: productId })

      const next = new Set(current)
      next.add(productId)
      set({ wishlistIds: next })
      return 'added'
    }
  },

  isWished: (productId: string) => get().wishlistIds.has(productId),
}))