'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { Highlight } from '@/types/supabase'

interface Props {
  highlights: Highlight[]
  onStoryOpen: (h: Highlight) => void
  isDark: boolean
}

export default function HighlightsRow({ highlights, onStoryOpen, isDark }: Props) {
  if (!highlights.length) return null

  return (
    <div className="px-4 pb-4">
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {highlights.map((h, i) => (
          <motion.button
            key={h.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => onStoryOpen(h)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
          >
            <div className="story-ring w-16 h-16">
              <div className="w-full h-full rounded-full overflow-hidden border-2"
                style={{ borderColor: isDark ? '#0b0f14' : '#f8fafc' }}>
                {h.cover_image ? (
                  <Image
                    src={h.cover_image}
                    alt={h.title}
                    width={60}
                    height={60}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold"
                    style={{ background: 'linear-gradient(135deg, #f43f5e, #f97316)' }}>
                    {h.title[0]}
                  </div>
                )}
              </div>
            </div>
            <span className="text-xs font-medium text-center max-w-[60px] truncate">
              {h.title}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
