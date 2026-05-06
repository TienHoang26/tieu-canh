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
          // 1. Cập nhật cookie cho request để các Server Components đọc được ngay
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          
          // 2. Cập nhật cookie cho response để trả về trình duyệt
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options) // SỬA: Dùng trực tiếp options từ Supabase
          )
        },
      },
    }
  )

  // Lưu ý: getUser() sẽ kích hoạt setAll nếu token cần refresh
  const { data: { user } } = await supabase.auth.getUser()

  // Logic bảo vệ Route Admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const url = new URL('/auth/login', request.url)
      url.searchParams.set('redirect', request.nextUrl.pathname)
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

  // Logic bảo vệ Checkout
  if (request.nextUrl.pathname.startsWith('/checkout') && !user) {
    return NextResponse.redirect(new URL('/auth/login?redirect=/checkout', request.url))
  }

  return supabaseResponse
}