import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Khởi tạo Supabase với service role (có quyền update mọi row)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SEPAY_API_KEY = process.env.SEPAY_WEBHOOK_API_KEY ?? 'sepay_tieucanh_2024'

export async function POST(req: NextRequest) {
  try {
    // Xác thực API Key từ SePay
    const authHeader = req.headers.get('Authorization') ?? ''
    const apiKey = authHeader.replace('Apikey ', '').trim()

    //if (apiKey !== SEPAY_API_KEY) {
      //console.error('[SePay] Unauthorized webhook call')
      //return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    //}

    const body = await req.json()
    console.log('[SePay] Webhook received:', JSON.stringify(body))

    // SePay gửi nội dung giao dịch trong transferDescription hoặc content
    const description: string = (
      body.transferDescription ??
      body.content ??
      body.description ??
      ''
    ).toUpperCase()

    console.log('[SePay] Transaction description:', description)

    // Tìm mã đơn hàng trong nội dung — format: TTDH + 8 ký tự
    // Ví dụ: "TTDH A1B2C3D4" hoặc "THANH TOAN DON HANG TTDH A1B2C3D4"
    const match = description.match(/DH\s*([A-Z0-9]{8})/i)

    if (!match) {
      console.log('[SePay] No order code found in description:', description)
      // Vẫn trả 200 để SePay không retry
      return NextResponse.json({ message: 'No order code found' }, { status: 200 })
    }

    const orderCode = match[1].toUpperCase()
    console.log('[SePay] Order code extracted:', orderCode)

    // Tìm đơn hàng có id bắt đầu bằng orderCode (8 ký tự đầu của UUID)
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id, total, payment_status')
      .ilike('id', `${orderCode}%`)
      .limit(1)

    if (fetchError || !orders || orders.length === 0) {
      console.error('[SePay] Order not found for code:', orderCode)
      return NextResponse.json({ message: 'Order not found' }, { status: 200 })
    }

    const order = orders[0]
    console.log('[SePay] Found order:', order.id, 'current status:', order.payment_status)

    // Nếu đã paid rồi thì bỏ qua
    if (order.payment_status === 'paid') {
      console.log('[SePay] Order already paid, skipping')
      return NextResponse.json({ message: 'Already paid' }, { status: 200 })
    }

    // Cập nhật payment_status = 'paid'
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'confirmed', // tự động xác nhận đơn luôn
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('[SePay] Failed to update order:', updateError)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    console.log('[SePay] ✅ Order', order.id, 'marked as paid!')
    return NextResponse.json({ message: 'OK', orderId: order.id }, { status: 200 })

  } catch (err) {
    console.error('[SePay] Webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}