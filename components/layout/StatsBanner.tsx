'use client'
import { useEffect, useRef, useState } from 'react'

const stats = [
  { target: 500,  suffix: '+',  decimals: 0, label: 'Sản phẩm',          emoji: '🌿' },
  { target: 2000, suffix: '+',  decimals: 0, label: 'Khách hàng hài lòng', emoji: '😊' },
  { target: 50,   suffix: '+',  decimals: 0, label: 'Loài cây cảnh',      emoji: '🌱' },
  { target: 4.9,  suffix: '★',  decimals: 1, label: 'Đánh giá trung bình', emoji: '⭐' },
]

function CountUp({ target, decimals, active, delay }: {
  target: number; decimals: number; active: boolean; delay: number
}) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => {
      const duration = 1800
      const start = performance.now()
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 4)
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1)
        setValue(easeOut(progress) * target)
        if (progress < 1) requestAnimationFrame(tick)
        else setValue(target)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timer)
  }, [active, target, delay])

  return <>{decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString()}</>
}

export default function StatsBanner() {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="bg-moss-800 text-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-moss-600">
          {stats.map(({ target, suffix, decimals, label, emoji }, i) => (
            <div key={label} className="text-center py-2">
              <div className="text-3xl mb-1">{emoji}</div>
              <div className="font-display text-3xl font-bold text-white">
                <CountUp target={target} decimals={decimals} active={active} delay={i * 120} />
                {suffix}
              </div>
              <div className="text-moss-300 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}