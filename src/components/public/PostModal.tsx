'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, ChevronLeft, ChevronRight, FileText, Film, Play, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { useState, useRef } from 'react'
import type { Post } from '@/types/supabase'
import { isVideoUrl } from '@/lib/storage'

interface Props { post: Post; onClose: () => void; isDark: boolean }

export default function PostModal({ post, onClose, isDark }: Props) {
  const bg = isDark ? '#0b0f14' : '#f8fafc'
  const sheetBg = isDark ? '#141920' : '#ffffff'
  const mutedColor = isDark ? '#9ca3af' : '#64748b'
  const chipBg = isDark ? '#252d3d' : '#f1f5f9'
  const chipColor = isDark ? '#9ca3af' : '#64748b'

  // Build unified media list
  const allMedia: { url: string; type: 'image' | 'video' }[] = (() => {
    if (post.media_urls?.length) {
      return post.media_urls.map((url, i) => ({
        url,
        type: (post.media_types?.[i] as 'image' | 'video') || (isVideoUrl(url) ? 'video' : 'image'),
      }))
    }
    if (post.cover_image) {
      return [{ url: post.cover_image, type: isVideoUrl(post.cover_image) ? 'video' : 'image' as 'image' | 'video' }]
    }
    return []
  })()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const categories = post.category ? post.category.split(',').map(c => c.trim()).filter(Boolean) : []
  const currentMedia = allMedia[currentIndex]
  const hasMultiple = allMedia.length > 1

  const goTo = (dir: 1 | -1) => {
    setPlaying(false)
    if (videoRef.current) videoRef.current.pause()
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
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: bg,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '680px',
        margin: '0 auto',
        overflowY: 'auto',
      }}
    >
      {/* ── CLOSE / BACK BUTTON — clearly visible top-left ── */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: 'none',
          borderRadius: '24px',
          padding: '8px 14px 8px 10px',
          color: 'white',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <ArrowLeft size={16} color="white" />
        Back
      </motion.button>

      {/* ── MEDIA AREA — fixed aspect ratio, full width ── */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#000', flexShrink: 0 }}>
        <AnimatePresence mode="wait">
          {currentMedia ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              style={{ position: 'absolute', inset: 0 }}
            >
              {currentMedia.type === 'video' ? (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <video
                    ref={videoRef}
                    src={currentMedia.url}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    playsInline
                    loop
                    onEnded={() => setPlaying(false)}
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={togglePlay}
                    style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: playing ? 'transparent' : 'rgba(0,0,0,0.3)',
                      border: 'none', cursor: 'pointer',
                    }}
                  >
                    {!playing && (
                      <div style={{
                        width: '60px', height: '60px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.92)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Play size={24} color="#0b0f14" fill="#0b0f14" style={{ marginLeft: 3 }} />
                      </div>
                    )}
                  </motion.button>
                  <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    background: 'rgba(0,0,0,0.6)', borderRadius: '20px',
                    padding: '4px 10px',
                  }}>
                    <Film size={11} color="white" />
                    <span style={{ color: 'white', fontSize: '11px' }}>Video</span>
                  </div>
                </div>
              ) : (
                <Image
                  src={currentMedia.url}
                  alt={post.title}
                  fill
                  sizes="(max-width: 680px) 100vw, 680px"
                  style={{ objectFit: 'cover' }}
                />
              )}
            </motion.div>
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #1a2030, #252d3d)',
            }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>{post.title}</span>
            </div>
          )}
        </AnimatePresence>

        {/* Prev / Next arrows */}
        {hasMultiple && (
          <>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => goTo(-1)} style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              zIndex: 5, width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ChevronLeft size={20} color="white" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => goTo(1)} style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              zIndex: 5, width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ChevronRight size={20} color="white" />
            </motion.button>
          </>
        )}

        {/* Dot indicators */}
        {hasMultiple && (
          <div style={{
            position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '6px', zIndex: 5,
          }}>
            {allMedia.map((_, i) => (
              <button key={i} onClick={() => { setCurrentIndex(i); setPlaying(false) }}
                style={{
                  width: i === currentIndex ? 18 : 7,
                  height: 7,
                  borderRadius: '4px',
                  background: i === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}

        {/* Thumbnail strip top-right */}
        {hasMultiple && (
          <div style={{
            position: 'absolute', top: '14px', right: '14px',
            display: 'flex', gap: '4px', zIndex: 5,
          }}>
            {allMedia.slice(0, 5).map((m, i) => (
              <button key={i} onClick={() => { setCurrentIndex(i); setPlaying(false) }}
                style={{
                  width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden',
                  border: `2px solid ${i === currentIndex ? '#6366f1' : 'rgba(255,255,255,0.3)'}`,
                  opacity: i === currentIndex ? 1 : 0.65,
                  transition: 'all 0.15s',
                  flexShrink: 0, cursor: 'pointer', padding: 0,
                  background: '#252d3d',
                }}>
                {m.type === 'video' ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Film size={12} color="#9ca3af" />
                  </div>
                ) : (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Image src={m.url} alt="" fill style={{ objectFit: 'cover' }} />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── CAPTION SHEET — clearly below image ── */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', damping: 25 }}
        style={{
          background: sheetBg,
          flex: 1,
          padding: '20px 20px 32px',
          borderTop: `1px solid ${isDark ? '#1e2535' : '#e2e8f0'}`,
        }}
      >
        {/* Brand label */}
        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#6366f1', letterSpacing: '0.02em' }}>
            nirbhava.design
          </span>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px', lineHeight: 1.25 }}>
          {post.title}
        </h2>

        {/* Description */}
        <p style={{ fontSize: '14px', lineHeight: 1.65, color: mutedColor, marginBottom: '16px' }}>
          {post.description}
        </p>

        {/* Category chips */}
        {categories.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {categories.map(cat => (
              <span key={cat} style={{
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 500,
                background: chipBg,
                color: chipColor,
              }}>
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* CTA Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {post.project_link && (
            <motion.a
              whileTap={{ scale: 0.97 }}
              href={post.project_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: '14px',
                color: 'white',
                fontWeight: 600,
                fontSize: '15px',
                padding: '14px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                textDecoration: 'none',
              }}
            >
              View Case Study
              <ExternalLink size={16} />
            </motion.a>
          )}

          {post.pdf_url && (
            <motion.a
              whileTap={{ scale: 0.97 }}
              href={post.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                borderRadius: '14px',
                color: '#6366f1',
                fontWeight: 600,
                fontSize: '15px',
                padding: '14px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                textDecoration: 'none',
                background: isDark ? 'rgba(99,102,241,0.1)' : '#f1f5f9',
                border: `1px solid ${isDark ? 'rgba(99,102,241,0.25)' : '#e2e8f0'}`,
              }}
            >
              <FileText size={16} />
              View Case Study PDF
            </motion.a>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
