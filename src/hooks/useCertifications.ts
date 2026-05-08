'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Certification } from '@/types/supabase'

export function useCertifications() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('certifications')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCertifications(data || [])
        setLoading(false)
      })
  }, [])

  return { certifications, loading }
}
