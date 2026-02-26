'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { uploadFile, getMediaType, isVideoUrl } from '@/lib/storage'
import toast from 'react-hot-toast'
import {
  Plus, Trash2, Edit2, Upload, X, Loader2,
  ExternalLink, FileText, Link2, Image as ImageIcon, Video, Film
} from 'lucide-react'
import Image from 'next/image'
import type { Post } from '@/types/supabase'

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().min(1, 'Description required'),
  category: z.string(),
  project_link: z.string().url().optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

interface MediaItem { url: string; type: 'image' | 'video' }

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editPost, setEditPost] = useState<Post | null>(null)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [linkMode, setLinkMode] = useState<'link' | 'pdf'>('link')

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const fetchPosts = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  const openNew = () => {
    setEditPost(null); setMediaItems([]); setPdfUrl(null); setLinkMode('link')
    reset({ title: '', description: '', category: '', project_link: '' })
    setShowForm(true)
  }

  const openEdit = (post: Post) => {
    setEditPost(post)
    const items: MediaItem[] = (post.media_urls || []).map((url, i) => ({
      url, type: (post.media_types?.[i] as 'image' | 'video') || (isVideoUrl(url) ? 'video' : 'image'),
    }))
    if (post.cover_image && !items.find(m => m.url === post.cover_image)) {
      items.unshift({ url: post.cover_image, type: isVideoUrl(post.cover_image) ? 'video' : 'image' })
    }
    setMediaItems(items)
    setPdfUrl(post.pdf_url || null)
    setLinkMode(post.pdf_url ? 'pdf' : 'link')
    reset({ title: post.title, description: post.description, category: post.category, project_link: post.project_link || '' })
    setShowForm(true)
  }

  const onSubmit = async (data: FormData) => {
    const supabase = createClient()
    const urls = mediaItems.map(m => m.url)
    const types = mediaItems.map(m => m.type)
    const payload = {
      ...data,
      project_link: linkMode === 'link' ? (data.project_link || null) : null,
      pdf_url: linkMode === 'pdf' ? pdfUrl : null,
      cover_image: urls[0] || null,
      media_urls: urls,
      media_types: types,
    }
    const { error } = editPost
      ? await supabase.from('posts').update(payload).eq('id', editPost.id)
      : await supabase.from('posts').insert([payload])
    if (error) toast.error(error.message)
    else { toast.success(editPost ? 'Post updated! ✓' : 'Post created! ✓'); setShowForm(false); fetchPosts() }
  }

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, forceType?: 'video') => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploadingMedia(true)
    const results: MediaItem[] = []
    for (const file of files) {
      const mt = forceType || getMediaType(file)
      if (mt === 'pdf') continue
      const bucket = mt === 'video' ? 'post-videos' : 'post-images'
      const url = await uploadFile(bucket, file)
      if (url) results.push({ url, type: mt as 'image' | 'video' })
    }
    setMediaItems(prev => [...prev, ...results])
    if (results.length) toast.success(`${results.length} file(s) uploaded!`)
    else toast.error('Upload failed')
    setUploadingMedia(false)
    e.target.value = ''
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploadingPdf(true)
    const url = await uploadFile('post-pdfs', file)
    if (url) { setPdfUrl(url); toast.success('PDF uploaded! ✓') } else toast.error('PDF upload failed')
    setUploadingPdf(false)
  }

  const removeMedia = (index: number) => setMediaItems(prev => prev.filter((_, i) => i !== index))

  const moveMedia = (from: number, to: number) => {
    if (to < 0 || to >= mediaItems.length) return
    const arr = [...mediaItems]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item); setMediaItems(arr)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return
    const supabase = createClient()
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Deleted'); fetchPosts() }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Posts ({posts.length})</h2>
        <motion.button whileTap={{ scale: 0.95 }} onClick={openNew}
          className="btn-gradient flex items-center gap-2 text-sm" style={{ padding: '8px 16px' }}>
          <Plus size={16} /> New Post
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl p-5 mb-6" style={{ background: '#141920', border: '1px solid #252d3d' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">{editPost ? 'Edit Post' : 'New Post'}</h3>
              <button onClick={() => setShowForm(false)}><X size={18} color="#6b7280" /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

              {/* MEDIA SECTION */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-xs font-semibold" style={{ color: '#9ca3af' }}>MEDIA</label>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#252d3d', color: '#6b7280' }}>
                    Images + Videos · First = Cover
                  </span>
                </div>

                {mediaItems.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {mediaItems.map((item, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden"
                        style={{ aspectRatio: '1', background: '#0b0f14' }}>
                        {item.type === 'video' ? (
                          <>
                            <video src={item.url} className="w-full h-full object-cover" muted />
                            <div className="absolute inset-0 flex items-center justify-center"
                              style={{ background: 'rgba(0,0,0,0.45)' }}>
                              <Film size={22} color="white" />
                            </div>
                          </>
                        ) : (
                          <Image src={item.url} alt="" fill className="object-cover" />
                        )}
                        {i === 0 && (
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-xs font-bold"
                            style={{ background: 'rgba(99,102,241,0.9)', color: 'white', fontSize: '9px' }}>
                            COVER
                          </div>
                        )}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5"
                          style={{ background: 'rgba(0,0,0,0.65)' }}>
                          {i > 0 && (
                            <button type="button" onClick={() => moveMedia(i, i - 1)}
                              className="w-7 h-7 rounded-full text-white text-sm flex items-center justify-center"
                              style={{ background: 'rgba(255,255,255,0.2)' }}>‹</button>
                          )}
                          <button type="button" onClick={() => removeMedia(i)}
                            className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: '#ef4444' }}>
                            <X size={13} color="white" />
                          </button>
                          {i < mediaItems.length - 1 && (
                            <button type="button" onClick={() => moveMedia(i, i + 1)}
                              className="w-7 h-7 rounded-full text-white text-sm flex items-center justify-center"
                              style={{ background: 'rgba(255,255,255,0.2)' }}>›</button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Add more placeholder */}
                    <label className="rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer border-2 border-dashed transition-colors"
                      style={{ aspectRatio: '1', borderColor: '#252d3d', color: '#4b5563' }}>
                      <Plus size={18} />
                      <span className="text-xs">Add</span>
                      <input type="file" accept="image/*,video/mp4,video/mov,video/webm" multiple className="hidden"
                        onChange={handleMediaUpload} disabled={uploadingMedia} />
                    </label>
                  </div>
                )}

                {mediaItems.length === 0 && (
                  <label className="flex flex-col items-center justify-center gap-3 w-full py-8 rounded-xl cursor-pointer border-2 border-dashed transition-all"
                    style={{ borderColor: '#252d3d', color: '#6b7280' }}>
                    {uploadingMedia
                      ? <><Loader2 size={24} className="animate-spin" /><span className="text-sm">Uploading...</span></>
                      : <>
                          <div className="flex gap-3">
                            <ImageIcon size={24} color="#6366f1" />
                            <Film size={24} color="#8b5cf6" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium" style={{ color: '#9ca3af' }}>Click to add images or videos</p>
                            <p className="text-xs mt-1">JPG, PNG, MP4, MOV supported</p>
                          </div>
                        </>}
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
                        onChange={(e) => handleMediaUpload(e, 'video')} disabled={uploadingMedia} />
                    </label>
                  </div>
                )}
              </div>

              {/* BASIC INFO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: '#9ca3af' }}>Title *</label>
                  <input {...register('title')} className="input-dark" placeholder="Project title" />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: '#9ca3af' }}>Category</label>
                  <input {...register('category')} className="input-dark" placeholder="UX Research, Mobile App..." />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#9ca3af' }}>Description *</label>
                <textarea {...register('description')} rows={3} className="input-dark resize-none"
                  placeholder="Project description..." />
              </div>

              {/* LINK OR PDF TOGGLE */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#9ca3af' }}>CASE STUDY</label>
                <div className="flex rounded-xl overflow-hidden mb-3"
                  style={{ background: '#0b0f14', border: '1px solid #252d3d' }}>
                  {(['link', 'pdf'] as const).map(mode => (
                    <button key={mode} type="button" onClick={() => setLinkMode(mode)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-all"
                      style={{
                        background: linkMode === mode ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                        color: linkMode === mode ? 'white' : '#6b7280',
                      }}>
                      {mode === 'link' ? <><Link2 size={13} /> Project Link</> : <><FileText size={13} /> Upload PDF</>}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {linkMode === 'link' ? (
                    <motion.div key="link" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
                      <input {...register('project_link')} className="input-dark"
                        placeholder="https://behance.net/your-project..." />
                    </motion.div>
                  ) : (
                    <motion.div key="pdf" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                      {pdfUrl ? (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
                          <FileText size={18} color="#6366f1" />
                          <span className="text-sm flex-1 truncate" style={{ color: '#6366f1' }}>PDF uploaded ✓</span>
                          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="mr-1">
                            <ExternalLink size={13} color="#6366f1" />
                          </a>
                          <button type="button" onClick={() => setPdfUrl(null)}>
                            <X size={14} color="#6b7280" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 w-full py-5 rounded-xl cursor-pointer border-2 border-dashed transition-colors"
                          style={{ borderColor: '#252d3d', color: '#6b7280' }}>
                          {uploadingPdf
                            ? <><Loader2 size={16} className="animate-spin" /> Uploading PDF...</>
                            : <><FileText size={16} /> Click to upload PDF (case study)</>}
                          <input type="file" accept=".pdf" className="hidden"
                            onChange={handlePdfUpload} disabled={uploadingPdf} />
                        </label>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={isSubmitting} className="btn-gradient flex-1">
                  {isSubmitting ? 'Saving...' : (editPost ? 'Update Post' : 'Create Post')}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="rounded-2xl overflow-hidden"
              style={{ background: '#141920', border: '1px solid #252d3d' }}>
              {post.cover_image && (
                <div className="relative h-32">
                  {isVideoUrl(post.cover_image) ? (
                    <>
                      <video src={post.cover_image} className="w-full h-full object-cover" muted />
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
                        <Film size={28} color="white" />
                      </div>
                    </>
                  ) : (
                    <Image src={post.cover_image} alt={post.title} fill className="object-cover" />
                  )}
                  {(post.media_urls?.length || 0) > 1 && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}>
                      +{(post.media_urls?.length || 1) - 1} more
                    </div>
                  )}
                </div>
              )}
              <div className="p-4">
                <h4 className="font-semibold text-white text-sm mb-1">{post.title}</h4>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {(post.media_urls?.length || 0) > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ background: '#252d3d', color: '#9ca3af' }}>
                      <ImageIcon size={9} /> {post.media_urls?.length} media
                    </span>
                  )}
                  {post.pdf_url && (
                    <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
                      <FileText size={9} /> PDF
                    </span>
                  )}
                </div>
                <p className="text-xs line-clamp-2 mb-3" style={{ color: '#6b7280' }}>{post.description}</p>
                <div className="flex items-center gap-2">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => openEdit(post)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
                    <Edit2 size={12} /> Edit
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(post.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                    <Trash2 size={12} /> Delete
                  </motion.button>
                  {post.project_link && (
                    <a href={post.project_link} target="_blank" rel="noopener noreferrer" className="ml-auto">
                      <ExternalLink size={14} color="#6b7280" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {!posts.length && (
            <div className="col-span-2 flex items-center justify-center py-12">
              <p className="text-sm" style={{ color: '#6b7280' }}>No posts yet. Create your first post!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
