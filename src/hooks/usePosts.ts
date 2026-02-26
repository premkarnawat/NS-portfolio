'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Post } from '@/types/supabase'

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPosts(data || [])
        setLoading(false)
      })
  }, [])

  return { posts, loading }
}
