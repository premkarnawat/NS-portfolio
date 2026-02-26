'use client'

import { motion } from 'framer-motion'
import { X, Globe } from 'lucide-react'
import Image from 'next/image'
import type { ExploreLink } from '@/types/supabase'

interface Props { links: ExploreLink[]; onClose: () => void; isDark: boolean }

export default function ExploreModal({ links, onClose, isDark }: Props) {
  const bg = isDark ? 'rgba(11,15,20,0.97)' : 'rgba(248,250,252,0.97)'
  const cardBg = isDark ? 'rgba(30,38,55,0.8)' : 'rgba(255,255,255,0.8)'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
      style={{ background: bg, backdropFilter: 'blur(20px)' }}
    >
      <div className="h-full overflow-y-auto max-w-[480px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Explore Me</h2>
            <Globe size={22} color="#6366f1" />
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: isDark ? '#252d3d' : '#f1f5f9' }}
          >
            <X size={18} />
          </motion.button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {links.map((link, i) => (
            <motion.a
              key={link.id}
              href={link.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(99,102,241,0.2)' }}
              whileTap={{ scale: 0.97 }}
              className="rounded-2xl p-5 flex flex-col items-center gap-3 text-center"
              style={{
                background: cardBg,
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '2px' }}>
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
                  style={{ background: isDark ? '#1a2030' : '#fff' }}>
                  {link.icon_image ? (
                    <Image src={link.icon_image} alt={link.title} width={48} height={48} className="w-10 h-10 object-contain rounded-full" />
                  ) : (
                    <span className="text-xl font-bold" style={{ color: '#6366f1' }}>{link.title[0]}</span>
                  )}
                </div>
              </div>
              <span className="text-sm font-semibold">{link.title}</span>
            </motion.a>
          ))}
        </div>

        <p className="text-center text-sm mt-8" style={{ color: '#6b7280' }}>
          Click any card to visit my profile
        </p>
      </div>
    </motion.div>
  )
}
