export type UserRole = 'admin' | 'customer'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  phone: string | null
  address: string | null
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  sale_price: number | null
  stock: number
  category_id: string
  category?: Category
  images: string[]
  tags: string[]
  featured: boolean
  active: boolean
  created_at: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product?: Product
  quantity: number
  price: number
}

export interface Order {
  id: string
  user_id: string
  profile?: Profile
  status: OrderStatus
  total: number
  shipping_address: string
  shipping_name: string
  shipping_phone: string
  note: string | null
  items?: OrderItem[]
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}
