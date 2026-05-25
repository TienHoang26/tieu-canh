// lib/use-cart.ts
import { useEffect, useState } from 'react'
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
    supabase.auth.getUser().then(({ data: { user } }) => {
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