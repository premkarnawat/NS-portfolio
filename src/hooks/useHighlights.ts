'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Highlight } from '@/types/supabase'

export function useHighlights() {
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('highlights')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setHighlights(data || [])
        setLoading(false)
      })
  }, [])

  return { highlights, loading }
}
