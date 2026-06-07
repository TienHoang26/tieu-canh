import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login`)
  }

  // Dùng request làm nơi collect cookie tạm
  const cookiesToForward: { name: string; value: string; options: any }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((c) => cookiesToForward.push(c))
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Auth callback error:', error.message)
    return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`)
  }

  if (data.user) {
    const meta = data.user.user_metadata
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email: data.user.email,
      full_name: meta?.full_name || meta?.name || null,
      avatar_url: meta?.avatar_url || meta?.picture || null,
      role: 'user',
    }, { onConflict: 'id', ignoreDuplicates: false })
  }

  // Gắn tất cả cookie session vào redirect response
  const redirectResponse = NextResponse.redirect(`${origin}${next}`)
  for (const { name, value, options } of cookiesToForward) {
    redirectResponse.cookies.set(name, value, options)
  }

  return redirectResponse
}