'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProfile } from '@/hooks/useProfile'
import { usePosts } from '@/hooks/usePosts'
import { useHighlights } from '@/hooks/useHighlights'
import { useExploreLinks } from '@/hooks/useExploreLinks'
import ProfileHeader from './ProfileHeader'
import HighlightsRow from './HighlightsRow'
import PostsGrid from './PostsGrid'
import BottomNav from './BottomNav'
import MessageModal from './MessageModal'
import ServicesModal from './ServicesModal'
import ExploreModal from './ExploreModal'
import PostModal from './PostModal'
import StoryViewer from './StoryViewer'
import ResumeScreen from './ResumeScreen'
import CaseStudiesScreen from './CaseStudiesScreen'
import type { Post, Highlight } from '@/types/supabase'

export type Screen = 'home' | 'resume' | 'case-studies'
export type Modal = 'message' | 'services' | 'explore' | null

export default function PortfolioClient() {
  const { profile, loading: profileLoading } = useProfile()
  const { posts, loading: postsLoading } = usePosts()
  const { highlights } = useHighlights()
  const { links } = useExploreLinks()

  const [screen, setScreen] = useState<Screen>('home')
  const [activeModal, setActiveModal] = useState<Modal>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [selectedStory, setSelectedStory] = useState<Highlight | null>(null)
  const [isDark, setIsDark] = useState(true)

  if (profileLoading || postsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b0f14' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen relative"
      style={{ background: isDark ? '#0b0f14' : '#f8fafc', color: isDark ? '#e2e8f0' : '#0f172a', maxWidth: '480px', margin: '0 auto' }}
    >
      <AnimatePresence mode="wait">
        {screen === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="pb-20"
          >
            <ProfileHeader
              profile={profile}
              postCount={posts.length}
              onMessage={() => setActiveModal('message')}
              onServices={() => setActiveModal('services')}
              onHireMe={() => setActiveModal('message')}
              isDark={isDark}
            />
            <HighlightsRow
              highlights={highlights}
              onStoryOpen={(h) => setSelectedStory(h)}
              isDark={isDark}
            />
            <PostsGrid
              posts={posts}
              onPostClick={(p) => setSelectedPost(p)}
              isDark={isDark}
            />
          </motion.div>
        )}

        {screen === 'resume' && (
          <motion.div
            key="resume"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <ResumeScreen
              resumeUrl={profile?.resume_url || null}
              onBack={() => setScreen('home')}
              isDark={isDark}
            />
          </motion.div>
        )}

        {screen === 'case-studies' && (
          <motion.div
            key="case-studies"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <CaseStudiesScreen
              posts={posts}
              onBack={() => setScreen('home')}
              isDark={isDark}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <BottomNav
        screen={screen}
        onScreen={setScreen}
        onExplore={() => setActiveModal('explore')}
        onThemeToggle={() => setIsDark(!isDark)}
        isDark={isDark}
      />

      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'message' && (
          <MessageModal onClose={() => setActiveModal(null)} isDark={isDark} />
        )}
        {activeModal === 'services' && (
          <ServicesModal services={profile?.services || []} onClose={() => setActiveModal(null)} isDark={isDark} />
        )}
        {activeModal === 'explore' && (
          <ExploreModal links={links} onClose={() => setActiveModal(null)} isDark={isDark} />
        )}
      </AnimatePresence>

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} isDark={isDark} />
        )}
      </AnimatePresence>

      {/* Story Viewer */}
      <AnimatePresence>
        {selectedStory && (
          <StoryViewer story={selectedStory} onClose={() => setSelectedStory(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
