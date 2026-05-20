'use client'

import { useEffect, useRef } from 'react'

// ─── Kiểu dữ liệu cho mỗi lần bay ───────────────────────────────────────────
type FlyTarget = 'cart' | 'wishlist'

// ─── IDs để querySelector tìm icon đích ─────────────────────────────────────
export const CART_ICON_ID = 'navbar-cart-icon'
export const WISHLIST_ICON_ID = 'navbar-wishlist-icon'

// ─── Hàm chính: tạo element bay từ source → target ──────────────────────────
export function flyToTarget(
  sourceEl: HTMLElement,
  target: FlyTarget,
  emoji: string = '🛒'
) {
  const targetId = target === 'cart' ? CART_ICON_ID : WISHLIST_ICON_ID
  const targetEl = document.getElementById(targetId)
  if (!targetEl) return

  const sourceRect = sourceEl.getBoundingClientRect()
  const targetRect = targetEl.getBoundingClientRect()

  // Tạo element bay
  const flyer = document.createElement('div')
  flyer.innerHTML = emoji
  flyer.style.cssText = `
    position: fixed;
    z-index: 9999;
    font-size: 20px;
    pointer-events: none;
    left: ${sourceRect.left + sourceRect.width / 2 - 12}px;
    top: ${sourceRect.top + sourceRect.height / 2 - 12}px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: none;
    will-change: transform, opacity;
  `
  document.body.appendChild(flyer)

  // Tính delta
  const dx = targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2)
  const dy = targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2)

  // Animate bằng keyframes
  const animation = flyer.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.4}px, ${dy * 0.2 - 60}px) scale(1.3)`, opacity: 1, offset: 0.4 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0.6 },
    ],
    {
      duration: 650,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      fill: 'forwards',
    }
  )

  // Pulse icon đích khi flyer đến nơi
  animation.onfinish = () => {
    flyer.remove()
    targetEl.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.5)' },
        { transform: 'scale(1)' },
      ],
      { duration: 300, easing: 'ease-out' }
    )
  }
}