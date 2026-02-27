'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Film } from 'lucide-react'
import type { Post } from '@/types/supabase'
import { isVideoUrl } from '@/lib/storage'

interface Props {
  posts: Post[]
  onPostClick: (p: Post) => void
  isDark: boolean
}

export default function PostsGrid({ posts, onPostClick, isDark }: Props) {
  if (!posts.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 16px' }}>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>No posts yet.</p>
      </div>
    )
  }

  return (
    /* 3-col grid, zero gap — full bleed edge to edge */
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2px',
    }}>
      {posts.map((post, i) => {
        const isVid = post.cover_image ? isVideoUrl(post.cover_image) : false
        const hasMultiple = (post.media_urls?.length || 0) > 1

        return (
          <motion.button
            key={post.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onPostClick(post)}
            style={{
              position: 'relative',
              aspectRatio: '1 / 1',
              overflow: 'hidden',
              background: isDark ? '#141920' : '#e2e8f0',
              display: 'block',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            {post.cover_image ? (
              isVid ? (
                <>
                  <video
                    src={post.cover_image}
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.35)',
                  }}>
                    <Film size={22} color="white" />
                  </div>
                </>
              ) : (
                <Image
                  src={post.cover_image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 680px) 33vw, 227px"
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-300 hover:scale-105"
                />
              )
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '8px',
              }}>
                <span style={{ color: '#6b7280', fontSize: '11px', textAlign: 'center', fontWeight: 500 }}>
                  {post.title}
                </span>
              </div>
            )}

            {/* Multi-media badge */}
            {hasMultiple && (
              <div style={{
                position: 'absolute', top: '6px', right: '6px',
                background: 'rgba(0,0,0,0.65)',
                borderRadius: '4px',
                padding: '2px 5px',
                fontSize: '10px',
                color: 'white',
                fontWeight: 700,
              }}>
                +{(post.media_urls?.length || 1) - 1}
              </div>
            )}

            {/* Hover overlay with title */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(99,102,241,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.2s ease',
              padding: '8px',
            }}
              className="grid-hover-overlay"
            >
              <span style={{ color: 'white', fontSize: '12px', fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>
                {post.title}
              </span>
            </div>
          </motion.button>
        )
      })}

      <style>{`
        button:hover .grid-hover-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
