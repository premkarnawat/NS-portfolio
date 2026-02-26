'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { Highlight } from '@/types/supabase'

interface Props { story: Highlight; onClose: () => void }

export default function StoryViewer({ story, onClose }: Props) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { onClose(); return 100 }
        return p + 2
      })
    }, 100)
    return () => clearInterval(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      style={{ maxWidth: '480px', margin: '0 auto' }}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-3">
        <div className="flex gap-1">
          <div className="h-0.5 flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.3)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, background: 'white' }}
            />
          </div>
        </div>
      </div>

      {/* Close button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="absolute top-8 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.5)' }}
      >
        <X size={18} color="white" />
      </motion.button>

      {/* Story Image */}
      <div className="flex-1 relative" onClick={onClose}>
        {story.cover_image ? (
          <Image
            src={story.cover_image}
            alt={story.title}
            fill
            className="object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{story.title}</span>
          </div>
        )}
      </div>

      {/* Story title */}
      <div className="absolute bottom-16 left-0 right-0 px-6">
        <span className="text-white font-semibold text-lg">{story.title}</span>
        {story.link && (
          <motion.a
            whileTap={{ scale: 0.97 }}
            href={story.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="btn-gradient mt-3 block text-center"
          >
            View Project
          </motion.a>
        )}
      </div>
    </motion.div>
  )
}
