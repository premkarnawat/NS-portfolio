'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { Profile } from '@/types/supabase'

interface Props {
  profile: Profile | null
  postCount: number
  onMessage: () => void
  onServices: () => void
  onHireMe: () => void
  isDark: boolean
}

export default function ProfileHeader({ profile, postCount, onMessage, onServices, onHireMe, isDark }: Props) {
  const mutedColor = isDark ? '#9ca3af' : '#64748b'
  const borderColor = isDark ? '#252d3d' : '#e2e8f0'

  // Clean bio: separate the @username line from the actual bio
  const rawBio = profile?.bio || ''
  // Bio format: "@username · tags. Actual bio sentence."
  // We display username/tags separately so strip from bio if duplicated
  const bioLines = rawBio.split('.')
  const firstLine = bioLines[0]?.trim()
  const isFirstLineTag = firstLine?.startsWith('@') || firstLine?.includes('·')
  const actualBio = isFirstLineTag
    ? bioLines.slice(1).filter(Boolean).map(s => s.trim()).join('. ') + '.'
    : rawBio

  return (
    <div style={{ padding: '24px 20px 12px' }}>
      {/* ── TOP ROW: Avatar + Stats ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>

        {/* Profile Image */}
        <motion.div whileTap={{ scale: 0.95 }} style={{ flexShrink: 0 }}>
          <div style={{
            background: 'linear-gradient(135deg, #f43f5e, #f97316, #eab308)',
            padding: '2.5px',
            borderRadius: '50%',
            width: '88px',
            height: '88px',
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              border: `3px solid ${isDark ? '#0b0f14' : '#f8fafc'}`,
            }}>
              {profile?.profile_image ? (
                <Image
                  src={profile.profile_image}
                  alt={profile?.name || 'Profile'}
                  width={88}
                  height={88}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  fontSize: '28px', fontWeight: 800, color: 'white',
                }}>
                  {profile?.name?.[0] || 'N'}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div style={{ display: 'flex', flex: 1, justifyContent: 'space-around' }}>
          {[
            { value: `${postCount}+`, label: 'Posts' },
            { value: `${profile?.impressions || 0}+`, label: 'Impressions' },
            { value: `${profile?.collaborations || 0}+`, label: 'Collaborations' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ fontSize: '22px', fontWeight: 700, lineHeight: 1.1 }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: mutedColor, marginTop: '3px' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── NAME & BIO ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        style={{ marginBottom: '16px' }}
      >
        <h1 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '3px' }}>
          {profile?.name || 'Nirbhava Sawant'}
        </h1>
        <p style={{ fontSize: '13px', color: mutedColor, marginBottom: '2px' }}>
          @{profile?.username || 'nirbhava.design'} · {profile?.location || 'Pune'}
        </p>
        {actualBio && (
          <p style={{ fontSize: '13px', lineHeight: '1.55', color: isDark ? '#cbd5e1' : '#334155', marginTop: '6px' }}>
            {actualBio.replace(/^\.\s*/, '')}
          </p>
        )}
      </motion.div>

      {/* ── ACTION BUTTONS ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}
      >
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}
          onClick={onMessage}
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '12px',
            color: 'white',
            fontWeight: 600,
            fontSize: '14px',
            padding: '11px 8px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Message Me
        </motion.button>

        {[
          { label: 'Services', action: onServices },
          { label: 'Hire Me', action: onHireMe },
        ].map(btn => (
          <motion.button
            key={btn.label}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={btn.action}
            style={{
              flex: 1,
              background: 'transparent',
              borderRadius: '12px',
              border: `1px solid ${borderColor}`,
              color: isDark ? '#e2e8f0' : '#0f172a',
              fontWeight: 600,
              fontSize: '14px',
              padding: '11px 8px',
              cursor: 'pointer',
            }}
          >
            {btn.label}
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
