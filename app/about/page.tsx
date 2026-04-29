import type { Metadata } from 'next'
import Link from 'next/link'
import { Leaf, Heart, Award, Users, ArrowRight, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Về Chúng Tôi | Tiểu Cảnh Việt',
  description: 'Câu chuyện về Tiểu Cảnh Việt — hành trình mang thiên nhiên thu nhỏ đến mọi không gian sống.',
}

const team = [
  { name: 'Trần Minh Khoa', role: 'Nhà sáng lập & Nghệ nhân', avatar: 'https://i.pravatar.cc/200?img=12', bio: '10+ năm kinh nghiệm với bonsai và tiểu cảnh Nhật Bản.' },
  { name: 'Nguyễn Thị Lan', role: 'Chuyên gia Terrarium', avatar: 'https://i.pravatar.cc/200?img=25', bio: 'Đam mê tạo ra những hệ sinh thái thu nhỏ độc đáo.' },
  { name: 'Lê Văn Hùng', role: 'Thiết kế & Phối màu', avatar: 'https://i.pravatar.cc/200?img=14', bio: 'Kết hợp nghệ thuật và thiên nhiên tạo nên vẻ đẹp thuần khiết.' },
]

const values = [
  { icon: Leaf, title: 'Thiên nhiên thuần khiết', desc: 'Mọi nguyên liệu được lựa chọn kỹ từ thiên nhiên, không hoá chất. Chúng tôi cam kết sản phẩm 100% an toàn cho người và môi trường.' },
  { icon: Heart, title: 'Tạo ra bằng tình yêu', desc: 'Mỗi sản phẩm là tác phẩm thủ công, đòi hỏi sự tỉ mỉ và tình yêu với thiên nhiên. Không có hai sản phẩm nào hoàn toàn giống nhau.' },
  { icon: Award, title: 'Chất lượng hàng đầu', desc: 'Chúng tôi không ngừng học hỏi từ các nghệ nhân Nhật Bản và nâng cao chất lượng sản phẩm qua từng năm.' },
  { icon: Users, title: 'Cộng đồng kết nối', desc: 'Hơn 2000 khách hàng trên cả nước cùng chia sẻ niềm đam mê thiên nhiên và nghệ thuật tiểu cảnh.' },
]

const milestones = [
  { year: '2018', title: 'Khởi đầu', desc: 'Từ một góc ban công nhỏ ở Hà Nội, Tiểu Cảnh Việt bắt đầu từ niềm đam mê cá nhân.' },
  { year: '2019', title: 'Cửa hàng đầu tiên', desc: 'Khai trương showroom đầu tiên tại Tây Hồ, Hà Nội với 50+ sản phẩm.' },
  { year: '2021', title: 'Bán hàng online', desc: 'Ra mắt website và mở rộng giao hàng toàn quốc, phục vụ khách hàng từ Bắc đến Nam.' },
  { year: '2023', title: '2000+ khách hàng', desc: 'Đạt mốc 2000 khách hàng thân thiết, ra mắt chatbot AI tư vấn 24/7.' },
  { year: '2025', title: 'Mở rộng', desc: 'Thêm xưởng sản xuất và đội ngũ nghệ nhân, mở rộng danh mục với 500+ sản phẩm.' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-20 lg:pt-24">
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-moss-50 via-white to-earth-50 overflow-hidden">
        <div className="absolute inset-0 bg-leaf-pattern" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-moss-200/30 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-moss-100 text-moss-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Leaf className="w-4 h-4" /> Câu chuyện của chúng tôi
          </div>
          <h1 className="font-display text-4xl lg:text-6xl font-bold text-stone-800 mb-6 leading-tight">
            Mang Thiên Nhiên<br />
            <span className="text-moss-600">Vào Cuộc Sống</span>
          </h1>
          <p className="text-xl text-stone-500 leading-relaxed max-w-2xl mx-auto">
            Tiểu Cảnh Việt được thành lập với một sứ mệnh đơn giản: đưa vẻ đẹp của thiên nhiên vào từng góc nhỏ của không gian sống, làm việc và học tập của người Việt.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-stone-800">
                Từ niềm đam mê đến sứ mệnh
              </h2>
              <div className="space-y-4 text-stone-600 leading-relaxed">
                <p>
                  Năm 2018, người sáng lập Trần Minh Khoa bắt đầu học nghệ thuật tiểu cảnh Zen từ một người thầy Nhật Bản. Điều đầu tiên ông học được không phải là kỹ thuật, mà là triết lý: <em>"Thiên nhiên không cần hoàn hảo. Nó chỉ cần thật."</em>
                </p>
                <p>
                  Từ góc ban công nhỏ, những tác phẩm đầu tiên ra đời — mộc mạc, thô ráp nhưng đầy sức sống. Bạn bè và người thân xin mua. Rồi người quen của người quen xin mua. Và Tiểu Cảnh Việt ra đời như vậy, không theo kế hoạch, chỉ theo tình yêu.
                </p>
                <p>
                  Hôm nay, với đội ngũ gồm các nghệ nhân, nhà thiết kế và chuyên gia chăm sóc cây, chúng tôi tự hào mang đến hơn 500 sản phẩm thủ công độc đáo, phục vụ hơn 2000 khách hàng trên toàn quốc.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                {['Handmade 100%', 'Nguyên liệu tự nhiên', 'Ship toàn quốc', 'Bảo hành 7 ngày'].map(tag => (
                  <span key={tag} className="flex items-center gap-1.5 text-sm text-moss-700 bg-moss-50 px-3 py-1.5 rounded-full font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden h-52 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=600" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-2xl overflow-hidden h-36 shadow-md">
                  <img src="https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=600" alt="" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="rounded-2xl overflow-hidden h-36 shadow-md">
                  <img src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-2xl overflow-hidden h-52 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1604762524889-3e2fcc145683?w=600" alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-stone-50 bg-leaf-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-stone-800 mb-4">Giá trị cốt lõi</h2>
            <p className="text-stone-500 max-w-xl mx-auto">Những nguyên tắc hướng dẫn mọi việc chúng tôi làm, từ khâu chọn nguyên liệu đến chăm sóc khách hàng.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-moss-100 rounded-2xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-moss-600" />
                </div>
                <h3 className="font-bold text-stone-800 mb-2">{title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-stone-800 mb-4">Hành trình phát triển</h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-moss-200" />
            <div className="space-y-8">
              {milestones.map(({ year, title, desc }) => (
                <div key={year} className="relative flex gap-6 items-start">
                  <div className="relative z-10 w-16 h-16 bg-moss-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                    <span className="text-white font-bold text-sm">{year}</span>
                  </div>
                  <div className="pt-2 pb-6">
                    <h3 className="font-bold text-stone-800 text-lg mb-1">{title}</h3>
                    <p className="text-stone-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-moss-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-stone-800 mb-4">Đội ngũ chúng tôi</h2>
            <p className="text-stone-500">Những người đang ngày ngày tạo ra các tác phẩm thiên nhiên thu nhỏ cho bạn.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {team.map(({ name, role, avatar, bio }) => (
              <div key={name} className="text-center">
                <img src={avatar} alt={name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover shadow-md ring-4 ring-white" />
                <h3 className="font-bold text-stone-800">{name}</h3>
                <p className="text-moss-600 text-sm font-medium mb-2">{role}</p>
                <p className="text-stone-500 text-sm">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-moss-800 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">Bắt đầu hành trình của bạn</h2>
          <p className="text-moss-200 text-lg mb-8">Khám phá hàng trăm sản phẩm tiểu cảnh thủ công độc đáo ngay hôm nay.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/products" className="bg-white text-moss-800 font-bold px-8 py-3.5 rounded-xl hover:bg-moss-50 transition-colors inline-flex items-center gap-2">
              Xem sản phẩm <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="border-2 border-white/40 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors">
              Liên hệ chúng tôi
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
