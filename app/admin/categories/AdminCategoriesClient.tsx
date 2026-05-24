'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Loader2, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { Category } from '@/types'

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

export default function AdminCategoriesClient({
  categories: initial, countMap,
}: { categories: Category[]; countMap: Record<string, number> }) {
  const [cats, setCats] = useState(initial)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', slug: '', description: '', image_url: '' })
    setShowModal(true)
  }

  const openEdit = (c: Category) => {
    setEditing(c)
    setForm({ name: c.name, slug: c.slug, description: c.description ?? '', image_url: c.image_url ?? '' })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const payload = { ...form, slug: form.slug || slugify(form.name) }
    if (editing) {
      const { data, error } = await supabase.from('categories').update(payload).eq('id', editing.id).select().single()
      if (error) toast.error(error.message)
      else { setCats(cs => cs.map(c => c.id === editing.id ? data : c)); toast.success('Đã cập nhật!'); setShowModal(false) }
    } else {
      const { data, error } = await supabase.from('categories').insert(payload).select().single()
      if (error) toast.error(error.message)
      else { setCats(cs => [...cs, data]); toast.success('Đã thêm danh mục!'); setShowModal(false) }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá danh mục này? Các sản phẩm thuộc danh mục sẽ không bị xoá nhưng sẽ không còn danh mục.')) return
    setDeleting(id)
    const supabase = createClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { setCats(cs => cs.filter(c => c.id !== id)); toast.success('Đã xoá!') }
    setDeleting(null)
  }

  const emojis: Record<string, string> = { zen: '🪨', terrarium: '🫙', 'Hon_non_bo': '🌳', 'da-cat': '💎', 'reu-cay-canh': '🌿' }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-stone-800">Danh mục</h1>
          <p className="text-stone-500 text-sm mt-0.5">{cats.length} danh mục</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Thêm danh mục
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map(c => (
          <div key={c.id} className="card p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="text-3xl">{emojis[c.slug] ?? '🌱'}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-stone-800">{c.name}</h3>
              <p className="text-xs text-stone-400 font-mono">{c.slug}</p>
              {c.description && <p className="text-sm text-stone-500 mt-1 line-clamp-2">{c.description}</p>}
              <div className="flex items-center gap-2 mt-2">
                <span className="badge bg-moss-100 text-moss-700">
                  <Tag className="w-3 h-3" /> {countMap[c.id] ?? 0} sản phẩm
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <button onClick={() => openEdit(c)}
                className="p-2 text-stone-400 hover:text-moss-700 hover:bg-moss-50 rounded-lg transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id}
                className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                {deleting === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-bold text-stone-800">{editing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-stone-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Tên danh mục *</label>
                <input className="input" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Slug</label>
                <input className="input font-mono text-sm" value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Mô tả</label>
                <textarea className="input resize-none" rows={2} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">URL ảnh đại diện</label>
                <input className="input" value={form.image_url}
                  onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://..." />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Huỷ</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? 'Lưu' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
