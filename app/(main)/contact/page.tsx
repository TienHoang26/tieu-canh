'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle, MessageCircle, Facebook, Music2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const faqs = [
  { q: 'Làm sao để chăm sóc tiểu cảnh sau khi mua?', a: 'Chúng tôi gửi kèm hướng dẫn chăm sóc chi tiết với mỗi sản phẩm. Bạn cũng có thể hỏi chatbot AI của chúng tôi bất cứ lúc nào.' },
  { q: 'Chính sách đổi trả như thế nào?', a: 'Trong 7 ngày nếu cây chết hoặc sản phẩm hư hỏng do lỗi vận chuyển, chúng tôi hoàn tiền hoặc đổi sản phẩm mới miễn phí.' },
  { q: 'Ship đến tỉnh thành nào?', a: 'Chúng tôi giao hàng toàn quốc 63 tỉnh thành. Cây cảnh được đóng gói đặc biệt để đảm bảo an toàn trong quá trình vận chuyển.' },
  { q: 'Có thể đặt hàng số lượng lớn không?', a: 'Có! Chúng tôi nhận đặt hàng sỉ cho doanh nghiệp, spa, resort, văn phòng với giá ưu đãi. Liên hệ trực tiếp để được tư vấn.' },
  { q: 'Có nhận đặt tiểu cảnh theo yêu cầu không?', a: 'Có, chúng tôi nhận thiết kế theo yêu cầu với kích thước, phong cách và ngân sách do khách lựa chọn. Thời gian thực hiện 7-14 ngày.' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('contact_messages').insert(form)
    if (error) { toast.error('Gửi thất bại, vui lòng thử lại!') }
    else { setSent(true); toast.success('Đã gửi tin nhắn thành công!') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-6 lg:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left: Contact info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-bold text-stone-800 text-xl mb-6">Thông tin liên hệ</h2>
              <div className="space-y-5">
                {[
                  { icon: MapPin, label: 'Địa chỉ', value: '16 Đường số 10 KDC Nam Long, P. Tân Thuận Đông, Quận 7 , Ho Chi Minh City, Vietnam', color: 'text-red-500 bg-red-50' },
                  { icon: Phone, label: 'Điện thoại', value: '0966.556.234 - 0982.424.345', color: 'text-green-600 bg-green-50' },
                  { icon: Mail, label: 'Email', value: 'tranhdadep@gmail.com', color: 'text-blue-500 bg-blue-50' },
                  { icon: Clock, label: 'Giờ làm việc', value: 'Thứ 2 – Thứ 7: 8:00 – 18:00\nChủ nhật: 9:00 – 16:00', color: 'text-purple-500 bg-purple-50' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex gap-4">
                    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">{label}</p>
                      <p className="text-stone-700 font-medium whitespace-pre-line leading-relaxed">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social */}
            <div>
              <h3 className="font-bold text-stone-800 mb-4">Mạng xã hội</h3>
              <div className="flex gap-3">
                {[
                  { icon: Facebook, label: 'Facebook', color: 'bg-blue-600 hover:bg-blue-700', href: 'https://r.search.yahoo.com/_ylt=AwrPpPx4Fg9qUAIAH6RrUwx.;_ylu=Y29sbwNzZzMEcG9zAzEEdnRpZAMEc2VjA3Ny/RV=2/RE=1780583288/RO=10/RU=https%3a%2f%2fwww.facebook.com%2fcongtyTNHHSANVUONTIEUCANHNVM%2f/RK=2/RS=3DHd394Faa5aQ.TJI5KZqeHx5Yg-' },
                 { icon: Music2, label: 'TikTok', color: 'bg-black hover:bg-stone-800', href: 'https://www.tiktok.com/@sanvuontieucanhnvm1?is_from_webapp=1&sender_device=pc' },
                  { icon: MessageCircle, label: 'Zalo', color: 'bg-sky-500 hover:bg-sky-600', href: '#' },
                ].map(({ icon: Icon, label, color, href }) => (
                  <a key={label} href={href} className={`flex items-center gap-2 ${color} text-white px-4 py-2.5 rounded-xl transition-colors text-sm font-medium`}>
                    <Icon className="w-4 h-4" /> {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Map embed */}
           <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
  <iframe
    src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d62713.83865098125!2d106.68974328688334!3d10.764132354813476!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1zMTYgxJDGsOG7nW5nIHPhu5EgMTAgS0RDIE5hbSBMb25nLCBQLiBUw6JuIFRodeG6rW4gxJDDtG5nLCBRdeG6rW4gNyAsIEhvIENoaSBNaW5oIENpdHksIFZpZXRuYW0!5e0!3m2!1svi!2s!4v1779372973277!5m2!1svi!2s"
    width="100%"
    height="240"
    style={{ border: 0 }}
    allowFullScreen
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    title="Vị trí Tiểu Cảnh Việt"
  />
</div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
              {sent ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-moss-600 mx-auto mb-4" />
                  <h3 className="font-display text-2xl font-bold text-stone-800 mb-2">Đã gửi thành công!</h3>
                  <p className="text-stone-500 mb-6">Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.</p>
                  <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }}
                    className="btn-outline">Gửi tin nhắn khác</button>
                </div>
              ) : (
                <>
                  <h2 className="font-bold text-stone-800 text-xl mb-6">Gửi tin nhắn cho chúng tôi</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1.5">Họ và tên *</label>
                        <input className="input" required value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nguyễn Văn A" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1.5">Email *</label>
                        <input className="input" required type="email" value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="ban@email.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1.5">Số điện thoại</label>
                        <input className="input" type="tel" value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0901 234 567" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1.5">Chủ đề</label>
                        <select className="input" value={form.subject}
                          onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                          <option value="">-- Chọn chủ đề --</option>
                          <option>Tư vấn sản phẩm</option>
                          <option>Đặt hàng số lượng lớn</option>
                          <option>Khiếu nại / Đổi trả</option>
                          <option>Hợp tác kinh doanh</option>
                          <option>Khác</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">Nội dung *</label>
                      <textarea className="input resize-none" required rows={5} value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="Mô tả chi tiết câu hỏi hoặc yêu cầu của bạn..." />
                    </div>
                    <button type="submit" disabled={loading}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Gửi tin nhắn
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-stone-800 mb-3">Câu hỏi thường gặp</h2>
            <p className="text-stone-500">Không tìm thấy câu trả lời? Hãy liên hệ trực tiếp với chúng tôi.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-stone-50 transition-colors"
                >
                  <span className="font-semibold text-stone-800">{faq.q}</span>
                  <span className={`text-moss-600 text-xl font-light transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}