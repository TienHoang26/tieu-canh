import Link from 'next/link'
import { Leaf, Phone, Mail, MapPin, Facebook, Instagram, Music2 } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-moss-900 text-moss-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-moss-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">Sân Vườn Tiểu Cảnh NVM</span>
            </div>
            <p className="text-moss-300 text-sm leading-relaxed mb-6">
              Mang nghệ thuật thiên nhiên thu nhỏ đến mọi không gian sống, làm việc và học tập.
            </p>
            <div className="flex gap-3">
              <a href="https://r.search.yahoo.com/_ylt=AwrPpPx4Fg9qUAIAH6RrUwx.;_ylu=Y29sbwNzZzMEcG9zAzEEdnRpZAMEc2VjA3Ny/RV=2/RE=1780583288/RO=10/RU=https%3a%2f%2fwww.facebook.com%2fcongtyTNHHSANVUONTIEUCANHNVM%2f/RK=2/RS=3DHd394Faa5aQ.TJI5KZqeHx5Yg-" className="w-9 h-9 bg-moss-700 rounded-xl flex items-center justify-center hover:bg-moss-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.tiktok.com/@sanvuontieucanhnvm1?is_from_webapp=1&sender_device=pc" className="w-9 h-9 bg-moss-700 rounded-xl flex items-center justify-center hover:bg-moss-600 transition-colors">
                <Music2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-white mb-4">Khám phá</h4>
            <ul className="space-y-2.5">
              {[
                ['Trang chủ', '/'],
                ['Sản phẩm', '/products'],
                ['Blog & Kiến thức', '/blog'],
                ['Về chúng tôi', '/about'],
                ['Liên hệ', '/contact'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-moss-300 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-bold text-white mb-4">Tài khoản</h4>
            <ul className="space-y-2.5">
              {[
                ['Đăng nhập', '/auth/login'],
                ['Đăng ký', '/auth/register'],
                ['Đơn hàng của tôi', '/orders'],
                ['Giỏ hàng', '/cart'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-moss-300 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4">Liên hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-moss-300">
                <MapPin className="w-4 h-4 mt-0.5 text-moss-400 shrink-0" />
                16 Đường số 10 KDC Nam Long, P. Tân Thuận Đông, Quận 7 , Ho Chi Minh City, Vietnam
              </li>
              <li className="flex items-center gap-3 text-sm text-moss-300">
                <Phone className="w-4 h-4 text-moss-400 shrink-0" />
                0966.556.234 - 0982.424.345
              </li>
              <li className="flex items-center gap-3 text-sm text-moss-300">
                <Mail className="w-4 h-4 text-moss-400 shrink-0" />
                tranhdadep@gmail.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-moss-700 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-moss-400">
          <p>© 2026 Sân Vườn NVM. All rights reserved.</p>
          <p>Made with 💚 for nature lovers</p>
        </div>
      </div>
    </footer>
  )
}
