// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

// Không dùng singleton để tránh stale session cache sau OAuth redirect
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}