import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        pos: {
          ink: '#0f172a',
          muted: '#64748b',
          line: '#e2e8f0',
          surface: '#f8fafc',
          accent: '#334155',
          accent2: '#1e293b',
          success: '#10b981',
          danger: '#ef4444',
          warn: '#f59e0b',
        },
      },
      boxShadow: {
        pos: '0 4px 24px -4px rgb(15 23 42 / 0.08), 0 8px 16px -8px rgb(15 23 42 / 0.06)',
        'pos-lg': '0 12px 40px -8px rgb(15 23 42 / 0.12)',
        glow: '0 0 0 1px rgb(15 23 42 / 0.06), 0 8px 24px -6px rgb(15 23 42 / 0.12)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
} satisfies Config
