'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  subject: z.string().min(3, 'Subject required'),
  message: z.string().min(10, 'Message too short'),
})
type FormData = z.infer<typeof schema>

interface Props { onClose: () => void; isDark: boolean }

export default function MessageModal({ onClose, isDark }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    const supabase = createClient()
    const { error } = await supabase.from('messages').insert([data])
    if (error) {
      toast.error('Failed to send message')
    } else {
      toast.success('Message sent! 🎉')
      onClose()
    }
  }

  const bg = isDark ? '#141920' : '#ffffff'
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'
  const border = isDark ? '#252d3d' : '#e2e8f0'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center modal-backdrop"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-[480px] rounded-t-3xl p-6"
        style={{ background: bg, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: border }} />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Send a Message</h2>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="p-1">
            <X size={22} color="#6b7280" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {[
            { name: 'name', label: 'Name', placeholder: 'Your name', type: 'text' },
            { name: 'email', label: 'Email', placeholder: 'your@email.com', type: 'email' },
            { name: 'subject', label: 'Subject', placeholder: "What's this about?", type: 'text' },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1.5">{field.label}</label>
              <input
                {...register(field.name as keyof FormData)}
                type={field.type}
                placeholder={field.placeholder}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: inputBg,
                  border: `1px solid ${errors[field.name as keyof FormData] ? '#ef4444' : border}`,
                  color: isDark ? '#e2e8f0' : '#0f172a',
                }}
              />
              {errors[field.name as keyof FormData] && (
                <p className="text-red-400 text-xs mt-1">{errors[field.name as keyof FormData]?.message}</p>
              )}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium mb-1.5">Message</label>
            <textarea
              {...register('message')}
              placeholder="Write your message..."
              rows={4}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
              style={{
                background: inputBg,
                border: `1px solid ${errors.message ? '#ef4444' : border}`,
                color: isDark ? '#e2e8f0' : '#0f172a',
              }}
            />
            {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isSubmitting}
            className="btn-gradient w-full mt-2"
            style={{ opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  )
}
