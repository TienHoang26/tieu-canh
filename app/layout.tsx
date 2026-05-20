import type { Metadata } from 'next'
import { Playfair_Display, Lato } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Tiểu Cảnh Việt | Nghệ Thuật Thiên Nhiên Thu Nhỏ',
  description: 'Khám phá bộ sưu tập tiểu cảnh, terrarium, bonsai mini độc đáo. Mang thiên nhiên vào không gian sống của bạn.',
  keywords: 'tiểu cảnh, terrarium, bonsai mini, zen garden, cây cảnh mini',
  openGraph: {
    title: 'Tiểu Cảnh Việt',
    description: 'Nghệ thuật thiên nhiên thu nhỏ',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${playfair.variable} ${lato.variable}`}>
      <body suppressHydrationWarning className="font-body bg-stone-50 text-stone-800 antialiased">
        <Navbar />
        
        {/* Tăng padding từ pt-20 lên pt-24 */}
        <main className="pt-24">
          {children}
        </main>
        
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-body)',
              background: '#1f4522',
              color: '#f0f7f0',
            },
          }}
        />
      </body>
    </html>
  )
}