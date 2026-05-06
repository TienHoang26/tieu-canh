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

  const { data: { user }, error } = await supabase.auth.getUser()

  // Nếu có cookie nhưng session invalid → xóa hết cookie auth để tránh loop
  if (error && request.cookies.getAll().some(c => c.name.startsWith('sb-'))) {
    const clearResponse = NextResponse.next({ request })
    request.cookies.getAll()
      .filter(c => c.name.startsWith('sb-'))
      .forEach(c => clearResponse.cookies.delete(c.name))
    return clearResponse
  }

  const { pathname } = request.nextUrl

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