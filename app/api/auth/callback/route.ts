// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  console.log('=== CALLBACK HIT ===')
  console.log('code:', code ? 'EXISTS' : 'MISSING')

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login`)
  }

  const response = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  console.log('exchange error:', error)
  console.log('exchange user:', data?.user?.email)

  if (error) {
    console.error('Auth callback error:', error.message)
    return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`)
  }

  if (data.user) {
    const user = data.user
    const meta = user.user_metadata

    console.log('upserting profile for:', user.email)
    console.log('meta:', meta)

    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: meta?.full_name || meta?.name || null,
      avatar_url: meta?.avatar_url || meta?.picture || null,
      role: 'user',
    }, {
      onConflict: 'id',
      ignoreDuplicates: false,
    })

    console.log('upsert error:', upsertError)
  }

  console.log('=== CALLBACK SUCCESS ===')
  return response
}