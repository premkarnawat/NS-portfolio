'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { uploadFile } from '@/lib/storage'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit2, Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import type { Highlight } from '@/types/supabase'

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  link: z.string().url().optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

export default function AdminHighlights() {
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Highlight | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const fetchHighlights = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('highlights').select('*').order('created_at', { ascending: false })
    setHighlights(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchHighlights() }, [])

  const openNew = () => {
    setEditItem(null)
    setImageUrl(null)
    reset({ title: '', link: '' })
    setShowForm(true)
  }

  const openEdit = (h: Highlight) => {
    setEditItem(h)
    setImageUrl(h.cover_image)
    reset({ title: h.title, link: h.link || '' })
    setShowForm(true)
  }

  const onSubmit = async (data: FormData) => {
    const supabase = createClient()
    const payload = { ...data, cover_image: imageUrl }
    const { error } = editItem
      ? await supabase.from('highlights').update(payload).eq('id', editItem.id)
      : await supabase.from('highlights').insert([payload])
    if (error) toast.error(error.message)
    else {
      toast.success(editItem ? 'Updated!' : 'Created!')
      setShowForm(false)
      fetchHighlights()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this highlight?')) return
    const supabase = createClient()
    await supabase.from('highlights').delete().eq('id', id)
    toast.success('Deleted')
    fetchHighlights()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadFile('highlight-images', file)
    if (url) setImageUrl(url)
    else toast.error('Upload failed')
    setUploading(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Highlights</h2>
        <motion.button whileTap={{ scale: 0.95 }} onClick={openNew}
          className="btn-gradient flex items-center gap-2 text-sm" style={{ padding: '8px 16px' }}>
          <Plus size={16} /> New Highlight
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl p-5 mb-6" style={{ background: '#141920', border: '1px solid #252d3d' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">{editItem ? 'Edit Highlight' : 'New Highlight'}</h3>
              <button onClick={() => setShowForm(false)}><X size={18} color="#6b7280" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div>
                {imageUrl && (
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-2">
                    <Image src={imageUrl} alt="Preview" width={64} height={64} className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="flex items-center gap-2 text-sm cursor-pointer w-fit px-3 py-2 rounded-xl"
                  style={{ background: '#252d3d', color: '#9ca3af' }}>
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploading ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#9ca3af' }}>Title *</label>
                <input {...register('title')} className="input-dark" placeholder="Highlight title" />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#9ca3af' }}>Link (optional)</label>
                <input {...register('link')} className="input-dark" placeholder="https://..." />
              </div>
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={isSubmitting} className="btn-gradient flex-1">
                  {isSubmitting ? 'Saving...' : 'Save Highlight'}
                </motion.button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-sm" style={{ background: '#252d3d', color: '#9ca3af' }}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin" color="#6366f1" /></div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {highlights.map((h, i) => (
            <motion.div key={h.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden" style={{ background: '#252d3d' }}>
                {h.cover_image ? (
                  <Image src={h.cover_image} alt={h.title} width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white">
                    {h.title[0]}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium max-w-[64px] truncate text-center">{h.title}</span>
              <div className="flex gap-1">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => openEdit(h)}
                  className="p-1.5 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <Edit2 size={11} color="#6366f1" />
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(h.id)}
                  className="p-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
                  <Trash2 size={11} color="#ef4444" />
                </motion.button>
              </div>
            </motion.div>
          ))}
          {!highlights.length && (
            <p className="text-sm" style={{ color: '#6b7280' }}>No highlights yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
