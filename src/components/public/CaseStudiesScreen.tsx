'use client'

import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import type { Post } from '@/types/supabase'

interface Props { posts: Post[]; onBack: () => void; isDark: boolean }

export default function CaseStudiesScreen({ posts, onBack, isDark }: Props) {
  const bg = isDark ? '#0b0f14' : '#f8fafc'
  const cardBg = isDark ? '#141920' : '#ffffff'
  const border = isDark ? '#252d3d' : '#e2e8f0'
  const accent = '#6366f1'

  return (
    <div className="min-h-screen pb-20" style={{ background: bg }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 sticky top-0 z-10"
        style={{ background: bg, borderBottom: `1px solid ${border}` }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}>
          <ChevronLeft size={22} color={accent} />
        </motion.button>
        <h1 className="text-xl font-bold">Case Studies</h1>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: cardBg, border: `1px solid ${border}` }}
          >
            {post.cover_image && (
              <div className="relative h-48">
                <Image src={post.cover_image} alt={post.title} fill className="object-cover" />
              </div>
            )}
            <div className="p-4">
              <span className="text-xs font-semibold mb-1 block" style={{ color: accent }}>
                UX Case Study
              </span>
              <h3 className="text-lg font-bold mb-2">{post.title}</h3>
              <p className="text-sm line-clamp-2" style={{ color: isDark ? '#9ca3af' : '#64748b' }}>
                {post.description}
              </p>
              {post.project_link && (
                <motion.a
                  whileTap={{ scale: 0.97 }}
                  href={post.project_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gradient mt-4 block text-center text-sm"
                >
                  View Case Study
                </motion.a>
              )}
            </div>
          </motion.div>
        ))}

        {!posts.length && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm" style={{ color: '#6b7280' }}>No case studies yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
