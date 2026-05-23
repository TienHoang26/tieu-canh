'use client'

import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, X, Loader2, Search, ToggleLeft, ToggleRight, Star, Package, Tag, AlertTriangle, TrendingUp, Filter, ChevronDown, Eye } from 'lucide-react'
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
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterStock, setFilterStock] = useState('')
  const [filterSpecial, setFilterSpecial] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [viewing, setViewing] = useState<Product | null>(null)

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = products.length
    const outOfStock = products.filter(p => p.stock === 0).length
    const activeAndInStock = products.filter(p => p.active && p.stock > 0).length
    const onSale = products.filter(p => p.sale_price && p.sale_price < p.price).length
    const featured = products.filter(p => p.featured).length
    return { total, activeAndInStock, outOfStock, onSale, featured }
  }, [products])

  // ── Filter ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = !filterCategory || p.category_id === filterCategory
    const matchStatus = !filterStatus || (filterStatus === 'active' ? p.active : !p.active)
    const matchStock = !filterStock ||
      (filterStock === 'out' && p.stock === 0) ||
      (filterStock === 'low' && p.stock > 0 && p.stock < 10) ||
      (filterStock === 'ok' && p.stock >= 10)
    const matchSpecial = !filterSpecial ||
      (filterSpecial === 'sale' && p.sale_price && p.sale_price < p.price) ||
      (filterSpecial === 'featured' && p.featured)
    return matchSearch && matchCat && matchStatus && matchStock && matchSpecial
  }), [products, search, filterCategory, filterStatus, filterStock, filterSpecial])

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true) }

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
    .replace(/đ/g, 'd')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()

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
      else { setProducts(ps => ps.map(p => p.id === editing.id ? data : p)); toast.success('Đã cập nhật sản phẩm!'); setShowModal(false) }
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select('*, category:categories(name,slug)').single()
      if (error) { toast.error(error.message) }
      else { setProducts(ps => [data, ...ps]); toast.success('Đã thêm sản phẩm!'); setShowModal(false) }
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

  const stockBadge = (stock: number) => {
    if (stock === 0) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Hết hàng</span>
    if (stock < 10) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">⚠ {stock}</span>
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">{stock}</span>
  }

  const hasFilter = search || filterCategory || filterStatus || filterStock || filterSpecial

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* ── Header + Button ── */}
      <div className="flex items-center justify-between">
        
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Thêm sản phẩm
        </button>
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Tổng sản phẩm',    value: stats.total,           icon: Package,       color: 'bg-blue-50 text-blue-600',     border: 'border-blue-100' },
          { label: 'Đang bán (có hàng)', value: stats.activeAndInStock, icon: TrendingUp,  color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
          { label: 'Hết hàng',          value: stats.outOfStock,      icon: AlertTriangle, color: 'bg-red-50 text-red-500',        border: 'border-red-100' },
          { label: 'Đang giảm giá',     value: stats.onSale,          icon: Tag,           color: 'bg-amber-50 text-amber-600',    border: 'border-amber-100' },
        ].map((s, i) => (
          <div key={i} className={cn('rounded-xl border p-4 flex items-center gap-3 bg-white', s.border)}>
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', s.color)}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-800 leading-none">{s.value}</p>
              <p className="text-xs text-stone-400 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl border border-stone-100 p-3 flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5 text-stone-400 text-sm px-1">
          <Filter className="w-3.5 h-3.5" /> Lọc:
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên..." className="w-full pl-8 pr-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-moss-400 bg-stone-50" />
        </div>

        {/* Category */}
        <div className="relative">
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="pl-3 pr-7 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-moss-400 bg-stone-50 appearance-none cursor-pointer">
            <option value="">Tất cả danh mục</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
        </div>

        {/* Status */}
        <div className="relative">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="pl-3 pr-7 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-moss-400 bg-stone-50 appearance-none cursor-pointer">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="inactive">Đã ẩn</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
        </div>

        {/* Stock */}
        <div className="relative">
          <select value={filterStock} onChange={e => setFilterStock(e.target.value)}
            className="pl-3 pr-7 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-moss-400 bg-stone-50 appearance-none cursor-pointer">
            <option value="">Tất cả kho</option>
            <option value="out">Hết hàng (0)</option>
            <option value="low">Sắp hết (&lt;10)</option>
            <option value="ok">Còn hàng (≥10)</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
        </div>

        {/* Special */}
        <div className="relative">
          <select value={filterSpecial} onChange={e => setFilterSpecial(e.target.value)}
            className="pl-3 pr-7 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-moss-400 bg-stone-50 appearance-none cursor-pointer">
            <option value="">Tất cả loại</option>
            <option value="sale">🏷 Đang Sale</option>
            <option value="featured">⭐ Nổi bật</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
        </div>

        {/* Clear */}
        {hasFilter && (
          <button onClick={() => { setSearch(''); setFilterCategory(''); setFilterStatus(''); setFilterStock(''); setFilterSpecial('') }}
            className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
            Xoá lọc ✕
          </button>
        )}

        <span className="ml-auto text-xs text-stone-400">{filtered.length} / {products.length} sản phẩm</span>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-stone-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-stone-50">
                <th className="text-center px-3 py-3 text-stone-500 font-semibold text-xs uppercase tracking-wide border-b border-r border-stone-100 w-12">STT</th>
                <th className="text-center px-5 py-3 text-stone-500 font-semibold text-xs uppercase tracking-wide border-b border-r border-stone-100">Sản phẩm</th>
                <th className="text-center px-4 py-3 text-stone-500 font-semibold text-xs uppercase tracking-wide border-b border-r border-stone-100 hidden md:table-cell">Danh mục</th>
                <th className="text-center px-4 py-3 text-stone-500 font-semibold text-xs uppercase tracking-wide border-b border-r border-stone-100">Giá</th>
                <th className="text-center px-4 py-3 text-stone-500 font-semibold text-xs uppercase tracking-wide border-b border-r border-stone-100 hidden sm:table-cell">Kho</th>
                <th className="text-center px-4 py-3 text-stone-500 font-semibold text-xs uppercase tracking-wide border-b border-r border-stone-100">Hiển thị</th>
                <th className="text-center px-4 py-3 text-stone-500 font-semibold text-xs uppercase tracking-wide border-b border-stone-100">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => (
                <tr key={p.id}
                  className={cn(
                    'border-b border-stone-100 hover:bg-moss-50/40 transition-colors',
                    idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'
                  )}>

                  {/* STT */}
                  <td className="px-3 py-3 text-center border-r border-stone-100">
                    <span className="text-xs text-stone-400 font-mono">{idx + 1}</span>
                  </td>

                  {/* Sản phẩm */}
                  <td className="px-5 py-3 border-r border-stone-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=100'}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-lg shrink-0 border border-stone-100 shadow-sm"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-stone-800 truncate max-w-[240px]">{p.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {p.featured && (
                            <span className="text-xs text-amber-600 flex items-center gap-0.5 font-medium">
                              <Star className="w-3 h-3 fill-current" /> Nổi bật
                            </span>
                          )}
                          {p.sale_price && p.sale_price < p.price && (
                            <span className="text-xs bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-medium">Sale</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Danh mục */}
                  <td className="px-4 py-3 border-r border-stone-100 text-center hidden md:table-cell">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 text-stone-600">
                      {(p.category as { name: string } | null)?.name ?? '—'}
                    </span>
                  </td>

                  {/* Giá */}
                  <td className="px-4 py-3 border-r border-stone-100 text-center">
                    <p className="font-semibold text-stone-800 whitespace-nowrap">{formatPrice(p.sale_price ?? p.price)}</p>
                    {p.sale_price && p.sale_price < p.price && (
                      <p className="text-xs text-stone-400 line-through whitespace-nowrap">{formatPrice(p.price)}</p>
                    )}
                  </td>

                  {/* Kho */}
                  <td className="px-4 py-3 border-r border-stone-100 text-center hidden sm:table-cell">
                    {stockBadge(p.stock)}
                  </td>

                  {/* Toggle */}
                  <td className="px-4 py-3 border-r border-stone-100 text-center">
                    <button onClick={() => toggleActive(p)} className="focus:outline-none inline-flex items-center justify-center">
                      {p.active
                        ? <ToggleRight className="w-7 h-7 text-moss-600 drop-shadow-sm" />
                        : <ToggleLeft className="w-7 h-7 text-stone-300" />}
                    </button>
                  </td>

                  {/* Thao tác */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setViewing(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Xem
                      </button>
                      <button
                        onClick={() => openEdit(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-moss-700 bg-moss-50 hover:bg-moss-100 border border-moss-200 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deleting === p.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2 text-stone-400">
                      <Package className="w-10 h-10 opacity-30" />
                      <p className="font-medium">Không tìm thấy sản phẩm</p>
                      <p className="text-xs">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

{/* ── View Modal ── */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewing(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-bold text-stone-800 text-lg">Chi tiết sản phẩm</h2>
              <button onClick={() => setViewing(null)} className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">

              {/* Ảnh */}
              {viewing.images && viewing.images.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {viewing.images.map((img, i) => (
                    <img key={i} src={img} alt={`${viewing.name} ${i + 1}`}
                      className="w-24 h-24 object-cover rounded-xl border border-stone-100 shadow-sm" />
                  ))}
                </div>
              )}

              {/* Tên + badges */}
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {viewing.featured && (
                    <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                      <Star className="w-3 h-3 fill-current" /> Nổi bật
                    </span>
                  )}
                  {viewing.active
                    ? <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">Đang bán</span>
                    : <span className="text-xs text-stone-500 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full font-medium">Đã ẩn</span>}
                  {viewing.sale_price && viewing.sale_price < viewing.price && (
                    <span className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full font-medium">Sale</span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-stone-800">{viewing.name}</h3>
                <p className="text-xs text-stone-400 mt-0.5 font-mono">slug: {viewing.slug}</p>
              </div>

              {/* Grid thông tin */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Danh mục', value: (viewing.category as { name: string } | null)?.name ?? '—' },
                  { label: 'Số lượng kho', value: String(viewing.stock) },
                  { label: 'Giá gốc', value: formatPrice(viewing.price) },
                  { label: 'Giá khuyến mãi', value: viewing.sale_price ? formatPrice(viewing.sale_price) : '—' },
                ].map(f => (
                  <div key={f.label} className="bg-stone-50 rounded-xl px-4 py-3 border border-stone-100">
                    <p className="text-xs text-stone-400 mb-0.5">{f.label}</p>
                    <p className="font-semibold text-stone-800 text-sm">{f.value}</p>
                  </div>
                ))}
              </div>

              {/* Mô tả */}
              {viewing.description && (
                <div className="bg-stone-50 rounded-xl px-4 py-3 border border-stone-100">
                  <p className="text-xs text-stone-400 mb-1">Mô tả</p>
                  <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{viewing.description}</p>
                </div>
              )}

              {/* Tags */}
              {viewing.tags && viewing.tags.length > 0 && (
                <div>
                  <p className="text-xs text-stone-400 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewing.tags.map((tag, i) => (
                      <span key={i} className="text-xs bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full border border-stone-200">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Button đóng + sửa */}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setViewing(null)} className="btn-outline flex-1">Đóng</button>
                <button onClick={() => { setViewing(null); openEdit(viewing) }} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Pencil className="w-4 h-4" /> Chỉnh sửa
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
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