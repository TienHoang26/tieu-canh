'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Loader2, Search, ToggleLeft, ToggleRight, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Product, Category } from '@/types'

const EMPTY_FORM = {
  name: '', slug: '', description: '', price: '', sale_price: '',
  stock: '', category_id: '', images: '', tags: '', featured: false, active: true,
}

export default function AdminProductsClient({
  products: initial, categories,
}: { products: Product[]; categories: Category[] }) {
  const [products, setProducts] = useState(initial)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name, slug: p.slug, description: p.description,
      price: String(p.price), sale_price: String(p.sale_price ?? ''),
      stock: String(p.stock), category_id: p.category_id ?? '',
      images: p.images?.join('\n') ?? '', tags: p.tags?.join(', ') ?? '',
      featured: p.featured, active: p.active,
    })
    setShowModal(true)
  }

  const slugify = (s: string) => s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      price: Number(form.price),
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      stock: Number(form.stock),
      category_id: form.category_id || null,
      images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      featured: form.featured,
      active: form.active,
    }
    if (editing) {
      const { data, error } = await supabase.from('products').update(payload).eq('id', editing.id).select('*, category:categories(name,slug)').single()
      if (error) { toast.error(error.message) }
      else {
        setProducts(ps => ps.map(p => p.id === editing.id ? data : p))
        toast.success('Đã cập nhật sản phẩm!')
        setShowModal(false)
      }
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select('*, category:categories(name,slug)').single()
      if (error) { toast.error(error.message) }
      else {
        setProducts(ps => [data, ...ps])
        toast.success('Đã thêm sản phẩm!')
        setShowModal(false)
      }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá sản phẩm này?')) return
    setDeleting(id)
    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) { toast.error(error.message) }
    else { setProducts(ps => ps.filter(p => p.id !== id)); toast.success('Đã xoá!') }
    setDeleting(null)
  }

  const toggleActive = async (p: Product) => {
    const supabase = createClient()
    const { error } = await supabase.from('products').update({ active: !p.active }).eq('id', p.id)
    if (!error) setProducts(ps => ps.map(x => x.id === p.id ? { ...x, active: !x.active } : x))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-stone-800">Sản phẩm</h1>
          <p className="text-stone-500 text-sm mt-0.5">{products.length} sản phẩm tổng cộng</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Thêm sản phẩm
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm sản phẩm..." className="input pl-10 py-2.5 text-sm" />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="text-left px-5 py-3 text-stone-500 font-medium">Sản phẩm</th>
                <th className="text-left px-5 py-3 text-stone-500 font-medium hidden md:table-cell">Danh mục</th>
                <th className="text-left px-5 py-3 text-stone-500 font-medium">Giá</th>
                <th className="text-left px-5 py-3 text-stone-500 font-medium hidden sm:table-cell">Kho</th>
                <th className="text-left px-5 py-3 text-stone-500 font-medium">Hiển thị</th>
                <th className="text-right px-5 py-3 text-stone-500 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=100'}
                        alt={p.name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                      <div>
                        <p className="font-medium text-stone-800 line-clamp-1">{p.name}</p>
                        {p.featured && (
                          <span className="text-xs text-earth-600 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" /> Nổi bật
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-stone-500 hidden md:table-cell">
                    {(p.category as { name: string } | null)?.name ?? '—'}
                  </td>
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-semibold text-stone-800">{formatPrice(p.sale_price ?? p.price)}</p>
                      {p.sale_price && <p className="text-xs text-stone-400 line-through">{formatPrice(p.price)}</p>}
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className={cn('font-medium', p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-orange-500' : 'text-stone-700')}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleActive(p)} className="focus:outline-none">
                      {p.active
                        ? <ToggleRight className="w-6 h-6 text-moss-600" />
                        : <ToggleLeft className="w-6 h-6 text-stone-300" />}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)}
                        className="p-2 text-stone-500 hover:text-moss-700 hover:bg-moss-50 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                        className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        {deleting === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-stone-400">Không tìm thấy sản phẩm</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-bold text-stone-800 text-lg">{editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Tên sản phẩm *</label>
                  <input className="input" required value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Slug</label>
                  <input className="input" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Danh mục</label>
                  <select className="input" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Giá gốc (VNĐ) *</label>
                  <input className="input" required type="number" min="0" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Giá khuyến mãi</label>
                  <input className="input" type="number" min="0" value={form.sale_price}
                    onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))} placeholder="Để trống nếu không giảm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Số lượng kho *</label>
                  <input className="input" required type="number" min="0" value={form.stock}
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Tags (cách nhau bằng dấu phẩy)</label>
                  <input className="input" value={form.tags}
                    onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="zen, đá, rêu" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Mô tả</label>
                  <textarea className="input resize-none" rows={3} value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">URL ảnh (mỗi dòng một URL)</label>
                  <textarea className="input resize-none font-mono text-xs" rows={3} value={form.images}
                    onChange={e => setForm(f => ({ ...f, images: e.target.value }))}
                    placeholder="https://images.unsplash.com/..." />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.featured}
                      onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                      className="w-4 h-4 accent-moss-600" />
                    <span className="text-sm font-medium text-stone-700">Sản phẩm nổi bật</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.active}
                      onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                      className="w-4 h-4 accent-moss-600" />
                    <span className="text-sm font-medium text-stone-700">Đang bán</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Huỷ</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
