import { createClient } from './supabase/client'

export async function uploadFile(
  bucket: string,
  file: File,
  path?: string
): Promise<string | null> {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const fileName = path || `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    upsert: true,
    contentType: file.type,
  })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
  return data.publicUrl
}

export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  const supabase = createClient()
  const urlPath = path.split(`/storage/v1/object/public/${bucket}/`)[1]
  if (!urlPath) return false
  const { error } = await supabase.storage.from(bucket).remove([urlPath])
  return !error
}

export function getMediaType(file: File): 'image' | 'video' | 'pdf' {
  if (file.type.startsWith('video/')) return 'video'
  if (file.type === 'application/pdf') return 'pdf'
  return 'image'
}

export function isVideoUrl(url: string): boolean {
  return /\.(mp4|mov|webm|ogg|avi)(\?|$)/i.test(url)
}

