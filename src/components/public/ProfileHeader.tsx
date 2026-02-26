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
  const cardBg = isDark ? '#141920' : '#ffffff'
  const mutedColor = isDark ? '#6b7280' : '#64748b'

  return (
    <div className="px-4 pt-6 pb-2">
      {/* Stats Row */}
      <div className="flex items-center gap-4 mb-4">
        {/* Profile Image */}
        <motion.div
          whileTap={{ scale: 0.95 }}
          className="relative flex-shrink-0"
        >
          <div className="story-ring w-20 h-20">
            <div className="w-full h-full rounded-full overflow-hidden border-2"
              style={{ borderColor: isDark ? '#0b0f14' : '#f8fafc' }}>
              {profile?.profile_image ? (
                <Image
                  src={profile.profile_image}
                  alt={profile?.name || 'Profile'}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {profile?.name?.[0] || 'N'}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="flex flex-1 justify-around">
          {[
            { value: `${postCount}+`, label: 'Posts' },
            { value: `${profile?.impressions || 0}+`, label: 'Impressions' },
            { value: `${profile?.collaborations || 0}+`, label: 'Collaborations' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs mt-0.5" style={{ color: mutedColor }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Name & Bio */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-4"
      >
        <h1 className="text-lg font-bold">{profile?.name || 'Nirbhava Sawant'}</h1>
        <p className="text-sm mt-0.5" style={{ color: mutedColor }}>
          @{profile?.username || 'nirbhava.design'} · {profile?.bio?.split('.')[0] || 'UI/UX · Branding · Research'}
        </p>
        <p className="text-sm mt-0.5" style={{ color: mutedColor }}>{profile?.location || 'Pune'}</p>
        {profile?.bio && (
          <p className="text-sm mt-2 leading-relaxed">
            {profile.bio.includes('.')
              ? profile.bio.split('.').slice(1).filter(Boolean).map(s => s.trim()).join('. ') + '.'
              : profile.bio}
          </p>
        )}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2 mb-5"
      >
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}
          onClick={onMessage}
          className="btn-gradient flex-1 text-sm"
          style={{ padding: '10px 12px', borderRadius: '10px' }}
        >
          Message Me
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          onClick={onServices}
          className="flex-1 text-sm font-semibold border rounded-[10px]"
          style={{
            padding: '10px 12px',
            background: 'transparent',
            border: `1px solid ${isDark ? '#252d3d' : '#e2e8f0'}`,
            color: isDark ? '#e2e8f0' : '#0f172a',
          }}
        >
          Services
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          onClick={onHireMe}
          className="flex-1 text-sm font-semibold border rounded-[10px]"
          style={{
            padding: '10px 12px',
            background: 'transparent',
            border: `1px solid ${isDark ? '#252d3d' : '#e2e8f0'}`,
            color: isDark ? '#e2e8f0' : '#0f172a',
          }}
        >
          Hire Me
        </motion.button>
      </motion.div>
    </div>
  )
}
