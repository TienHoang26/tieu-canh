import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/auth/login', request.url))
  
  // Xóa tất cả cookie sb-
  request.cookies.getAll().forEach(cookie => {
    if (cookie.name.includes('sb-') || cookie.name.includes('supabase')) {
      response.cookies.delete(cookie.name)
    }
  })

  return response
}