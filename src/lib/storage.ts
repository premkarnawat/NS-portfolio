import { createClient } from './supabase/client'

export async function uploadFile(
  bucket: string,
  file: File,
  path?: string
): Promise<string | null> {
  const supabase = createClient()
  const fileName = path || `${Date.now()}-${file.name.replace(/\s+/g, '-')}`

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
  // Extract path from full URL
  const urlPath = path.split(`/storage/v1/object/public/${bucket}/`)[1]
  if (!urlPath) return false
  const { error } = await supabase.storage.from(bucket).remove([urlPath])
  return !error
}
