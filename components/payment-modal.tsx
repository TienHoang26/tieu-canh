'use client'

import { useState, useEffect } from 'react'
import {
  X, Copy, Check, QrCode, Banknote, Smartphone,
  Wallet, CreditCard, ExternalLink, CheckCircle2, Clock,
} from 'lucide-react'
import toast from 'react-hot-toast'

const BANK_INFO = {
  bank_name:      'MB Bank',
  account_number: '0377733156',
  account_name:   'NGUYEN TIEN HOANG',
  branch:         'Chi nhánh Hồ Chí Minh',
  bin:            '970422',
}
const MOMO_INFO = {
  phone:    '0825981383',
  name:     'NGUYEN TIEN HOANG',
  qr_image: '/QRmomo.jpg',
}
const ZALOPAY_INFO = {
  phone:    '0825981383',
  name:     'NGUYEN TIEN HOANG',
  qr_image: '/QRzalo.jpg',
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToCOD?: () => void
  paymentMethod: string
  orderId: string
  total: number
  orderCode: string
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Đã sao chép!')
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-moss-50 hover:bg-moss-100 text-moss-700 text-xs font-medium transition-all shrink-0">
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Đã chép' : 'Sao chép'}
    </button>
  )
}

function InfoRow({ label, value, copy, highlight, important, labelColor = 'text-sky-600' }: {
  label: string; value: string; copy?: boolean; highlight?: boolean; important?: boolean; labelColor?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`text-xs shrink-0 ${labelColor}`}>{label}:</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-sm font-semibold truncate ${highlight ? 'text-red-500' : important ? 'px-2 py-0.5 rounded-lg font-bold' : 'text-stone-800'}`}
          style={important ? { background: 'rgba(0,0,0,0.07)' } : undefined}>
          {value}
        </span>
        {copy && <CopyButton text={value} />}
      </div>
    </div>
  )
}

function StaticQRImage({ src, alt, fallbackText }: { src: string; alt: string; fallbackText: string }) {
  const [error, setError] = useState(false)
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-white rounded-2xl p-3 border-2 border-stone-100 shadow-sm w-[216px] h-[216px] flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-center px-4">
            <QrCode className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-xs text-stone-400 leading-snug">{fallbackText}</p>
          </div>
        ) : (
          <img src={src} alt={alt} className="w-full h-full object-contain rounded-xl" onError={() => setError(true)} />
        )}
      </div>
      <p className="text-xs text-stone-400 flex items-center gap-1">
        <QrCode className="w-3.5 h-3.5" /> Quét mã bằng app để thanh toán
      </p>
    </div>
  )
}

function VietQRImage({ total, orderCode }: { total: number; orderCode: string }) {
  const description = `TTDH ${orderCode}`
  const url = `https://img.vietqr.io/image/${BANK_INFO.bin}-${BANK_INFO.account_number}-compact2.png` +
    `?amount=${total}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(BANK_INFO.account_name)}`
  const [error, setError] = useState(false)
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-white rounded-2xl p-3 border-2 border-stone-100 shadow-sm w-[216px] h-[216px] flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-center px-4">
            <QrCode className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-xs text-stone-400 leading-snug">Không tải được QR. Vui lòng chuyển khoản theo thông tin bên dưới.</p>
          </div>
        ) : (
          <img src={url} alt="MB Bank VietQR" className="w-full h-full object-contain rounded-xl" onError={() => setError(true)} />
        )}
      </div>
      <p className="text-xs text-stone-400 flex items-center gap-1">
        <QrCode className="w-3.5 h-3.5" /> Quét bằng app ngân hàng bất kỳ
      </p>
    </div>
  )
}

function CODPanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-100 flex items-center justify-center">
          <Banknote className="w-9 h-9 text-amber-500" />
        </div>
      </div>
      <div className="text-center">
        <p className="font-bold text-stone-800 text-lg">Thanh toán khi nhận hàng</p>
        <p className="text-stone-500 text-sm mt-1">Chuẩn bị tiền mặt khi shipper giao hàng đến bạn</p>
      </div>
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-3">
        {[
          { icon: CheckCircle2, text: 'Đơn hàng sẽ được xử lý ngay sau khi xác nhận' },
          { icon: Clock,        text: 'Thời gian giao hàng dự kiến: 2–5 ngày làm việc' },
          { icon: CheckCircle2, text: 'Vui lòng chuẩn bị đúng số tiền khi nhận hàng' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-2">
            <Icon className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">{text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function BankTransferPanel({ total, orderCode }: { total: number; orderCode: string }) {
  const description = `TTDH ${orderCode}`
  const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)
  return (
    <div className="space-y-4">
      <VietQRImage total={total} orderCode={orderCode} />
      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 space-y-3">
        <p className="text-xs font-bold text-sky-700 uppercase tracking-wider">Thông tin chuyển khoản</p>
        <InfoRow label="Ngân hàng"     value={`${BANK_INFO.bank_name} — ${BANK_INFO.branch}`} labelColor="text-sky-600" />
        <InfoRow label="Số tài khoản"  value={BANK_INFO.account_number} copy labelColor="text-sky-600" />
        <InfoRow label="Chủ tài khoản" value={BANK_INFO.account_name} labelColor="text-sky-600" />
        <InfoRow label="Số tiền"       value={vnd} copy highlight labelColor="text-sky-600" />
        <InfoRow label="Nội dung CK"   value={description} copy important labelColor="text-sky-600" />
      </div>
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
        <p className="text-xs text-orange-700 font-medium">
          ⚠️ Nhập <strong>đúng nội dung chuyển khoản</strong> để đơn hàng được xác nhận tự động.
        </p>
      </div>
    </div>
  )
}

function MomoPanel({ total, orderCode }: { total: number; orderCode: string }) {
  const description = `Thanh toan DH ${orderCode}`
  const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)
  return (
    <div className="space-y-4">
      <StaticQRImage src={MOMO_INFO.qr_image} alt="Momo QR" fallbackText="Đặt ảnh QR Momo vào public/QRmomo.jpg" />
      <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 space-y-3">
        <p className="text-xs font-bold text-pink-700 uppercase tracking-wider">Thông tin Momo</p>
        <InfoRow label="Số điện thoại" value={MOMO_INFO.phone} copy labelColor="text-pink-600" />
        <InfoRow label="Tên tài khoản" value={MOMO_INFO.name} labelColor="text-pink-600" />
        <InfoRow label="Số tiền"       value={vnd} copy highlight labelColor="text-pink-600" />
        <InfoRow label="Nội dung"      value={description} copy important labelColor="text-pink-600" />
      </div>
      <div className="bg-pink-50 border border-pink-100 rounded-xl p-3">
        <p className="text-xs text-pink-700 font-medium">
          📌 Quét QR → ứng dụng Momo tự điền số tài khoản. Bạn chỉ cần nhập số tiền và nội dung.
        </p>
      </div>
      <a href={`momo://app?action=payApp&phone=${MOMO_INFO.phone}&amount=${total}&comment=${encodeURIComponent(description)}`}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold text-sm shadow-md shadow-pink-200 hover:shadow-lg transition-all">
        <ExternalLink className="w-4 h-4" /> Mở ứng dụng Momo
      </a>
    </div>
  )
}

function ZaloPayPanel({ total, orderCode }: { total: number; orderCode: string }) {
  const description = `Thanh toan DH ${orderCode}`
  const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)
  return (
    <div className="space-y-4">
      <StaticQRImage src={ZALOPAY_INFO.qr_image} alt="ZaloPay QR" fallbackText="Đặt ảnh QR ZaloPay vào public/QRzalo.jpg" />
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
        <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Thông tin ZaloPay</p>
        <InfoRow label="Số điện thoại" value={ZALOPAY_INFO.phone} copy labelColor="text-blue-600" />
        <InfoRow label="Tên tài khoản" value={ZALOPAY_INFO.name} labelColor="text-blue-600" />
        <InfoRow label="Số tiền"       value={vnd} copy highlight labelColor="text-blue-600" />
        <InfoRow label="Nội dung"      value={description} copy important labelColor="text-blue-600" />
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
        <p className="text-xs text-blue-700 font-medium">
          📌 Quét QR → ứng dụng ZaloPay tự điền số tài khoản. Bạn chỉ cần nhập số tiền và nội dung.
        </p>
      </div>
      <a href={`zalopay://app?phone=${ZALOPAY_INFO.phone}&amount=${total}&comment=${encodeURIComponent(description)}`}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm shadow-md shadow-blue-200 hover:shadow-lg transition-all">
        <ExternalLink className="w-4 h-4" /> Mở ứng dụng ZaloPay
      </a>
    </div>
  )
}

export default function PaymentModal({
  isOpen, onClose, onSwitchToCOD, paymentMethod, orderId, total, orderCode,
}: PaymentModalProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isOpen) setTimeout(() => setShow(true), 10)
    else setShow(false)
  }, [isOpen])

  if (!isOpen) return null

  const titles: Record<string, string> = {
    cod:           'Thanh toán khi nhận hàng',
    bank_transfer: 'Chuyển khoản MB Bank',
    momo:          'Thanh toán qua Momo',
    vnpay:         'Thanh toán qua ZaloPay',
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 ${
        show ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent pointer-events-none'
      }`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl transition-all duration-300 max-h-[92vh] overflow-y-auto ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>

        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <div>
            <p className="text-xs text-stone-400 font-medium">Đơn hàng #{orderCode}</p>
            <p className="font-bold text-stone-800 text-base">{titles[paymentMethod]}</p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {paymentMethod === 'cod'           && <CODPanel />}
          {paymentMethod === 'bank_transfer' && <BankTransferPanel total={total} orderCode={orderCode} />}
          {paymentMethod === 'momo'          && <MomoPanel total={total} orderCode={orderCode} />}
          {paymentMethod === 'vnpay'         && <ZaloPayPanel total={total} orderCode={orderCode} />}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 space-y-2">
          <button onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-[#5a6e3a] hover:bg-[#4a5c2e] text-white font-bold text-sm tracking-wider transition-colors">
            Đã thanh toán xong ✓
          </button>
          {onSwitchToCOD && paymentMethod !== 'cod' && (
            <button onClick={onSwitchToCOD}
              className="w-full py-3 rounded-2xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors">
              Đổi sang thanh toán khi nhận hàng (COD)
            </button>
          )}
          <p className="text-center text-xs text-stone-400">
            Đơn hàng được xác nhận sau khi chúng tôi nhận được thanh toán
          </p>
        </div>
      </div>
    </div>
  )
}