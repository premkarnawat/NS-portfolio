'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Award, Calendar, Building2, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import Image from 'next/image'
import type { Certification } from '@/types/supabase'

interface Props {
  certifications: Certification[]
  onBack: () => void
  isDark: boolean
}

interface CertModalProps {
  cert: Certification
  onClose: () => void
  isDark: boolean
}

function CertViewerModal({ cert, onClose, isDark }: CertModalProps) {
  const bg = isDark ? '#0b0f14' : '#f8fafc'
  const sheetBg = isDark ? '#141920' : '#ffffff'
  const mutedColor = isDark ? '#9ca3af' : '#64748b'

  const isPDF = cert.file_type === 'pdf'
  const isImage = cert.file_type === 'image'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: bg,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '680px',
        margin: '0 auto',
        overflowY: 'auto',
      }}
    >
      {/* Back Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: isDark ? 'rgba(11,15,20,0.95)' : 'rgba(248,250,252,0.95)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: 'none',
          borderBottom: `1px solid ${isDark ? '#1e2535' : '#e2e8f0'}`,
          padding: '14px 20px',
          color: isDark ? '#e2e8f0' : '#0f172a',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
        }}
      >
        <ArrowLeft size={16} />
        Back
      </motion.button>

      {/* Certificate File Preview */}
      {cert.file_url && (
        <div style={{ flex: 1, padding: '16px 16px 0' }}>
          {isPDF ? (
            <div style={{
              width: '100%',
              borderRadius: '16px',
              overflow: 'hidden',
              border: `1px solid ${isDark ? '#252d3d' : '#e2e8f0'}`,
            }}>
              <iframe
                src={`${cert.file_url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                title={cert.title}
                style={{
                  width: '100%',
                  height: '65vh',
                  border: 'none',
                  display: 'block',
                  background: '#fff',
                }}
              />
            </div>
          ) : isImage ? (
            <div style={{
              width: '100%',
              borderRadius: '16px',
              overflow: 'hidden',
              border: `1px solid ${isDark ? '#252d3d' : '#e2e8f0'}`,
              background: isDark ? '#141920' : '#f1f5f9',
            }}>
              <img
                src={cert.file_url}
                alt={cert.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '65vh',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>
          ) : null}
        </div>
      )}

      {/* Certificate Info */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          padding: '20px 20px 40px',
          background: sheetBg,
          borderTop: cert.file_url ? `1px solid ${isDark ? '#1e2535' : '#e2e8f0'}` : 'none',
          marginTop: cert.file_url ? '16px' : '0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Award size={16} color="#6366f1" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#6366f1' }}>Certificate</span>
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px', lineHeight: 1.25, color: isDark ? '#e2e8f0' : '#0f172a' }}>
          {cert.title}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          {cert.issuer && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={14} color={mutedColor} />
              <span style={{ fontSize: '14px', color: mutedColor, fontWeight: 500 }}>{cert.issuer}</span>
            </div>
          )}
          {cert.issue_date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={14} color={mutedColor} />
              <span style={{ fontSize: '14px', color: mutedColor }}>{cert.issue_date}</span>
            </div>
          )}
        </div>
        {cert.description && (
          <p style={{ fontSize: '14px', lineHeight: 1.65, color: mutedColor }}>{cert.description}</p>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function CertificationsScreen({ certifications, onBack, isDark }: Props) {
  const bg = isDark ? '#0b0f14' : '#f8fafc'
  const cardBg = isDark ? '#141920' : '#ffffff'
  const borderColor = isDark ? '#252d3d' : '#e2e8f0'
  const mutedColor = isDark ? '#9ca3af' : '#64748b'
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.25 }}
        style={{ minHeight: '100vh', background: bg, paddingBottom: '100px' }}
      >
        {/* Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: isDark ? 'rgba(11,15,20,0.95)' : 'rgba(248,250,252,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${borderColor}`,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isDark ? '#e2e8f0' : '#0f172a',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="#6366f1" />
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#e2e8f0' : '#0f172a' }}>
              Certifications
            </h1>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 16px' }}>
          {certifications.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 16px', gap: '12px' }}>
              <Award size={40} color={isDark ? '#252d3d' : '#e2e8f0'} />
              <p style={{ color: '#6b7280', fontSize: '14px' }}>No certifications yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {certifications.map((cert, i) => (
                <motion.button
                  key={cert.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, type: 'spring', damping: 22 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCert(cert)}
                  style={{
                    background: cardBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '20px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left',
                    width: '100%',
                    display: 'block',
                  }}
                >
                  {/* Certificate Preview */}
                  {(cert.file_url || cert.cover_image) && (
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '16/9',
                      background: isDark ? '#0d1117' : '#f1f5f9',
                      overflow: 'hidden',
                    }}>
                      {cert.file_type === 'pdf' ? (
                        /* PDF: show a styled placeholder with visible PDF icon */
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          background: 'linear-gradient(135deg, #1a2030, #252d3d)',
                        }}>
                          <div style={{
                            width: '56px',
                            height: '70px',
                            background: 'white',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                          }}>
                            <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700 }}>PDF</span>
                          </div>
                          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Click to view PDF</span>
                        </div>
                      ) : cert.file_url ? (
                        <img
                          src={cert.file_url}
                          alt={cert.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            display: 'block',
                            background: isDark ? '#0d1117' : '#f8fafc',
                          }}
                        />
                      ) : cert.cover_image ? (
                        <img
                          src={cert.cover_image}
                          alt={cert.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            display: 'block',
                          }}
                        />
                      ) : null}

                      {/* Tap to View overlay */}
                      <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'rgba(99,102,241,0.9)',
                        borderRadius: '20px',
                        padding: '4px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <ZoomIn size={11} color="white" />
                        <span style={{ color: 'white', fontSize: '11px', fontWeight: 600 }}>View</span>
                      </div>
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ padding: '16px 18px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1.3, color: isDark ? '#e2e8f0' : '#0f172a', flex: 1 }}>
                        {cert.title}
                      </h3>
                      <div style={{
                        flexShrink: 0,
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        background: 'rgba(99,102,241,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Award size={16} color="#6366f1" />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                      {cert.issuer && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Building2 size={12} color={mutedColor} />
                          <span style={{ fontSize: '12px', color: mutedColor, fontWeight: 500 }}>{cert.issuer}</span>
                        </div>
                      )}
                      {cert.issue_date && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={12} color={mutedColor} />
                          <span style={{ fontSize: '12px', color: mutedColor }}>{cert.issue_date}</span>
                        </div>
                      )}
                    </div>

                    {cert.description && (
                      <p style={{ fontSize: '13px', color: mutedColor, marginTop: '8px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {cert.description}
                      </p>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Certificate Viewer Modal */}
      <AnimatePresence>
        {selectedCert && (
          <CertViewerModal
            cert={selectedCert}
            onClose={() => setSelectedCert(null)}
            isDark={isDark}
          />
        )}
      </AnimatePresence>
    </>
  )
}
