'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Loader2, Eye, EyeOff, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  tags: string[]
  published: boolean
  views: number
  created_at: string
}

const EMPTY: Omit<Post, 'id' | 'views' | 'created_at'> = {
  title: '', slug: '', excerpt: '', content: '', cover_image: '', tags: [], published: false,
}

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

export default function AdminBlogClient({ posts: initial }: { posts: Post[] }) {
  const [posts, setPosts] = useState(initial)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Post | null>(null)
  const [form, setForm] = useState({ ...EMPTY, tags: '' as unknown as string[] })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [preview, setPreview] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY, tags: '' as unknown as string[] })
    setPreview(false)
    setShowModal(true)
  }

  const openEdit = (p: Post) => {
    setEditing(p)
    setForm({ ...p, tags: p.tags?.join(', ') as unknown as string[] })
    setPreview(false)
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const payload = {
      ...form,
      slug: (form.slug as string) || slugify(form.title as string),
      tags: typeof form.tags === 'string'
        ? (form.tags as string).split(',').map((s: string) => s.trim()).filter(Boolean)
        : form.tags,
      updated_at: new Date().toISOString(),
    }
    if (editing) {
      const { data, error } = await supabase.from('blog_posts').update(payload).eq('id', editing.id).select().single()
      if (error) toast.error(error.message)
      else { setPosts(ps => ps.map(p => p.id === editing.id ? data : p)); toast.success('Đã cập nhật!'); setShowModal(false) }
    } else {
      const { data, error } = await supabase.from('blog_posts').insert(payload).select().single()
      if (error) toast.error(error.message)
      else { setPosts(ps => [data, ...ps]); toast.success('Đã tạo bài viết!'); setShowModal(false) }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá bài viết này?')) return
    setDeleting(id)
    const supabase = createClient()
    const { error } = await supabase.from('blog_posts').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { setPosts(ps => ps.filter(p => p.id !== id)); toast.success('Đã xoá!') }
    setDeleting(null)
  }

  const togglePublish = async (p: Post) => {
    const supabase = createClient()
    const { error } = await supabase.from('blog_posts').update({ published: !p.published }).eq('id', p.id)
    if (!error) setPosts(ps => ps.map(x => x.id === p.id ? { ...x, published: !x.published } : x))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-stone-800">Blog</h1>
          <p className="text-stone-500 text-sm mt-0.5">{posts.length} bài viết</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Viết bài mới
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="text-left px-5 py-3 text-stone-500 font-medium">Tiêu đề</th>
                <th className="text-left px-5 py-3 text-stone-500 font-medium hidden md:table-cell">Tags</th>
                <th className="text-left px-5 py-3 text-stone-500 font-medium hidden sm:table-cell">Lượt xem</th>
                <th className="text-left px-5 py-3 text-stone-500 font-medium">Trạng thái</th>
                <th className="text-right px-5 py-3 text-stone-500 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {p.cover_image && (
                        <img src={p.cover_image} alt="" className="w-10 h-10 object-cover rounded-lg shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-stone-800 line-clamp-1">{p.title}</p>
                        <p className="text-xs text-stone-400">{formatDate(p.created_at)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.tags?.slice(0, 2).map(t => (
                        <span key={t} className="text-xs bg-moss-50 text-moss-600 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-stone-500 hidden sm:table-cell">{p.views ?? 0}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => togglePublish(p)}
                      className={cn('badge cursor-pointer transition-colors', p.published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-stone-100 text-stone-500 hover:bg-stone-200')}>
                      {p.published ? <><Eye className="w-3 h-3" /> Đã đăng</> : <><EyeOff className="w-3 h-3" /> Nháp</>}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)}
                        className="p-2 text-stone-400 hover:text-moss-700 hover:bg-moss-50 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        {deleting === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-stone-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />Chưa có bài viết nào
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-3xl shadow-2xl mb-8">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-bold text-stone-800 text-lg">{editing ? 'Chỉnh sửa bài viết' : 'Bài viết mới'}</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setPreview(!preview)}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', preview ? 'bg-moss-100 text-moss-700' : 'text-stone-500 hover:bg-stone-100')}>
                  <Eye className="w-4 h-4" /> Preview
                </button>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {preview ? (
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {(form as { cover_image?: string }).cover_image && (
                  <img src={(form as { cover_image?: string }).cover_image} alt="" className="w-full h-48 object-cover rounded-xl mb-4" />
                )}
                <h2 className="font-display text-2xl font-bold text-stone-800 mb-2">{(form as { title: string }).title || 'Tiêu đề bài viết'}</h2>
                {(form as { excerpt?: string }).excerpt && <p className="text-stone-500 italic border-l-4 border-moss-400 pl-4 mb-4">{(form as { excerpt?: string }).excerpt}</p>}
                <div className="prose text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                  {(form as { content: string }).content || 'Nội dung bài viết...'}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Tiêu đề *</label>
                    <input className="input" required value={(form as { title: string }).title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: slugify(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Slug</label>
                    <input className="input font-mono text-sm" value={(form as { slug: string }).slug}
                      onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Tags (cách nhau bằng dấu phẩy)</label>
                    <input className="input" value={form.tags as unknown as string}
                      onChange={e => setForm(f => ({ ...f, tags: e.target.value as unknown as string[] }))}
                      placeholder="zen, hướng dẫn, bonsai" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">URL ảnh bìa</label>
                    <input className="input" value={(form as { cover_image?: string }).cover_image ?? ''}
                      onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))}
                      placeholder="https://images.unsplash.com/..." />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Tóm tắt</label>
                    <textarea className="input resize-none" rows={2} value={(form as { excerpt?: string }).excerpt ?? ''}
                      onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                      placeholder="Mô tả ngắn gọn về bài viết..." />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Nội dung *</label>
                    <textarea className="input resize-none font-mono text-sm" required rows={12}
                      value={(form as { content: string }).content}
                      onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                      placeholder="## Tiêu đề H2&#10;### Tiêu đề H3&#10;- Dòng list&#10;&#10;Đoạn văn bình thường..." />
                    <p className="text-xs text-stone-400 mt-1">Hỗ trợ: ## H2, ### H3, - list item, **bold**</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="published" checked={(form as { published: boolean }).published}
                      onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                      className="w-4 h-4 accent-moss-600" />
                    <label htmlFor="published" className="text-sm font-medium text-stone-700 cursor-pointer">
                      Đăng công khai ngay
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Huỷ</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editing ? 'Lưu thay đổi' : 'Đăng bài'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
