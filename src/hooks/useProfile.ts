'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/supabase'

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setProfile(data)
        setLoading(false)
      })
  }, [])

  return { profile, loading, error }
}
