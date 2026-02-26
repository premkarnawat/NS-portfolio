'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { Post } from '@/types/supabase'

interface Props {
  posts: Post[]
  onPostClick: (p: Post) => void
  isDark: boolean
}

export default function PostsGrid({ posts, onPostClick, isDark }: Props) {
  if (!posts.length) {
    return (
      <div className="flex items-center justify-center py-16 px-4">
        <p style={{ color: '#6b7280' }} className="text-sm">No posts yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-0.5 px-0">
      {posts.map((post, i) => (
        <motion.button
          key={post.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onPostClick(post)}
          className="relative aspect-square overflow-hidden"
          style={{ background: isDark ? '#141920' : '#f1f5f9' }}
        >
          {post.cover_image ? (
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-2">
              <span className="text-xs text-center font-medium" style={{ color: '#6b7280' }}>
                {post.title}
              </span>
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.3)' }}>
            <div className="text-white text-xs font-semibold text-center px-2">
              {post.title}
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  )
}
