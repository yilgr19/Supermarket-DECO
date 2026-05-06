import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pos: {
          primary: '#1e40af',
          secondary: '#1d4ed8',
          success: '#16a34a',
          danger: '#dc2626',
          warning: '#d97706',
          surface: '#f8fafc',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
