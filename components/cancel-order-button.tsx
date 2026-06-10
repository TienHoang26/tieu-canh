'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [cancelModal, setCancelModal] = useState(false)
  const [cancelling, setCancelling]   = useState(false)

  const handleCancelOrder = async () => {
  setCancelling(true)
  const supabase = createClient()

  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .select()

  console.log('orderId:', orderId)
  console.log('data:', data)
  console.log('error:', error)

  if (error) {
    toast.error('Hủy đơn thất bại, vui lòng thử lại!')
  } else {
    toast.success('Đã hủy đơn hàng!')
    setCancelModal(false)
    window.location.reload()
  }
  setCancelling(false)
}

  return (
    <>
      <button
        onClick={() => setCancelModal(true)}
        className="px-4 py-2 rounded-xl border-2 border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition"
      >
        Hủy đơn
      </button>

      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-extrabold text-stone-800 mb-2">Xác nhận hủy đơn?</h3>
            <p className="text-sm text-stone-500 mb-6">
              Đơn hàng sẽ bị hủy và không thể khôi phục lại. Bạn có chắc chắn không?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal(false)}
                className="flex-1 py-3 rounded-2xl border-2 border-stone-200 text-stone-600 font-semibold text-sm hover:bg-stone-50 transition"
              >
                Không, giữ lại
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                Hủy đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}