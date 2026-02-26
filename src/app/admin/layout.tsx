import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin – Nirbhava Portfolio',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
