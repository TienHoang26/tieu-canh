import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `Bạn là trợ lý AI thân thiện của cửa hàng Tiểu Cảnh Việt - chuyên bán tiểu cảnh, terrarium, bonsai mini và phụ kiện trang trí thiên nhiên.

Nhiệm vụ của bạn:
1. Tư vấn sản phẩm phù hợp với nhu cầu và không gian của khách
2. Hướng dẫn cách chăm sóc cây cảnh, tiểu cảnh
3. Trả lời câu hỏi về đơn hàng, giao hàng, đổi trả
4. Gợi ý sản phẩm phù hợp

Thông tin cửa hàng:
- Chính sách giao hàng: Toàn quốc, phí giao hàng 30,000đ, miễn phí đơn từ 500,000đ
- Bảo hành: 7 ngày đổi trả nếu cây chết hoặc hư hỏng
- Thanh toán: COD, chuyển khoản
- Hotline: 0966.556.234 - 0982.424.345

Phong cách: Thân thiện, nhiệt tình, dùng emoji phù hợp 🌿, trả lời ngắn gọn súc tích bằng tiếng Việt.`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || messages.length === 0) {
      return NextResponse.json({ message: 'Không có tin nhắn' }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]?.content
    if (!lastMessage) {
      return NextResponse.json({ message: 'Tin nhắn trống' }, { status: 400 })
    }

    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ]

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // hoặc 'mixtral-8x7b-32768'
      messages: formattedMessages,
    })

    const text = completion.choices[0]?.message?.content ?? ''

    return NextResponse.json({ message: text })
  } catch (error) {
    console.error('Chi tiết lỗi:', error)
    return NextResponse.json({ message: 'Lỗi: ' + String(error) }, { status: 500 })
  }
}