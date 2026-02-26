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
import type { Post } from '@/types/supabase'

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().min(1, 'Description required'),
  category: z.string(),
  project_link: z.string().url().optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editPost, setEditPost] = useState<Post | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

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
    setEditPost(null)
    setCoverImageUrl(null)
    reset({ title: '', description: '', category: '', project_link: '' })
    setShowForm(true)
  }

  const openEdit = (post: Post) => {
    setEditPost(post)
    setCoverImageUrl(post.cover_image)
    reset({ title: post.title, description: post.description, category: post.category, project_link: post.project_link || '' })
    setShowForm(true)
  }

  const onSubmit = async (data: FormData) => {
    const supabase = createClient()
    const payload = { ...data, cover_image: coverImageUrl }
    const { error } = editPost
      ? await supabase.from('posts').update(payload).eq('id', editPost.id)
      : await supabase.from('posts').insert([payload])
    if (error) toast.error(error.message)
    else {
      toast.success(editPost ? 'Post updated!' : 'Post created!')
      setShowForm(false)
      fetchPosts()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return
    const supabase = createClient()
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Deleted'); fetchPosts() }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadFile('post-images', file)
    if (url) setCoverImageUrl(url)
    else toast.error('Upload failed')
    setUploading(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Posts ({posts.length})</h2>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={openNew}
          className="btn-gradient flex items-center gap-2 text-sm"
          style={{ padding: '8px 16px' }}
        >
          <Plus size={16} /> New Post
        </motion.button>
      </div>

      {/* Post Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl p-5 mb-6"
            style={{ background: '#141920', border: '1px solid #252d3d' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">{editPost ? 'Edit Post' : 'New Post'}</h3>
              <button onClick={() => setShowForm(false)}><X size={18} color="#6b7280" /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {/* Cover Image */}
              <div>
                {coverImageUrl && (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden mb-2">
                    <Image src={coverImageUrl} alt="Cover" fill className="object-cover" />
                  </div>
                )}
                <label className="flex items-center gap-2 text-sm cursor-pointer w-fit px-3 py-2 rounded-xl"
                  style={{ background: '#252d3d', color: '#9ca3af' }}>
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploading ? 'Uploading...' : 'Upload Cover Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>

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
                <textarea {...register('description')} rows={3} className="input-dark resize-none" placeholder="Project description..." />
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#9ca3af' }}>Project Link (optional)</label>
                <input {...register('project_link')} className="input-dark" placeholder="https://..." />
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

      {/* Posts List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin" color="#6366f1" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl overflow-hidden"
              style={{ background: '#141920', border: '1px solid #252d3d' }}
            >
              {post.cover_image && (
                <div className="relative h-32">
                  <Image src={post.cover_image} alt={post.title} fill className="object-cover" />
                </div>
              )}
              <div className="p-4">
                <h4 className="font-semibold text-white text-sm mb-1">{post.title}</h4>
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
