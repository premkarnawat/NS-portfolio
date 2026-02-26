'use client'

import { motion } from 'framer-motion'
import { X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import type { Post } from '@/types/supabase'

interface Props { post: Post; onClose: () => void; isDark: boolean }

export default function PostModal({ post, onClose, isDark }: Props) {
  const bg = isDark ? '#0b0f14' : '#f8fafc'
  const cardBg = isDark ? '#141920' : '#ffffff'
  const border = isDark ? '#252d3d' : '#e2e8f0'

  const categories = post.category ? post.category.split(',').map(c => c.trim()) : []

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: bg, maxWidth: '480px', margin: '0 auto' }}
    >
      {/* Image area */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="relative bg-black"
        style={{ height: '55vw', maxHeight: '280px' }}
      >
        {post.cover_image ? (
          <Image src={post.cover_image} alt={post.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1a2030, #252d3d)' }}>
            <span className="text-white font-bold text-lg">{post.title}</span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-between px-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            <ChevronLeft size={18} color="white" />
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            <ChevronRight size={18} color="white" />
          </div>
        </div>
      </motion.div>

      {/* Info sheet */}
      <motion.div
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="flex-1 rounded-t-3xl p-6 overflow-y-auto"
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
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(cat => (
              <span
                key={cat}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: isDark ? '#252d3d' : '#f1f5f9', color: isDark ? '#9ca3af' : '#64748b' }}
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {post.project_link && (
          <motion.a
            whileTap={{ scale: 0.97 }}
            href={post.project_link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gradient w-full flex items-center justify-center gap-2"
            style={{ display: 'flex' }}
          >
            <span>View Case Study</span>
            <ExternalLink size={16} />
          </motion.a>
        )}
      </motion.div>
    </motion.div>
  )
}
