'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ExploreLink } from '@/types/supabase'

export function useExploreLinks() {
  const [links, setLinks] = useState<ExploreLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('explore_links')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setLinks(data || [])
        setLoading(false)
      })
  }, [])

  return { links, loading }
}
