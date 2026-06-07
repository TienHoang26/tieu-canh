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
          // Bước 1: set vào request để các handler sau đọc được
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Bước 2: tạo lại response với request đã có cookie mới
          supabaseResponse = NextResponse.next({ request })
          // Bước 3: set vào response để browser nhận được
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // QUAN TRỌNG: phải gọi getUser() để middleware refresh token nếu cần
  // Không dùng kết quả này để redirect tránh vòng lặp với callback
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Bỏ qua callback route - đang trong quá trình xử lý OAuth
  if (pathname.startsWith('/api/auth/callback')) {
    return supabaseResponse
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