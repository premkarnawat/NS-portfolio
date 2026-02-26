import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nirbhava Sawant – UI/UX Designer',
  description: 'Designing clarity through simplicity. Creating accessible, human-centered digital experiences.',
  openGraph: {
    title: 'Nirbhava Sawant – UI/UX Designer',
    description: 'Portfolio of Nirbhava Sawant, UI/UX Designer based in Pune.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1a2030',
              color: '#e2e8f0',
              border: '1px solid #252d3d',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  )
}
