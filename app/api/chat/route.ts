import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
- Hotline: 0901 234 567

Phong cách: Thân thiện, nhiệt tình, dùng emoji phù hợp 🌿, trả lời ngắn gọn súc tích bằng tiếng Việt.`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ message: text })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ message: 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau!' }, { status: 500 })
  }
}
