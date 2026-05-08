'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { uploadFile } from '@/lib/storage'
import toast from 'react-hot-toast'
import {
  Plus, Trash2, Edit2, Upload, X, Loader2, Award, Calendar, Building2,
  FileText, Image as ImageIcon, Eye
} from 'lucide-react'
import type { Certification } from '@/types/supabase'

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  issuer: z.string().min(1, 'Issuer required'),
  issue_date: z.string().optional(),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function AdminCertifications() {
  const [certs, setCerts] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Certification | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [fileType, setFileType] = useState<'pdf' | 'image' | null>(null)
  const [uploading, setUploading] = useState(false)
  const [previewCert, setPreviewCert] = useState<Certification | null>(null)

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const fetchCerts = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('certifications')
      .select('*')
      .order('created_at', { ascending: false })
    setCerts(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchCerts() }, [])

  const openNew = () => {
    setEditItem(null)
    setFileUrl(null)
    setFileType(null)
    reset({ title: '', issuer: '', issue_date: '', description: '' })
    setShowForm(true)
  }

  const openEdit = (item: Certification) => {
    setEditItem(item)
    setFileUrl(item.file_url)
    setFileType(item.file_type)
    reset({
      title: item.title,
      issuer: item.issuer,
      issue_date: item.issue_date || '',
      description: item.description || '',
    })
    setShowForm(true)
  }

  const onSubmit = async (data: FormData) => {
    const supabase = createClient()
    const payload = {
      ...data,
      file_url: fileUrl,
      file_type: fileType,
    }
    const { error } = editItem
      ? await supabase.from('certifications').update(payload).eq('id', editItem.id)
      : await supabase.from('certifications').insert([payload])
    if (error) toast.error(error.message)
    else {
      toast.success(editItem ? 'Certificate updated!' : 'Certificate added!')
      setShowForm(false)
      fetchCerts()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this certification?')) return
    const supabase = createClient()
    await supabase.from('certifications').delete().eq('id', id)
    toast.success('Deleted')
    fetchCerts()
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const isPDF = file.type === 'application/pdf'
    const isImage = file.type.startsWith('image/')
    if (!isPDF && !isImage) {
      toast.error('Only PDF, PNG, JPG, JPEG, WEBP supported')
      return
    }
    setUploading(true)
    const url = await uploadFile('certifications', file)
    if (url) {
      setFileUrl(url)
      setFileType(isPDF ? 'pdf' : 'image')
      toast.success('File uploaded!')
    } else {
      toast.error('Upload failed')
    }
    setUploading(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Certifications</h2>
        <motion.button whileTap={{ scale: 0.95 }} onClick={openNew}
          className="btn-gradient flex items-center gap-2 text-sm" style={{ padding: '8px 16px' }}>
          <Plus size={16} /> Add Certificate
        </motion.button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl p-5 mb-6"
            style={{ background: '#141920', border: '1px solid #252d3d' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">
                {editItem ? 'Edit Certificate' : 'New Certificate'}
              </h3>
              <button onClick={() => setShowForm(false)}>
                <X size={18} color="#6b7280" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {/* File Upload */}
              <div>
                <label className="block text-xs mb-2" style={{ color: '#9ca3af' }}>
                  Certificate File (PDF / PNG / JPG / JPEG / WEBP)
                </label>
                <div className="flex items-center gap-3">
                  {/* Preview thumbnail */}
                  {fileUrl && (
                    <div
                      className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                      style={{ background: '#252d3d', border: '1px solid #1e2535' }}
                    >
                      {fileType === 'pdf' ? (
                        <div className="flex flex-col items-center gap-1">
                          <FileText size={20} color="#ef4444" />
                          <span className="text-xs" style={{ color: '#9ca3af' }}>PDF</span>
                        </div>
                      ) : (
                        <img src={fileUrl} alt="Preview" className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}
                  <label
                    className="flex items-center gap-2 text-sm cursor-pointer px-4 py-2.5 rounded-xl"
                    style={{ background: '#252d3d', color: '#9ca3af' }}
                  >
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {uploading ? 'Uploading...' : fileUrl ? 'Replace File' : 'Upload File'}
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp,image/*,application/pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </label>
                  {fileUrl && (
                    <button
                      type="button"
                      onClick={() => { setFileUrl(null); setFileType(null) }}
                      className="p-2 rounded-lg"
                      style={{ background: 'rgba(239,68,68,0.1)' }}
                    >
                      <X size={14} color="#ef4444" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#9ca3af' }}>Title *</label>
                <input {...register('title')} className="input-dark" placeholder="e.g. Google UX Design Certificate" />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
              </div>

              {/* Issuer */}
              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#9ca3af' }}>Issuer / Organization *</label>
                <input {...register('issuer')} className="input-dark" placeholder="e.g. Google, Coursera, Adobe..." />
                {errors.issuer && <p className="text-red-400 text-xs mt-1">{errors.issuer.message}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#9ca3af' }}>Issue Date</label>
                <input {...register('issue_date')} className="input-dark" placeholder="e.g. January 2024" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#9ca3af' }}>Description (optional)</label>
                <textarea
                  {...register('description')}
                  className="input-dark"
                  rows={3}
                  placeholder="Brief description about this certification..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isSubmitting || uploading}
                  className="btn-gradient flex-1"
                >
                  {isSubmitting ? 'Saving...' : 'Save Certificate'}
                </motion.button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-sm"
                  style={{ background: '#252d3d', color: '#9ca3af' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin" color="#6366f1" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {certs.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start gap-4 p-4 rounded-2xl"
              style={{ background: '#141920', border: '1px solid #252d3d' }}
            >
              {/* Thumbnail */}
              <div
                className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{ background: '#252d3d' }}
              >
                {cert.file_url && cert.file_type === 'image' ? (
                  <img src={cert.file_url} alt={cert.title} className="w-full h-full object-cover" />
                ) : cert.file_type === 'pdf' ? (
                  <div className="flex flex-col items-center gap-1">
                    <FileText size={18} color="#ef4444" />
                    <span className="text-xs" style={{ color: '#9ca3af' }}>PDF</span>
                  </div>
                ) : (
                  <Award size={22} color="#6366f1" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white mb-1 truncate">{cert.title}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {cert.issuer && (
                    <div className="flex items-center gap-1.5">
                      <Building2 size={11} color="#6b7280" />
                      <span className="text-xs" style={{ color: '#6b7280' }}>{cert.issuer}</span>
                    </div>
                  )}
                  {cert.issue_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={11} color="#6b7280" />
                      <span className="text-xs" style={{ color: '#6b7280' }}>{cert.issue_date}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 flex-shrink-0">
                {cert.file_url && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setPreviewCert(cert)}
                    className="p-1.5 rounded-lg"
                    style={{ background: 'rgba(16,185,129,0.12)' }}
                    title="Preview"
                  >
                    <Eye size={13} color="#10b981" />
                  </motion.button>
                )}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => openEdit(cert)}
                  className="p-1.5 rounded-lg"
                  style={{ background: 'rgba(99,102,241,0.15)' }}
                >
                  <Edit2 size={13} color="#6366f1" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(cert.id)}
                  className="p-1.5 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.1)' }}
                >
                  <Trash2 size={13} color="#ef4444" />
                </motion.button>
              </div>
            </motion.div>
          ))}
          {!certs.length && (
            <div className="flex flex-col items-center py-12 gap-3">
              <Award size={36} color="#252d3d" />
              <p className="text-sm" style={{ color: '#6b7280' }}>No certifications yet. Add your first one!</p>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => setPreviewCert(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#141920',
                borderRadius: '20px',
                overflow: 'hidden',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #252d3d',
              }}
            >
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #252d3d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '15px' }}>{previewCert.title}</span>
                <button onClick={() => setPreviewCert(null)}>
                  <X size={18} color="#6b7280" />
                </button>
              </div>
              <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                {previewCert.file_type === 'pdf' ? (
                  <iframe
                    src={`${previewCert.file_url}#toolbar=0`}
                    title={previewCert.title}
                    style={{ width: '100%', height: '500px', border: 'none', borderRadius: '10px', background: '#fff' }}
                  />
                ) : (
                  <img
                    src={previewCert.file_url!}
                    alt={previewCert.title}
                    style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain', borderRadius: '10px', display: 'block' }}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
