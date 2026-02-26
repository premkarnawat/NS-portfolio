'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { uploadFile, getMediaType, isVideoUrl } from '@/lib/storage'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit2, X, Loader2, Image as ImageIcon, Video, Film } from 'lucide-react'
import Image from 'next/image'
import type { Highlight } from '@/types/supabase'

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  link: z.string().url().optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>
interface MediaItem { url: string; type: 'image' | 'video' }

export default function AdminHighlights() {
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Highlight | null>(null)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [uploadingMedia, setUploadingMedia] = useState(false)

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
    setEditItem(null); setMediaItems([])
    reset({ title: '', link: '' }); setShowForm(true)
  }

  const openEdit = (h: Highlight) => {
    setEditItem(h)
    const items: MediaItem[] = (h.media_urls || []).map((url, i) => ({
      url, type: (h.media_types?.[i] as 'image' | 'video') || (isVideoUrl(url) ? 'video' : 'image'),
    }))
    if (h.cover_image && !items.find(m => m.url === h.cover_image)) {
      items.unshift({ url: h.cover_image, type: isVideoUrl(h.cover_image) ? 'video' : 'image' })
    }
    setMediaItems(items)
    reset({ title: h.title, link: h.link || '' }); setShowForm(true)
  }

  const onSubmit = async (data: FormData) => {
    const supabase = createClient()
    const urls = mediaItems.map(m => m.url)
    const types = mediaItems.map(m => m.type)
    const payload = {
      ...data,
      cover_image: urls[0] || null,
      media_urls: urls,
      media_types: types,
    }
    const { error } = editItem
      ? await supabase.from('highlights').update(payload).eq('id', editItem.id)
      : await supabase.from('highlights').insert([payload])
    if (error) toast.error(error.message)
    else { toast.success(editItem ? 'Updated!' : 'Created!'); setShowForm(false); fetchHighlights() }
  }

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); if (!files.length) return
    setUploadingMedia(true)
    const results: MediaItem[] = []
    for (const file of files) {
      const mt = getMediaType(file); if (mt === 'pdf') continue
      const bucket = mt === 'video' ? 'highlight-videos' : 'highlight-images'
      const url = await uploadFile(bucket, file)
      if (url) results.push({ url, type: mt as 'image' | 'video' })
    }
    setMediaItems(prev => [...prev, ...results])
    if (results.length) toast.success(`${results.length} file(s) uploaded!`)
    else toast.error('Upload failed')
    setUploadingMedia(false); e.target.value = ''
  }

  const removeMedia = (index: number) => setMediaItems(prev => prev.filter((_, i) => i !== index))

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this highlight?')) return
    const supabase = createClient()
    await supabase.from('highlights').delete().eq('id', id)
    toast.success('Deleted'); fetchHighlights()
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

              {/* MEDIA SECTION */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-xs font-semibold" style={{ color: '#9ca3af' }}>MEDIA</label>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#252d3d', color: '#6b7280' }}>
                    First image = thumbnail
                  </span>
                </div>

                {mediaItems.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-3">
                    {mediaItems.map((item, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden w-16 h-16 flex-shrink-0"
                        style={{ background: '#0b0f14' }}>
                        {item.type === 'video' ? (
                          <>
                            <video src={item.url} className="w-full h-full object-cover" muted />
                            <div className="absolute inset-0 flex items-center justify-center"
                              style={{ background: 'rgba(0,0,0,0.5)' }}>
                              <Film size={16} color="white" />
                            </div>
                          </>
                        ) : (
                          <Image src={item.url} alt="" fill className="object-cover" />
                        )}
                        {i === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 text-center py-0.5"
                            style={{ background: 'rgba(99,102,241,0.9)', fontSize: '8px', color: 'white', fontWeight: 700 }}>
                            COVER
                          </div>
                        )}
                        <button type="button" onClick={() => removeMedia(i)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full items-center justify-center hidden group-hover:flex"
                          style={{ background: '#ef4444' }}>
                          <X size={10} color="white" />
                        </button>
                      </div>
                    ))}

                    <label className="w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer border-2 border-dashed flex-shrink-0"
                      style={{ borderColor: '#252d3d', color: '#4b5563' }}>
                      <Plus size={14} />
                      <span style={{ fontSize: '9px' }}>Add</span>
                      <input type="file" accept="image/*,video/mp4,video/mov,video/webm" multiple className="hidden"
                        onChange={handleMediaUpload} disabled={uploadingMedia} />
                    </label>
                  </div>
                )}

                {mediaItems.length === 0 && (
                  <label className="flex flex-col items-center justify-center gap-2 w-full py-6 rounded-xl cursor-pointer border-2 border-dashed"
                    style={{ borderColor: '#252d3d', color: '#6b7280' }}>
                    {uploadingMedia ? (
                      <><Loader2 size={20} className="animate-spin" /><span className="text-sm">Uploading...</span></>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          <ImageIcon size={20} color="#6366f1" />
                          <Film size={20} color="#8b5cf6" />
                        </div>
                        <p className="text-sm" style={{ color: '#9ca3af' }}>Add images or short video</p>
                        <p className="text-xs">JPG, PNG, MP4, MOV</p>
                      </>
                    )}
                    <input type="file" accept="image/*,video/mp4,video/mov,video/webm" multiple className="hidden"
                      onChange={handleMediaUpload} disabled={uploadingMedia} />
                  </label>
                )}

                {mediaItems.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer px-3 py-1.5 rounded-lg"
                      style={{ background: '#252d3d', color: '#9ca3af' }}>
                      {uploadingMedia ? <Loader2 size={11} className="animate-spin" /> : <ImageIcon size={11} />}
                      More Images
                      <input type="file" accept="image/*" multiple className="hidden"
                        onChange={handleMediaUpload} disabled={uploadingMedia} />
                    </label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer px-3 py-1.5 rounded-lg"
                      style={{ background: '#252d3d', color: '#9ca3af' }}>
                      {uploadingMedia ? <Loader2 size={11} className="animate-spin" /> : <Video size={11} />}
                      Add Video
                      <input type="file" accept="video/mp4,video/mov,video/webm,video/*" className="hidden"
                        onChange={handleMediaUpload} disabled={uploadingMedia} />
                    </label>
                  </div>
                )}
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
            <motion.div key={h.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }} className="flex flex-col items-center gap-2">
              <div className="relative w-16 h-16 rounded-full overflow-hidden" style={{ background: '#252d3d' }}>
                {h.cover_image ? (
                  isVideoUrl(h.cover_image) ? (
                    <>
                      <video src={h.cover_image} className="w-full h-full object-cover" muted />
                      <div className="absolute inset-0 flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.4)' }}>
                        <Film size={14} color="white" />
                      </div>
                    </>
                  ) : (
                    <Image src={h.cover_image} alt={h.title} width={64} height={64} className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white">
                    {h.title[0]}
                  </div>
                )}
                {(h.media_urls?.length || 0) > 1 && (
                  <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: '#6366f1', color: 'white', fontSize: '9px' }}>
                    {h.media_urls?.length}
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
          {!highlights.length && <p className="text-sm" style={{ color: '#6b7280' }}>No highlights yet.</p>}
        </div>
      )}
    </div>
  )
}
