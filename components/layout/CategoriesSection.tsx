'use client'

import Link from 'next/link'
import type { Category } from '@/types'
import { motion } from 'framer-motion'

type SimpleCategory = {
  id: string
  name: string
  slug: string
}

const defaultCategories: SimpleCategory[] = [
  { id: '1', name: 'Bonsai nghệ thuật', slug: 'bonsai-nghe-thuat' },
  { id: '2', name: 'Tiểu cảnh thác nước', slug: 'tieu-canh-thac-nuoc' },
  { id: '3', name: 'Hòn non bộ', slug: 'hon-non-bo' },
  { id: '4', name: 'Tiểu cảnh để bàn', slug: 'tieu-canh-de-ban' },
  { id: '5', name: 'Tiểu cảnh phong thủy', slug: 'tieu-canh-phong-thuy' },
  { id: '6', name: 'Phụ kiện trang trí', slug: 'phu-kien-trang-tri' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
}

export default function CategoriesSection({ categories }: { categories: Category[] }) {
  const displayCategories = categories?.length ? categories.slice(0, 6) : defaultCategories

  return (
    <section className="py-44 bg-gradient-to-b from-white to-stone-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-moss-600 font-semibold text-sm uppercase tracking-widest mb-3">
            Danh mục sản phẩm
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-stone-800 relative inline-block">
            Khám phá theo chủ đề
            <span className="absolute -bottom-4 left-1/2 w-20 h-0.5 bg-moss-400 rounded-full -translate-x-1/2" />
          </h2>
          <p className="text-stone-500 mt-6 max-w-xl mx-auto leading-relaxed">
            Từ bonsai nghệ thuật đến tiểu cảnh phong thủy —{' '}
            mang thiên nhiên vào không gian sống của bạn
          </p>
        </motion.div>

        {/* Grid categories */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
        >

          {/* Bonsai nghệ thuật */}
          <motion.div variants={itemVariants}>
            <Link
              href="/products?category=bonsai-nghe-thuat"
              className="group flex flex-col rounded-2xl overflow-hidden border-2 border-moss-400 shadow-[0_2px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(74,124,74,0.22)] hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-full aspect-[4/3] overflow-hidden">
                <img
                  src="/images/categories/bonsai-nghe-thuat.svg"
                  alt="Bonsai nghệ thuật"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => { e.currentTarget.src = '/images/placeholder.svg' }}
                />
              </div>
              <div className="flex flex-col items-center px-6 py-4 bg-moss-600 group-hover:bg-moss-700 transition-colors duration-300">
                <span className="font-semibold text-white text-lg text-center">
                  Bonsai nghệ thuật
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Tiểu cảnh thác nước */}
          <motion.div variants={itemVariants}>
            <Link
              href="/products?category=tieu-canh-thac-nuoc"
              className="group flex flex-col rounded-2xl overflow-hidden border-2 border-moss-400 shadow-[0_2px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(74,124,74,0.22)] hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-full aspect-[4/3] overflow-hidden">
                <img
                  src="/images/categories/tieu-canh-thac-nuoc.svg"
                  alt="Tiểu cảnh thác nước"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => { e.currentTarget.src = '/images/placeholder.svg' }}
                />
              </div>
              <div className="flex flex-col items-center px-6 py-4 bg-moss-600 group-hover:bg-moss-700 transition-colors duration-300">
                <span className="font-semibold text-white text-lg text-center">
                  Tiểu cảnh thác nước
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Hòn non bộ */}
          <motion.div variants={itemVariants}>
            <Link
              href="/products?category=hon-non-bo"
              className="group flex flex-col rounded-2xl overflow-hidden border-2 border-moss-400 shadow-[0_2px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(74,124,74,0.22)] hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-full aspect-[4/3] overflow-hidden">
                <img
                  src="/index/DanhMuc1.jpg"
                  alt="Hòn non bộ"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => { e.currentTarget.src = '/images/placeholder.svg' }}
                />
              </div>
              <div className="flex flex-col items-center px-6 py-4 bg-moss-600 group-hover:bg-moss-700 transition-colors duration-300">
                <span className="font-semibold text-white text-lg text-center">
                  Hòn non bộ
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Tiểu cảnh để bàn */}
          <motion.div variants={itemVariants}>
            <Link
              href="/products?category=tieu-canh-de-ban"
              className="group flex flex-col rounded-2xl overflow-hidden border-2 border-moss-400 shadow-[0_2px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(74,124,74,0.22)] hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-full aspect-[4/3] overflow-hidden">
                <img
                  src="/images/categories/tieu-canh-de-ban.svg"
                  alt="Tiểu cảnh để bàn"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => { e.currentTarget.src = '/images/placeholder.svg' }}
                />
              </div>
              <div className="flex flex-col items-center px-6 py-4 bg-moss-600 group-hover:bg-moss-700 transition-colors duration-300">
                <span className="font-semibold text-white text-lg text-center">
                  Tiểu cảnh để bàn
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Tiểu cảnh phong thủy */}
          <motion.div variants={itemVariants}>
            <Link
              href="/products?category=tieu-canh-phong-thuy"
              className="group flex flex-col rounded-2xl overflow-hidden border-2 border-moss-400 shadow-[0_2px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(74,124,74,0.22)] hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-full aspect-[4/3] overflow-hidden">
                <img
                  src="/images/categories/tieu-canh-phong-thuy.svg"
                  alt="Tiểu cảnh phong thủy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => { e.currentTarget.src = '/images/placeholder.svg' }}
                />
              </div>
              <div className="flex flex-col items-center px-6 py-4 bg-moss-600 group-hover:bg-moss-700 transition-colors duration-300">
                <span className="font-semibold text-white text-lg text-center">
                  Tiểu cảnh phong thủy
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Phụ kiện trang trí */}
          <motion.div variants={itemVariants}>
            <Link
              href="/products?category=phu-kien-trang-tri"
              className="group flex flex-col rounded-2xl overflow-hidden border-2 border-moss-400 shadow-[0_2px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(74,124,74,0.22)] hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-full aspect-[4/3] overflow-hidden">
                <img
                  src="/images/categories/phu-kien-trang-tri.svg"
                  alt="Phụ kiện trang trí"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => { e.currentTarget.src = '/images/placeholder.svg' }}
                />
              </div>
              <div className="flex flex-col items-center px-6 py-4 bg-moss-600 group-hover:bg-moss-700 transition-colors duration-300">
                <span className="font-semibold text-white text-lg text-center">
                  Phụ kiện trang trí
                </span>
              </div>
            </Link>
          </motion.div>

        </motion.div>

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex justify-center mt-20"
        >
          <Link
            href="/products"
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-moss-600 text-white font-semibold text-lg shadow-md hover:bg-moss-700 hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span>Xem tất cả sản phẩm</span>
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>

      </div>
    </section>
  )
}