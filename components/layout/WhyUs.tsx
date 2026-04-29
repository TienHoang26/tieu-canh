import { Truck, Shield, Leaf, HeartHandshake } from 'lucide-react'

const features = [
  {
    icon: Leaf,
    title: 'Nguyên liệu tự nhiên 100%',
    desc: 'Tất cả nguyên liệu được lựa chọn kỹ lưỡng từ thiên nhiên, không hóa chất độc hại.',
    color: 'bg-moss-100 text-moss-600',
  },
  {
    icon: Truck,
    title: 'Giao hàng toàn quốc',
    desc: 'Đóng gói chuyên biệt cho cây cảnh, đảm bảo cây đến tay bạn trong trạng thái tươi tốt.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Shield,
    title: 'Bảo hành 7 ngày',
    desc: 'Đổi trả miễn phí nếu cây héo hoặc chết trong 7 ngày đầu sau khi nhận hàng.',
    color: 'bg-earth-100 text-earth-600',
  },
  {
    icon: HeartHandshake,
    title: 'Tư vấn miễn phí',
    desc: 'Chatbot AI 24/7 tư vấn cách chăm sóc và chọn lựa sản phẩm phù hợp với không gian của bạn.',
    color: 'bg-purple-100 text-purple-600',
  },
]

export default function WhyUs() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-moss-600 font-semibold text-sm uppercase tracking-widest mb-3">Cam kết</p>
          <h2 className="section-title">Tại sao chọn Tiểu Cảnh Việt?</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="group p-6 rounded-2xl border border-stone-100 hover:border-moss-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white">
              <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-800 mb-2">{title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
