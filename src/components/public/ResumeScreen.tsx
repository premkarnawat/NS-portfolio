'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, Download } from 'lucide-react'

interface Props { resumeUrl: string | null; onBack: () => void; isDark: boolean }

export default function ResumeScreen({ resumeUrl, onBack, isDark }: Props) {
  const bg = isDark ? '#0b0f14' : '#f8fafc'
  const cardBg = isDark ? '#141920' : '#ffffff'
  const border = isDark ? '#252d3d' : '#e2e8f0'
  const accent = '#6366f1'

  return (
    <div className="min-h-screen pb-20" style={{ background: bg }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 sticky top-0 z-10"
        style={{ background: bg, borderBottom: `1px solid ${border}` }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="flex items-center gap-1">
          <ChevronLeft size={20} color={accent} />
          <span className="text-sm font-medium" style={{ color: accent }}>Back</span>
        </motion.button>
        <h1 className="text-base font-bold">Resume</h1>
        {resumeUrl ? (
          <motion.a
            whileTap={{ scale: 0.95 }}
            href={resumeUrl}
            download
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <Download size={14} />
            Download
          </motion.a>
        ) : <div className="w-20" />}
      </div>

      {resumeUrl ? (
        <div className="px-4 pt-4">
          <iframe
            src={resumeUrl}
            className="w-full rounded-2xl border"
            style={{ height: 'calc(100vh - 140px)', border: `1px solid ${border}`, background: cardBg }}
          />
          <motion.a
            whileTap={{ scale: 0.97 }}
            href={resumeUrl}
            download
            className="btn-gradient w-full flex items-center justify-center gap-2 mt-4"
            style={{ display: 'flex' }}
          >
            <Download size={16} />
            Download Full Resume
          </motion.a>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ background: isDark ? '#252d3d' : '#f1f5f9' }}>
            <Download size={32} color={accent} />
          </div>
          <h3 className="text-lg font-bold mb-2">Resume Not Available</h3>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            The resume hasn&apos;t been uploaded yet. Please check back later.
          </p>
        </div>
      )}
    </div>
  )
}
