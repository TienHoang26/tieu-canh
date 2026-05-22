'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Truck, Shield, Leaf, HeartHandshake } from 'lucide-react'

const features = [
  {
    icon: Leaf,
    title: 'Nguyên liệu tự nhiên 100%',
    desc: 'Tất cả nguyên liệu được lựa chọn kỹ lưỡng từ thiên nhiên, không hóa chất độc hại.',
  },
  {
    icon: Truck,
    title: 'Giao hàng toàn quốc',
    desc: 'Đóng gói chuyên biệt cho cây cảnh, đảm bảo cây đến tay bạn trong trạng thái tươi tốt.',
  },
  {
    icon: Shield,
    title: 'Bảo hành 7 ngày',
    desc: 'Đổi trả miễn phí nếu cây héo hoặc chết trong 7 ngày đầu sau khi nhận hàng.',
  },
  {
    icon: HeartHandshake,
    title: 'Tư vấn miễn phí',
    desc: 'Đội ngũ NVM sẵn sàng hỗ trợ tư vấn chọn lựa sản phẩm phù hợp với không gian của bạn.',
  },
]

const leftVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 24 } },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.13, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 24 } },
}

export default function WhyUs() {
  return (
    <section className="py-44 bg-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-moss-50 opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-stone-100 opacity-60 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">

  {/* LEFT — cards so le */}
  <motion.div
    variants={containerVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-80px' }}
    className="lg:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-5"
  >
    {features.map(({ icon: Icon, title, desc }, i) => (
      <motion.div
        key={title}
        variants={itemVariants}
        className={`group relative flex flex-col bg-white rounded-3xl border-[1.5px] border-stone-100 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-moss-300 hover:shadow-[0_16px_48px_rgba(59,109,17,0.15)] ${
          i % 2 === 1 ? 'sm:mt-8' : ''
        }`}
      >
        <div className="h-1 w-full bg-gradient-to-r from-moss-500 to-moss-400 group-hover:h-1.5 transition-all duration-300" />
        <div className="flex flex-col p-7 flex-1">
          <div className="w-14 h-14 bg-moss-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-moss-700">
            <Icon className="w-7 h-7 text-white" strokeWidth={1.6} />
          </div>
          <h3 className="font-bold text-stone-800 text-base leading-snug mb-2">
            {title}
          </h3>
          <p className="text-sm text-stone-500 leading-relaxed flex-1">
            {desc}
          </p>
        </div>
      </motion.div>
    ))}
  </motion.div>

  {/* RIGHT — chữ */}
  <motion.div
    variants={leftVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-50px' }}
    className="lg:w-2/5 flex-shrink-0"
  >
    <p className="text-moss-600 font-semibold text-sm uppercase tracking-widest mb-4">
      Cam kết
    </p>
    <h2 className="text-4xl md:text-5xl font-bold text-stone-800 leading-tight mb-6">
      Tại sao chọn{' '}
      <span className="text-moss-600">NVM</span>?
    </h2>
    <div className="w-16 h-0.5 bg-moss-400 rounded-full mb-6" />
    <p className="text-stone-500 text-lg leading-relaxed mb-10">
      Chúng tôi không chỉ bán cây — chúng tôi mang cả một góc thiên nhiên vào không gian sống của bạn.
    </p>
    <Link
      href="/products"
      className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-moss-600 text-white font-semibold text-base shadow-md hover:bg-moss-700 hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
    >
      <span>Khám phá sản phẩm</span>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  </motion.div>

</div>
      </div>
    </section>
  )
}