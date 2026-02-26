'use client'

import { motion } from 'framer-motion'
import { Grid3X3, Compass, Sun, Moon, FolderOpen, FileText } from 'lucide-react'
import type { Screen } from './PortfolioClient'

interface Props {
  screen: Screen
  onScreen: (s: Screen) => void
  onExplore: () => void
  onThemeToggle: () => void
  isDark: boolean
}

export default function BottomNav({ screen, onScreen, onExplore, onThemeToggle, isDark }: Props) {
  const bg = isDark ? 'rgba(11,15,20,0.95)' : 'rgba(248,250,252,0.95)'
  const border = isDark ? '#252d3d' : '#e2e8f0'
  const activeColor = '#6366f1'
  const inactiveColor = isDark ? '#6b7280' : '#94a3b8'

  const items = [
    { icon: Grid3X3, action: () => onScreen('home'), active: screen === 'home', key: 'grid' },
    { icon: Compass, action: onExplore, active: false, key: 'explore' },
    { icon: isDark ? Sun : Moon, action: onThemeToggle, active: false, key: 'theme' },
    { icon: FolderOpen, action: () => onScreen('case-studies'), active: screen === 'case-studies', key: 'folder' },
    { icon: FileText, action: () => onScreen('resume'), active: screen === 'resume', key: 'resume' },
  ]

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40"
      style={{ borderTop: `1px solid ${border}`, background: bg, backdropFilter: 'blur(20px)' }}
    >
      <div className="flex justify-around items-center py-3 px-4">
        {items.map(({ icon: Icon, action, active, key }) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.15 }}
            onClick={action}
            className="p-2 rounded-xl transition-colors"
            style={{ color: active ? activeColor : inactiveColor }}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            {active && (
              <motion.div
                layoutId="nav-indicator"
                className="w-1 h-1 rounded-full mx-auto mt-1"
                style={{ background: activeColor }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
