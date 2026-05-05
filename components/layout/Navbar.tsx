'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Menu, X, Leaf, User, LogOut, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/lib/cart-store'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'

export default function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const cartCount = useCart(s => s.count())

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        setProfile(data)
      } else {
        setProfile(null)
      }
    })

    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)

    return () => {
      listener.subscription.unsubscribe()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setProfile(null)
    setUserMenuOpen(false)
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/', label: 'Trang chủ' },
    { href: '/products', label: 'Sản phẩm' },
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'Về chúng tôi' },
    { href: '/contact', label: 'Liên hệ' },
  ]

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-100'
        : 'bg-white/80 backdrop-blur-sm'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-moss-600 rounded-xl flex items-center justify-center group-hover:bg-moss-700 transition-colors">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-xl text-stone-800">Tiểu Cảnh</span>
              <span className="font-display font-bold text-xl text-moss-600"> Việt</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-moss-600',
                  pathname === link.href ? 'text-moss-600' : 'text-stone-600'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Link href="/search" className="p-2.5 hover:bg-moss-50 rounded-xl transition-colors hidden sm:flex">
              <Search className="w-5 h-5 text-stone-700" />
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2.5 hover:bg-moss-50 rounded-xl transition-colors">
              <ShoppingBag className="w-5 h-5 text-stone-700" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-moss-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {mounted && (
              profile ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-moss-50 rounded-xl transition-colors"
                  >
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-moss-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-moss-700" />
                      </div>
                    )}
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="font-semibold text-sm text-stone-800 truncate">{profile.full_name || 'Người dùng'}</p>
                        <p className="text-xs text-stone-500 truncate">{profile.email}</p>
                      </div>
                      {profile.role === 'admin' && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-moss-50 hover:text-moss-700 transition-colors">
                          <Leaf className="w-4 h-4" /> Quản trị
                        </Link>
                      )}
                      <Link href="/orders" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-moss-50 transition-colors">
                        <ShoppingBag className="w-4 h-4" /> Đơn hàng
                      </Link>
                      <button onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/login" className="hidden sm:inline-flex items-center gap-1.5 btn-primary py-2 text-sm">
                  <User className="w-4 h-4" /> Đăng nhập
                </Link>
              )
            )}

            {/* Mobile menu toggle */}
            <button className="lg:hidden p-2.5" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-stone-100 py-4 space-y-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-stone-700 hover:bg-moss-50 rounded-xl">
                {link.label}
              </Link>
            ))}
            {!profile && (
              <Link href="/auth/login" onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm font-semibold text-moss-700 hover:bg-moss-50 rounded-xl">
                Đăng nhập / Đăng ký
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}