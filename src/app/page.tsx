import { Suspense } from 'react'
import PortfolioClient from '@/components/public/PortfolioClient'

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b0f14' }}>
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PortfolioClient />
    </Suspense>
  )
}
