'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  User, Image as ImageIcon, Link2, Mail, LayoutDashboard,
  LogOut, Menu, X, Star, Grid3X3
} from 'lucide-react'
import toast from 'react-hot-toast'
import AdminProfile from './AdminProfile'
import AdminPosts from './AdminPosts'
import AdminHighlights from './AdminHighlights'
import AdminExplore from './AdminExplore'
import AdminMessages from './AdminMessages'

type Section = 'profile' | 'posts' | 'highlights' | 'explore' | 'messages'

const navItems = [
  { id: 'profile' as Section, label: 'Profile', icon: User },
  { id: 'posts' as Section, label: 'Posts', icon: Grid3X3 },
  { id: 'highlights' as Section, label: 'Highlights', icon: Star },
  { id: 'explore' as Section, label: 'Explore Links', icon: Link2 },
  { id: 'messages' as Section, label: 'Messages', icon: Mail },
]

export default function AdminDashboardClient() {
  const [section, setSection] = useState<Section>('profile')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Logged out')
    router.push('/admin/login')
    router.refresh()
  }

  const sectionComponents: Record<Section, React.ReactNode> = {
    profile: <AdminProfile />,
    posts: <AdminPosts />,
    highlights: <AdminHighlights />,
    explore: <AdminExplore />,
    messages: <AdminMessages />,
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0b0f14' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 h-screen sticky top-0"
        style={{ background: '#141920', borderRight: '1px solid #252d3d' }}>
        <SidebarContent
          section={section}
          setSection={setSection}
          onLogout={handleLogout}
          onClose={() => {}}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex md:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 modal-backdrop"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-64 h-full flex flex-col"
              style={{ background: '#141920' }}
            >
              <SidebarContent
                section={section}
                setSection={(s) => { setSection(s); setSidebarOpen(false) }}
                onLogout={handleLogout}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between px-4 py-3 sticky top-0 z-40"
          style={{ background: '#141920', borderBottom: '1px solid #252d3d' }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSidebarOpen(true)}>
            <Menu size={22} color="#e2e8f0" />
          </motion.button>
          <span className="font-bold text-sm">
            {navItems.find(n => n.id === section)?.label}
          </span>
          <div className="w-6" />
        </div>

        <main className="flex-1 p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {sectionComponents[section]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({
  section, setSection, onLogout, onClose
}: {
  section: Section
  setSection: (s: Section) => void
  onLogout: () => void
  onClose: () => void
}) {
  return (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <div className="flex items-center justify-between mb-8 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <span className="text-white font-black text-base">N</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white">Admin Panel</p>
            <p className="text-xs" style={{ color: '#6b7280' }}>nirbhava.design</p>
          </div>
        </div>
        <button onClick={onClose} className="md:hidden">
          <X size={18} color="#6b7280" />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSection(id)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
            style={{
              background: section === id ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: section === id ? '#6366f1' : '#9ca3af',
            }}
          >
            <Icon size={18} />
            {label}
            {section === id && (
              <motion.div
                layoutId="sidebar-indicator"
                className="ml-auto w-1.5 h-1.5 rounded-full"
                style={{ background: '#6366f1' }}
              />
            )}
          </motion.button>
        ))}
      </nav>

      {/* Logout */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mt-4"
        style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}
      >
        <LogOut size={18} />
        Sign Out
      </motion.button>
    </div>
  )
}
