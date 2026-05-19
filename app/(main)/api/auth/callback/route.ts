import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/'

  if (code) {
    // ✅ FIX: Tạo response TẠM để cookie có thể được ghi vào
    // rồi mới exchange code — sau đó mới redirect
    const tempResponse = new NextResponse()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Ghi cookie vào tempResponse trước
            cookiesToSet.forEach(({ name, value, options }) =>
              tempResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error.message)
      return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`)
    }

    // ✅ Tạo redirect response rồi copy toàn bộ cookie từ tempResponse sang
    const redirectResponse = NextResponse.redirect(`${origin}${redirect}`)
    tempResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        httpOnly: cookie.httpOnly ?? true,
        secure: cookie.secure ?? process.env.NODE_ENV === 'production',
        sameSite: (cookie.sameSite as 'lax' | 'strict' | 'none') ?? 'lax',
        path: cookie.path ?? '/',
        maxAge: cookie.maxAge,
      })
    })

    return redirectResponse
  }

  // Không có code → về trang login
  return NextResponse.redirect(`${origin}/auth/login`)
}