'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface Props { services: string[]; onClose: () => void; isDark: boolean }

export default function ServicesModal({ services, onClose, isDark }: Props) {
  const bg = isDark ? '#141920' : '#ffffff'
  const chipBg = isDark ? 'rgba(255,255,255,0.07)' : '#f1f5f9'
  const chipBorder = isDark ? '#252d3d' : '#e2e8f0'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 modal-backdrop"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-[calc(100%-32px)] max-w-[448px] rounded-2xl p-5"
        style={{ background: bg, border: `1px solid ${chipBorder}` }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold">My Services</h3>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}>
            <X size={18} color="#6b7280" />
          </motion.button>
        </div>
        <div className="flex flex-wrap gap-2">
          {services.length ? services.map((s, i) => (
            <motion.span
              key={s}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ background: chipBg, border: `1px solid ${chipBorder}` }}
            >
              {s}
            </motion.span>
          )) : (
            ['Graphic Design', 'UI/UX Design', 'Logo Design', 'Packaging Design', 'UX Research', 'Social Media Marketing']
              .map((s, i) => (
                <motion.span
                  key={s}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{ background: chipBg, border: `1px solid ${chipBorder}` }}
                >
                  {s}
                </motion.span>
              ))
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
