export default function StatsBanner() {
  const stats = [
    { value: '500+', label: 'Sản phẩm', emoji: '🌿' },
    { value: '2,000+', label: 'Khách hàng hài lòng', emoji: '😊' },
    { value: '50+', label: 'Loài cây cảnh', emoji: '🌱' },
    { value: '4.9★', label: 'Đánh giá trung bình', emoji: '⭐' },
  ]

  return (
    <section className="bg-moss-800 text-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-moss-600">
          {stats.map(({ value, label, emoji }) => (
            <div key={label} className="text-center py-2">
              <div className="text-3xl mb-1">{emoji}</div>
              <div className="font-display text-3xl font-bold text-white">{value}</div>
              <div className="text-moss-300 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
