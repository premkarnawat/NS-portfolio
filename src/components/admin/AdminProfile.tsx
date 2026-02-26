'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { uploadFile } from '@/lib/storage'
import toast from 'react-hot-toast'
import { Plus, X, Upload, Loader2 } from 'lucide-react'
import Image from 'next/image'

const schema = z.object({
  name: z.string().min(1),
  username: z.string().min(1),
  bio: z.string(),
  location: z.string(),
  impressions: z.number().min(0),
  collaborations: z.number().min(0),
})
type FormData = z.infer<typeof schema>

export default function AdminProfile() {
  const [profileId, setProfileId] = useState<string | null>(null)
  const [services, setServices] = useState<string[]>([])
  const [newService, setNewService] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState<'image' | 'resume' | null>(null)
  const [loading, setLoading] = useState(true)

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.from('profiles').select('*').limit(1).single().then(({ data }) => {
      if (data) {
        setProfileId(data.id)
        setServices(data.services || [])
        setProfileImageUrl(data.profile_image)
        setResumeUrl(data.resume_url)
        reset({
          name: data.name,
          username: data.username,
          bio: data.bio,
          location: data.location,
          impressions: data.impressions,
          collaborations: data.collaborations,
        })
      }
      setLoading(false)
    })
  }, [reset])

  const onSubmit = async (data: FormData) => {
    const supabase = createClient()
    const payload = { ...data, services, profile_image: profileImageUrl, resume_url: resumeUrl, updated_at: new Date().toISOString() }
    const { error } = profileId
      ? await supabase.from('profiles').update(payload).eq('id', profileId)
      : await supabase.from('profiles').insert([payload])
    if (error) toast.error(error.message)
    else toast.success('Profile updated! ✓')
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading('image')
    const url = await uploadFile('profile-images', file)
    if (url) { setProfileImageUrl(url); toast.success('Image uploaded!') }
    else toast.error('Upload failed')
    setUploading(null)
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading('resume')
    const url = await uploadFile('resumes', file)
    if (url) { setResumeUrl(url); toast.success('Resume uploaded!') }
    else toast.error('Upload failed')
    setUploading(null)
  }

  if (loading) return <LoadingState />

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">Profile Management</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Image */}
          <AdminCard title="Profile Image">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0"
                style={{ background: '#252d3d' }}>
                {profileImageUrl ? (
                  <Image src={profileImageUrl} alt="Profile" width={80} height={80} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Upload size={24} color="#6b7280" />
                  </div>
                )}
              </div>
              <label className="btn-gradient cursor-pointer flex items-center gap-2 text-sm">
                {uploading === 'image' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading === 'image' ? 'Uploading...' : 'Upload Photo'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={!!uploading} />
              </label>
            </div>
          </AdminCard>

          {/* Resume Upload */}
          <AdminCard title="Resume">
            <div className="flex flex-col gap-3">
              {resumeUrl && (
                <p className="text-xs truncate" style={{ color: '#6b7280' }}>✓ Resume uploaded</p>
              )}
              <label className="btn-gradient cursor-pointer flex items-center gap-2 text-sm w-fit">
                {uploading === 'resume' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading === 'resume' ? 'Uploading...' : 'Upload Resume (PDF)'}
                <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} disabled={!!uploading} />
              </label>
            </div>
          </AdminCard>
        </div>

        {/* Basic Info */}
        <AdminCard title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'name', label: 'Full Name', placeholder: 'Nirbhava Sawant' },
              { name: 'username', label: 'Username', placeholder: 'nirbhava.design' },
              { name: 'location', label: 'Location', placeholder: 'Pune, India' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm mb-1.5" style={{ color: '#9ca3af' }}>{f.label}</label>
                <input
                  {...register(f.name as keyof FormData)}
                  placeholder={f.placeholder}
                  className="input-dark"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#9ca3af' }}>Bio</label>
              <textarea
                {...register('bio')}
                placeholder="Write your bio..."
                rows={3}
                className="input-dark resize-none"
              />
            </div>
          </div>
        </AdminCard>

        {/* Stats */}
        <AdminCard title="Stats">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#9ca3af' }}>Impressions</label>
              <input
                {...register('impressions', { valueAsNumber: true })}
                type="number"
                className="input-dark"
              />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#9ca3af' }}>Collaborations</label>
              <input
                {...register('collaborations', { valueAsNumber: true })}
                type="number"
                className="input-dark"
              />
            </div>
          </div>
        </AdminCard>

        {/* Services */}
        <AdminCard title="Services">
          <div className="flex flex-wrap gap-2 mb-3">
            {services.map(s => (
              <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                style={{ background: '#252d3d', color: '#e2e8f0' }}>
                {s}
                <button type="button" onClick={() => setServices(services.filter(x => x !== s))}>
                  <X size={12} color="#6b7280" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newService}
              onChange={e => setNewService(e.target.value)}
              placeholder="Add a service..."
              className="input-dark flex-1"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (newService.trim()) { setServices([...services, newService.trim()]); setNewService('') }
                }
              }}
            />
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => { if (newService.trim()) { setServices([...services, newService.trim()]); setNewService('') }}}
              className="px-4 py-2 rounded-xl flex items-center gap-1 text-sm font-medium"
              style={{ background: 'rgba(99,102,241,0.2)', color: '#6366f1' }}
            >
              <Plus size={16} /> Add
            </motion.button>
          </div>
        </AdminCard>

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={isSubmitting}
          className="btn-gradient"
          style={{ opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </motion.button>
      </form>
    </div>
  )
}

function AdminCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: '#141920', border: '1px solid #252d3d' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: '#9ca3af' }}>{title}</h3>
      {children}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={24} className="animate-spin" color="#6366f1" />
    </div>
  )
}
