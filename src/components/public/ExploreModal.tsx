'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { X, Globe } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import type { ExploreLink } from '@/types/supabase'

interface Props { links: ExploreLink[]; onClose: () => void; isDark: boolean }

// Default neon colors cycling per card if no custom color set
const NEON_PALETTE = [
  '#6366f1', // indigo
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f59e0b', // amber
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#f43f5e', // rose
  '#3b82f6', // blue
]

function NeonCard({ link, index, isDark }: { link: ExploreLink; index: number; isDark: boolean }) {
  const neonColor = link.neon_color || NEON_PALETTE[index % NEON_PALETTE.length]
  const cardRef = useRef<HTMLAnchorElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }

  return (
    <motion.a
      ref={cardRef}
      href={link.link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 24, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 280, damping: 22 }}
      whileTap={{ scale: 0.96 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); mouseX.set(0); mouseY.set(0) }}
      className="relative rounded-2xl p-5 flex flex-col items-center gap-3 text-center overflow-hidden cursor-pointer"
      style={{
        background: isDark ? 'rgba(20,25,36,0.9)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${isHovered ? neonColor + '60' : 'rgba(255,255,255,0.06)'}`,
        transition: 'border-color 0.3s ease',
        boxShadow: isHovered
          ? `0 0 20px ${neonColor}30, 0 0 60px ${neonColor}10, inset 0 0 20px ${neonColor}05`
          : '0 2px 10px rgba(0,0,0,0.2)',
      }}
    >
      {/* Animated neon glow spotlight following mouse */}
      <motion.div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 120,
          height: 120,
          background: `radial-gradient(circle, ${neonColor}35 0%, transparent 70%)`,
          x: springX,
          y: springY,
          left: '50%',
          top: '50%',
          translateX: '-50%',
          translateY: '-50%',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Neon corner accent */}
      <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-3xl pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${neonColor}25, transparent 70%)`,
          opacity: isHovered ? 1 : 0.4,
          transition: 'opacity 0.3s ease',
        }}
      />
      <div className="absolute bottom-0 left-0 w-10 h-10 rounded-tr-3xl pointer-events-none"
        style={{
          background: `radial-gradient(circle at bottom left, ${neonColor}20, transparent 70%)`,
          opacity: isHovered ? 1 : 0.3,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Neon border glow lines */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${neonColor}15 0%, transparent 50%, ${neonColor}10 100%)`,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* Icon container with neon ring */}
      <div className="relative w-14 h-14 flex-shrink-0">
        {/* Neon ring */}
        <div className="absolute inset-0 rounded-full transition-all duration-300"
          style={{
            background: `conic-gradient(${neonColor}, ${neonColor}88, ${neonColor}33, ${neonColor})`,
            padding: '2px',
            boxShadow: isHovered ? `0 0 12px ${neonColor}80, 0 0 24px ${neonColor}40` : `0 0 6px ${neonColor}40`,
            transition: 'box-shadow 0.3s ease',
          }}>
          <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
            style={{ background: isDark ? '#0d1117' : '#f8fafc' }}>
            {link.icon_image ? (
              <Image
                src={link.icon_image}
                alt={link.title}
                width={40}
                height={40}
                className="w-9 h-9 object-contain rounded-full"
              />
            ) : (
              <span className="text-xl font-bold" style={{ color: neonColor }}>
                {link.title[0]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Title with neon text glow on hover */}
      <span
        className="text-sm font-semibold relative z-10 transition-all duration-300"
        style={{
          color: isHovered ? neonColor : (isDark ? '#e2e8f0' : '#0f172a'),
          textShadow: isHovered ? `0 0 12px ${neonColor}80` : 'none',
        }}
      >
        {link.title}
      </span>

      {/* Bottom neon line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300"
        style={{
          width: isHovered ? '60%' : '0%',
          background: `linear-gradient(90deg, transparent, ${neonColor}, transparent)`,
          boxShadow: `0 0 8px ${neonColor}`,
        }}
      />
    </motion.a>
  )
}

export default function ExploreModal({ links, onClose, isDark }: Props) {
  const bg = isDark ? 'rgba(7,10,15,0.97)' : 'rgba(248,250,252,0.97)'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
      style={{ background: bg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
    >
      {/* Ambient neon background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ background: '#6366f1', top: '-5%', left: '-10%' }} />
        <div className="absolute w-48 h-48 rounded-full blur-3xl opacity-8"
          style={{ background: '#ec4899', bottom: '10%', right: '-5%' }} />
        <div className="absolute w-32 h-32 rounded-full blur-2xl opacity-8"
          style={{ background: '#06b6d4', top: '40%', right: '20%' }} />
      </div>

      <div className="h-full overflow-y-auto max-w-[480px] mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold" style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}>
              Explore Me
            </h2>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <Globe size={22} color="#6366f1" />
            </motion.div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <X size={18} color={isDark ? '#e2e8f0' : '#0f172a'} />
          </motion.button>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {links.map((link, i) => (
            <NeonCard key={link.id} link={link} index={i} isDark={isDark} />
          ))}
        </div>

        {!links.length && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm" style={{ color: '#6b7280' }}>No links added yet.</p>
          </div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm mt-8"
          style={{ color: '#4b5563' }}
        >
          Click any card to visit my profile
        </motion.p>
      </div>
    </motion.div>
  )
}
