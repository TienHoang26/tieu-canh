// lib/use-cart.ts
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { getCartStore } from './cart-store'

export function useCart() {
  const [userId, setUserId] = useState<string>(
    typeof window !== 'undefined'
      ? (localStorage.getItem('userId') ?? 'guest')
      : 'guest'
  )

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then((response: { data: { user: User | null } }) => {
      const { user } = response.data
      if (user) {
        localStorage.setItem('userId', user.id)
        setUserId(user.id)
      } else {
        setUserId('guest')
      }
    })
  }, [])

  return getCartStore(userId)()
}