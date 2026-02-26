import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0f14',
        surface: '#141920',
        card: '#1a2030',
        border: '#252d3d',
        accent: '#6366f1',
        'accent-2': '#8b5cf6',
        muted: '#6b7280',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
