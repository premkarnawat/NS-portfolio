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
  const bg = isDark ? 'rgba(11,15,20,0.96)' : 'rgba(248,250,252,0.96)'
  const borderColor = isDark ? '#1e2535' : '#e2e8f0'
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
    /* Fixed to bottom, aligned to the same 680px container */
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 40,
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '680px',
        background: bg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: `1px solid ${borderColor}`,
        pointerEvents: 'all',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '10px 16px',
          paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
        }}>
          {items.map(({ icon: Icon, action, active, key }) => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.82 }}
              whileHover={{ scale: 1.12 }}
              onClick={action}
              style={{
                padding: '8px 14px',
                borderRadius: '12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                color: active ? activeColor : inactiveColor,
              }}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              {active && (
                <motion.div
                  layoutId="nav-dot"
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: activeColor,
                  }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
