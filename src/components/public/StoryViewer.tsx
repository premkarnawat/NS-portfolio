'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Film } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState, useRef, useCallback } from 'react'
import type { Highlight } from '@/types/supabase'
import { isVideoUrl } from '@/lib/storage'

interface Props { story: Highlight; onClose: () => void }

export default function StoryViewer({ story, onClose }: Props) {
  // Build media list from media_urls or fall back to cover_image
  const allMedia = (() => {
    if (story.media_urls?.length) {
      return story.media_urls.map((url, i) => ({
        url,
        type: (story.media_types?.[i] as 'image' | 'video') || (isVideoUrl(url) ? 'video' : 'image'),
      }))
    }
    if (story.cover_image) {
      return [{ url: story.cover_image, type: isVideoUrl(story.cover_image) ? 'video' : 'image' as 'image' | 'video' }]
    }
    return [{ url: '', type: 'image' as 'image' | 'video' }]
  })()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const currentMedia = allMedia[currentIndex]
  const isVideo = currentMedia.type === 'video'
  const DURATION = isVideo ? 15000 : 5000 // 15s for video, 5s for images

  const goNext = useCallback(() => {
    if (currentIndex < allMedia.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setProgress(0)
    } else {
      onClose()
    }
  }, [currentIndex, allMedia.length, onClose])

  // Progress timer
  useEffect(() => {
    setProgress(0)
    if (timerRef.current) clearInterval(timerRef.current)

    // For video, let the video control progress
    if (!isVideo) {
      const step = 100 / (DURATION / 100)
      timerRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { clearInterval(timerRef.current!); goNext(); return 100 }
          return p + step
        })
      }, 100)
    }

    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [currentIndex, isVideo, DURATION, goNext])

  // Video progress tracking
  const handleVideoTimeUpdate = () => {
    if (!videoRef.current) return
    const p = (videoRef.current.currentTime / videoRef.current.duration) * 100
    setProgress(p)
    if (p >= 99) goNext()
  }

  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [currentIndex, isVideo])

  const handleTap = (e: React.MouseEvent) => {
    const x = e.clientX
    const w = window.innerWidth
    if (x < w * 0.35) {
      // Left tap — go back
      if (currentIndex > 0) { setCurrentIndex(prev => prev - 1); setProgress(0) }
    } else if (x > w * 0.65) {
      // Right tap — go forward
      goNext()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.06 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      style={{ maxWidth: '480px', margin: '0 auto' }}
      onClick={handleTap}
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-3 pb-1">
        {allMedia.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.3)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%',
                background: 'white',
                transition: i === currentIndex ? 'none' : 'width 0.1s',
              }}
            />
          </div>
        ))}
      </div>

      {/* Story header */}
      <div className="absolute top-8 left-0 right-0 z-20 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {story.cover_image && (
              <Image src={story.cover_image} alt={story.title} width={32} height={32} className="w-full h-full object-cover" />
            )}
          </div>
          <span className="text-white font-semibold text-sm">{story.title}</span>
          {isVideo && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.5)' }}>
              <Film size={10} color="white" />
              <span className="text-white text-xs">Video</span>
            </div>
          )}
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); onClose() }}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <X size={16} color="white" />
        </motion.button>
      </div>

      {/* Media */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex-1 relative"
        >
          {currentMedia.url ? (
            isVideo ? (
              <video
                ref={videoRef}
                src={currentMedia.url}
                className="w-full h-full object-contain"
                playsInline
                muted={false}
                onTimeUpdate={handleVideoTimeUpdate}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <Image src={currentMedia.url} alt={story.title} fill className="object-contain" />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{story.title}</span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom CTA */}
      {story.link && (
        <div className="absolute bottom-16 left-0 right-0 px-6" onClick={e => e.stopPropagation()}>
          <motion.a
            whileTap={{ scale: 0.97 }}
            href={story.link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gradient block text-center"
          >
            View Project
          </motion.a>
        </div>
      )}

      {/* Media counter */}
      {allMedia.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs"
          style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.7)' }}>
          {currentIndex + 1} / {allMedia.length}
        </div>
      )}
    </motion.div>
  )
}
