'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('Welcome back!')
      router.push('/admin/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0b0f14' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <span className="text-white font-black text-xl">N</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Sign in to manage your portfolio</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="relative">
            <Mail size={16} color="#6b7280" className="absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid #252d3d',
                color: '#e2e8f0',
              }}
              required
            />
          </div>

          <div className="relative">
            <Lock size={16} color="#6b7280" className="absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-11 pr-11 py-3.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid #252d3d',
                color: '#e2e8f0',
              }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <EyeOff size={16} color="#6b7280" /> : <Eye size={16} color="#6b7280" />}
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="btn-gradient mt-2"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
