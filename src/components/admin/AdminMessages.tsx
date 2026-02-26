'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Trash2, Mail, Loader2 } from 'lucide-react'
import type { Message } from '@/types/supabase'

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMessages = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
    setMessages(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchMessages() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return
    const supabase = createClient()
    await supabase.from('messages').delete().eq('id', id)
    toast.success('Message deleted')
    fetchMessages()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Messages ({messages.length})</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin" color="#6366f1" /></div>
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-5"
              style={{ background: '#141920', border: '1px solid #252d3d' }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm text-white">{msg.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
                      {msg.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail size={11} color="#6b7280" />
                    <span className="text-xs" style={{ color: '#6b7280' }}>{msg.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs" style={{ color: '#6b7280' }}>
                    {formatDate(msg.created_at)}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(msg.id)}
                    className="p-1.5 rounded-lg"
                    style={{ background: 'rgba(239,68,68,0.1)' }}
                  >
                    <Trash2 size={14} color="#ef4444" />
                  </motion.button>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>{msg.message}</p>
              <div className="mt-3">
                <a
                  href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                  className="text-xs font-medium"
                  style={{ color: '#6366f1' }}
                >
                  Reply via email →
                </a>
              </div>
            </motion.div>
          ))}
          {!messages.length && (
            <div className="flex flex-col items-center justify-center py-16">
              <Mail size={40} color="#252d3d" className="mb-3" />
              <p className="text-sm" style={{ color: '#6b7280' }}>No messages yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
