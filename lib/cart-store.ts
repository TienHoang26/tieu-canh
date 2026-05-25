import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem, Product } from '@/types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: () => number
  count: () => number
}

// ✅ Thay vì export useCart trực tiếp, tạo store theo userId
function createCartStore(userId: string) {
  return create<CartStore>()(
    persist(
      (set, get) => ({
        items: [],
        addItem: (product, quantity = 1) => {
          const items = get().items
          const existing = items.find(i => i.product.id === product.id)
          if (existing) {
            set({
              items: items.map(i =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            })
          } else {
            set({ items: [...items, { product, quantity }] })
          }
        },
        removeItem: (productId) =>
          set({ items: get().items.filter(i => i.product.id !== productId) }),
        updateQuantity: (productId, quantity) => {
          if (quantity <= 0) {
            get().removeItem(productId)
            return
          }
          set({
            items: get().items.map(i =>
              i.product.id === productId ? { ...i, quantity } : i
            ),
          })
        },
        clearCart: () => set({ items: [] }),
        total: () =>
          get().items.reduce(
            (sum, i) => sum + (i.product.sale_price ?? i.product.price) * i.quantity,
            0
          ),
        count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      }),
      {
        name: `tieu-canh-cart-${userId}`, // ✅ DÒNG DUY NHẤT THAY ĐỔI SO VỚI CŨ
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
}

// ✅ Cache store để không tạo lại mỗi lần render
const storeCache = new Map<string, ReturnType<typeof createCartStore>>()

export function getCartStore(userId: string) {
  if (!storeCache.has(userId)) {
    storeCache.set(userId, createCartStore(userId))
  }
  return storeCache.get(userId)!
}

// ✅ Xóa cache khi logout (gọi hàm này trong signOut handler)
export function clearCartCache() {
  storeCache.clear()
}