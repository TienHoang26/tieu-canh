// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Bỏ qua callback route
  if (pathname.startsWith('/api/auth/callback')) {
    return supabaseResponse
  }

  // ── Kiểm tra tài khoản bị khóa ──────────────────────────────────────
  if (user && !pathname.startsWith('/auth')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_locked')
      .eq('id', user.id)
      .single()

    if (profile?.is_locked && profile?.role !== 'admin') {
      // Đăng xuất session
      await supabase.auth.signOut()
      const url = new URL('/auth/login', request.url)
      url.searchParams.set('error', 'locked')
      return NextResponse.redirect(url)
    }
  }

  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = new URL('/auth/login', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (pathname.startsWith('/checkout') && !user) {
    return NextResponse.redirect(new URL('/auth/login?redirect=/checkout', request.url))
  }

  return supabaseResponse
}