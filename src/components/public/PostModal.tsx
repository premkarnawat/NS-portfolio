'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, ChevronLeft, ChevronRight, FileText, Film, Play } from 'lucide-react'
import Image from 'next/image'
import { useState, useRef } from 'react'
import type { Post } from '@/types/supabase'
import { isVideoUrl } from '@/lib/storage'

interface Props { post: Post; onClose: () => void; isDark: boolean }

export default function PostModal({ post, onClose, isDark }: Props) {
  const cardBg = isDark ? '#141920' : '#ffffff'
  const border = isDark ? '#252d3d' : '#e2e8f0'

  // Build unified media list: media_urls if available, else fall back to cover_image
  const allMedia: { url: string; type: 'image' | 'video' }[] = (() => {
    if (post.media_urls?.length) {
      return post.media_urls.map((url, i) => ({
        url,
        type: (post.media_types?.[i] as 'image' | 'video') || (isVideoUrl(url) ? 'video' : 'image'),
      }))
    }
    if (post.cover_image) {
      return [{ url: post.cover_image, type: isVideoUrl(post.cover_image) ? 'video' : 'image' }]
    }
    return []
  })()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const categories = post.category ? post.category.split(',').map(c => c.trim()) : []
  const currentMedia = allMedia[currentIndex]
  const hasMultiple = allMedia.length > 1

  const goTo = (dir: 1 | -1) => {
    setPlaying(false)
    setCurrentIndex(prev => (prev + dir + allMedia.length) % allMedia.length)
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (playing) { videoRef.current.pause(); setPlaying(false) }
    else { videoRef.current.play(); setPlaying(true) }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: isDark ? '#0b0f14' : '#f8fafc', maxWidth: '480px', margin: '0 auto' }}
    >
      {/* ── MEDIA CAROUSEL ── */}
      <div className="relative bg-black flex-shrink-0" style={{ height: '55vw', maxHeight: '290px' }}>
        <AnimatePresence mode="wait">
          {currentMedia ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full"
            >
              {currentMedia.type === 'video' ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    src={currentMedia.url}
                    className="w-full h-full object-cover"
                    playsInline
                    loop
                    onEnded={() => setPlaying(false)}
                  />
                  {/* Video play button overlay */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: playing ? 'transparent' : 'rgba(0,0,0,0.35)' }}
                  >
                    {!playing && (
                      <div className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.9)' }}>
                        <Play size={22} color="#0b0f14" fill="#0b0f14" style={{ marginLeft: 2 }} />
                      </div>
                    )}
                  </motion.button>
                  {/* Video indicator */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.6)' }}>
                    <Film size={11} color="white" />
                    <span className="text-white text-xs">Video</span>
                  </div>
                </div>
              ) : (
                <Image src={currentMedia.url} alt={post.title} fill className="object-cover" />
              )}
            </motion.div>
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1a2030, #252d3d)' }}>
              <span className="text-white font-bold text-lg">{post.title}</span>
            </div>
          )}
        </AnimatePresence>

        {/* Navigation arrows */}
        {hasMultiple && (
          <>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => goTo(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10"
              style={{ background: 'rgba(0,0,0,0.5)' }}>
              <ChevronLeft size={18} color="white" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => goTo(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10"
              style={{ background: 'rgba(0,0,0,0.5)' }}>
              <ChevronRight size={18} color="white" />
            </motion.button>
          </>
        )}

        {/* Dot indicators */}
        {hasMultiple && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {allMedia.map((m, i) => (
              <button key={i} onClick={() => { setCurrentIndex(i); setPlaying(false) }}
                className="rounded-full transition-all"
                style={{
                  width: i === currentIndex ? 16 : 6,
                  height: 6,
                  background: i === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </div>
        )}

        {/* Media type thumbnails strip */}
        {hasMultiple && (
          <div className="absolute top-3 right-3 flex gap-1">
            {allMedia.map((m, i) => (
              <button key={i} onClick={() => { setCurrentIndex(i); setPlaying(false) }}
                className="w-7 h-7 rounded-lg overflow-hidden border-2 transition-all"
                style={{ borderColor: i === currentIndex ? '#6366f1' : 'transparent', opacity: i === currentIndex ? 1 : 0.6 }}>
                {m.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: '#252d3d' }}>
                    <Film size={10} color="#9ca3af" />
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <Image src={m.url} alt="" fill className="object-cover" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── INFO SHEET ── */}
      <motion.div
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="flex-1 rounded-t-3xl overflow-y-auto p-6"
        style={{ background: cardBg, marginTop: '-16px' }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold" style={{ color: '#6366f1' }}>nirbhava.design</span>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}>
            <X size={20} color="#6b7280" />
          </motion.button>
        </div>

        <h2 className="text-xl font-bold mb-2">{post.title}</h2>
        <p className="text-sm leading-relaxed mb-4" style={{ color: isDark ? '#9ca3af' : '#64748b' }}>
          {post.description}
        </p>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {categories.map(cat => (
              <span key={cat} className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: isDark ? '#252d3d' : '#f1f5f9', color: isDark ? '#9ca3af' : '#64748b' }}>
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* CTA — Link or PDF */}
        {post.project_link && (
          <motion.a whileTap={{ scale: 0.97 }} href={post.project_link} target="_blank" rel="noopener noreferrer"
            className="btn-gradient w-full flex items-center justify-center gap-2 mb-3"
            style={{ display: 'flex' }}>
            <span>View Case Study</span>
            <ExternalLink size={16} />
          </motion.a>
        )}

        {post.pdf_url && (
          <motion.a whileTap={{ scale: 0.97 }} href={post.pdf_url} target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
            style={{
              background: isDark ? 'rgba(99,102,241,0.1)' : '#f1f5f9',
              border: `1px solid ${isDark ? 'rgba(99,102,241,0.3)' : '#e2e8f0'}`,
              color: '#6366f1',
              display: 'flex',
            }}>
            <FileText size={16} />
            View Case Study PDF
          </motion.a>
        )}

        {!post.project_link && !post.pdf_url && (
          <div className="h-4" />
        )}
      </motion.div>
    </motion.div>
  )
}
