'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ShoppingBag, Menu, X, User, LogOut, Search,
  Phone, Mail, MapPin, Facebook, Youtube,
  MessageCircle, Heart, KeyRound,
} from 'lucide-react'
import { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { clearCartCache } from '@/lib/cart-store'
import { useCart } from '@/lib/use-cart'
import { useWishlist } from '@/lib/wishlist-store'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'
import { useRouter } from 'next/navigation'

// Tạo client 1 lần duy nhất ở module level (ngoài component)
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)



let profileCache: { userId: string; profile: Profile } | null = null

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [authReady, setAuthReady] = useState(false) // chờ auth xác định xong
  const [menuOpen, setMenuOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { count } = useCart()
  const cartCount = count()
  const { wishlistIds } = useWishlist()
  const wishlistCount = wishlistIds.size

  useEffect(() => {
    setMounted(true)

    const fetchProfile = async (userId: string) => {
      if (profileCache?.userId === userId) return profileCache.profile
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (data) profileCache = { userId, profile: data }
      return data
    }

    // onAuthStateChange tự fire INITIAL_SESSION ngay khi subscribe
    // → bắt được session từ cookie sau Google OAuth redirect
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          localStorage.setItem('userId', session.user.id)
          const data = await fetchProfile(session.user.id)
          if (data) {
            setProfile(data)
          } else {
            const meta = session.user.user_metadata
            setProfile({
              id: session.user.id,
              email: session.user.email ?? '',
              full_name: meta?.full_name || meta?.name || null,
              avatar_url: meta?.avatar_url || meta?.picture || null,
              role: 'user',
              phone: null,
              address: null,
              created_at: new Date().toISOString(),
            } as unknown as Profile)
          }
        } else {
          setProfile(null)
          if (event === 'SIGNED_OUT') {
            localStorage.removeItem('userId')
          }
        }
        // Đánh dấu auth đã sẵn sàng sau lần đầu tiên nhận event
        setAuthReady(true)
      }
    )

    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  if (!mounted) return null

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (_) {}
    localStorage.removeItem('userId')
    profileCache = null
    clearCartCache()
    setProfile(null)
    setUserMenuOpen(false)
    window.location.href = '/auth/login'
  }

  const handleSearch = (e: React.FormEvent) => {
  e.preventDefault()
  if (searchQuery.trim()) {
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    setSearchQuery('')
    setMenuOpen(false)
  }
}

  const navLinks = [
    { href: '/', label: 'Trang chủ' },
    { href: '/products', label: 'Sản phẩm' },
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'Về chúng tôi' },
    { href: '/contact', label: 'Liên hệ' },
  ]

  // Phần account: chờ auth ready mới render để tránh flicker
  const renderAccount = () => {
    if (!authReady) {
      // Placeholder giữ layout, không hiện gì
      return <div className="w-9 h-9" />
    }
    if (profile) {
      return (
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-2 sm:px-3 py-2 hover:bg-moss-50 rounded-xl transition-colors"
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-8 h-8 rounded-full object-cover border-2 border-moss-200"
              />
            ) : (
              <div className="w-8 h-8 bg-moss-600 rounded-full flex items-center justify-center text-white text-xs font-bold uppercase">
                {profile.full_name
                  ? profile.full_name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
                  : (profile.email || 'U').slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="hidden sm:block text-sm font-semibold text-stone-800 max-w-[120px] truncate">
              {profile.full_name || 'Người dùng'}
            </span>
          </button>

          {userMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50">
              {profile.role === 'admin' && (
                <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm text-stone-700 hover:bg-moss-50">
                  Quản trị
                </Link>
              )}
              <Link href="/profile" onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm text-stone-700 hover:bg-moss-50">
                <User className="w-4 h-4" /> Hồ sơ cá nhân
              </Link>
              <Link href="/profile/change-password" onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm text-stone-700 hover:bg-moss-50">
                <KeyRound className="w-4 h-4" /> Đổi mật khẩu
              </Link>
              <button onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-5 py-2.5 text-sm text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4" /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      )
    }
    return (
      <Link href="/auth/login"
        className="hidden sm:inline-flex items-center gap-1.5 btn-primary py-2 px-3 text-sm">
        <User className="w-4 h-4" /> Đăng nhập
      </Link>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* TOP INFO BAR */}
      <div className="bg-moss-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 sm:gap-5">
              <a href="tel:0966556234"
                className="flex items-center gap-1.5 hover:text-moss-200 transition-colors whitespace-nowrap">
                <Phone className="w-3 h-3 flex-shrink-0" />
                <span>0966.556.234 - 0982.424.345</span>
              </a>
              <a href="mailto:tranhdadep@gmail.com"
                className="hidden sm:flex items-center gap-1.5 hover:text-moss-200 transition-colors whitespace-nowrap">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span>tranhdadep@gmail.com</span>
              </a>
              <span className="hidden md:flex items-center gap-1.5 text-moss-200 whitespace-nowrap">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span>TP Hồ Chí Minh, Việt Nam</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[
                { href: 'https://facebook.com', icon: <Facebook className="w-3 h-3" />, label: 'Facebook' },
                { href: 'https://youtube.com', icon: <Youtube className="w-3 h-3" />, label: 'YouTube' },
                {
                  href: 'https://tiktok.com',
                  icon: (
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z" />
                    </svg>
                  ),
                  label: 'TikTok'
                },
                { href: 'https://zalo.me', icon: <MessageCircle className="w-3 h-3" />, label: 'Zalo' },
              ].map(({ href, icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="w-6 h-6 bg-white/10 hover:bg-white/25 rounded flex items-center justify-center transition-colors">
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <div className={cn(
        'transition-all duration-300',
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-100' : 'bg-white/80 backdrop-blur-sm'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24 gap-3 lg:gap-6">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group flex-shrink-0 min-w-0">
              <img src="/index/Logo.jpg" alt="Logo Sân Vườn Tiểu Cảnh NVM" width={36} height={36}
                className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-contain rounded-xl flex-shrink-0"
                onError={(e) => {
                  const t = e.currentTarget
                  t.style.display = 'none';
                  (t.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                  (t.nextElementSibling as HTMLElement)?.classList.add('flex')
                }}
              />
              <div className="hidden w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-moss-600 rounded-xl items-center justify-center text-white font-bold text-xs flex-shrink-0 group-hover:bg-moss-700 transition-colors">
                NVM
              </div>
              <div className="leading-tight min-w-0">
                <div className="font-display font-bold text-base sm:text-lg lg:text-xl text-stone-800 whitespace-nowrap">
                  Sân Vườn Tiểu Cảnh <span className="text-moss-600">NVM</span>
                </div>
              </div>
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 flex-shrink-0">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-moss-600 whitespace-nowrap',
                    pathname === link.href ? 'text-moss-600' : 'text-stone-600'
                  )}>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* SEARCH BAR */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center flex-shrink-0 w-36 lg:w-48">
              <div className="relative w-full">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm cây cảnh, đá, chậu..."
                  className="w-full h-9 pl-4 pr-9 text-sm rounded-xl outline-none transition-all bg-stone-100 border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:border-moss-400 focus:bg-white focus:ring-2 focus:ring-moss-100"
                />
                <button type="submit" aria-label="Tìm kiếm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-moss-600 transition-colors">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              <Link href="/search" aria-label="Tìm kiếm"
                className="md:hidden p-2 sm:p-2.5 hover:bg-moss-50 rounded-xl transition-colors">
                <Search className="w-5 h-5 text-stone-700" />
              </Link>

              <Link href="/wishlist" aria-label="Sản phẩm yêu thích" id="navbar-wishlist-icon"
                className="relative p-2 sm:p-2.5 hover:bg-red-50 rounded-xl transition-colors group">
                <Heart className={cn(
                  'w-5 h-5 transition-colors',
                  pathname === '/wishlist' ? 'fill-red-500 stroke-red-500' : 'text-stone-700 group-hover:text-red-500'
                )} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              <Link href="/cart" aria-label="Giỏ hàng" id="navbar-cart-icon"
                className="relative p-2 sm:p-2.5 hover:bg-moss-50 rounded-xl transition-colors">
                <ShoppingBag className="w-5 h-5 text-stone-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-moss-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {renderAccount()}

              <button className="lg:hidden p-2 sm:p-2.5 hover:bg-moss-50 rounded-xl transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}>
                {menuOpen ? <X className="w-5 h-5 text-stone-700" /> : <Menu className="w-5 h-5 text-stone-700" />}
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}
          {menuOpen && (
            <div className="lg:hidden border-t border-stone-100 pb-4 pt-3">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium rounded-xl text-stone-700 hover:bg-moss-50">
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}