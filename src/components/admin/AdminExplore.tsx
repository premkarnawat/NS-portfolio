'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { uploadFile } from '@/lib/storage'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit2, Upload, X, Loader2, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import type { ExploreLink } from '@/types/supabase'

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  link: z.string().url('Valid URL required'),
})
type FormData = z.infer<typeof schema>

export default function AdminExplore() {
  const [links, setLinks] = useState<ExploreLink[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<ExploreLink | null>(null)
  const [iconUrl, setIconUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const fetchLinks = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('explore_links').select('*').order('created_at', { ascending: false })
    setLinks(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchLinks() }, [])

  const openNew = () => {
    setEditItem(null)
    setIconUrl(null)
    reset({ title: '', link: '' })
    setShowForm(true)
  }

  const openEdit = (item: ExploreLink) => {
    setEditItem(item)
    setIconUrl(item.icon_image)
    reset({ title: item.title, link: item.link })
    setShowForm(true)
  }

  const onSubmit = async (data: FormData) => {
    const supabase = createClient()
    const payload = { ...data, icon_image: iconUrl }
    const { error } = editItem
      ? await supabase.from('explore_links').update(payload).eq('id', editItem.id)
      : await supabase.from('explore_links').insert([payload])
    if (error) toast.error(error.message)
    else {
      toast.success(editItem ? 'Updated!' : 'Link added!')
      setShowForm(false)
      fetchLinks()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this link?')) return
    const supabase = createClient()
    await supabase.from('explore_links').delete().eq('id', id)
    toast.success('Deleted')
    fetchLinks()
  }

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadFile('explore-icons', file)
    if (url) setIconUrl(url)
    else toast.error('Upload failed')
    setUploading(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Explore Links</h2>
        <motion.button whileTap={{ scale: 0.95 }} onClick={openNew}
          className="btn-gradient flex items-center gap-2 text-sm" style={{ padding: '8px 16px' }}>
          <Plus size={16} /> Add Link
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl p-5 mb-6" style={{ background: '#141920', border: '1px solid #252d3d' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">{editItem ? 'Edit Link' : 'New Explore Link'}</h3>
              <button onClick={() => setShowForm(false)}><X size={18} color="#6b7280" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                  style={{ background: '#252d3d' }}>
                  {iconUrl ? (
                    <Image src={iconUrl} alt="Icon" width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={18} color="#6b7280" />
                  )}
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-xl"
                  style={{ background: '#252d3d', color: '#9ca3af' }}>
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploading ? 'Uploading...' : 'Upload Icon'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleIconUpload} />
                </label>
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#9ca3af' }}>Title *</label>
                <input {...register('title')} className="input-dark" placeholder="LinkedIn, Behance..." />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#9ca3af' }}>URL *</label>
                <input {...register('link')} className="input-dark" placeholder="https://linkedin.com/in/..." />
                {errors.link && <p className="text-red-400 text-xs mt-1">{errors.link.message}</p>}
              </div>
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={isSubmitting} className="btn-gradient flex-1">
                  {isSubmitting ? 'Saving...' : 'Save Link'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {links.map((item, i) => (
            <motion.div key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: '#141920', border: '1px solid #252d3d' }}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                style={{ background: '#252d3d' }}>
                {item.icon_image ? (
                  <Image src={item.icon_image} alt={item.title} width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold" style={{ color: '#6366f1' }}>
                    {item.title[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-white">{item.title}</p>
                <p className="text-xs truncate" style={{ color: '#6b7280' }}>{item.link}</p>
              </div>
              <div className="flex gap-1">
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="p-1.5">
                  <ExternalLink size={13} color="#6b7280" />
                </a>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => openEdit(item)}
                  className="p-1.5 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <Edit2 size={13} color="#6366f1" />
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
                  <Trash2 size={13} color="#ef4444" />
                </motion.button>
              </div>
            </motion.div>
          ))}
          {!links.length && (
            <p className="text-sm" style={{ color: '#6b7280' }}>No explore links yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
