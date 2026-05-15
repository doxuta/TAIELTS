import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Meridian Design System
        sidebar: {
          DEFAULT: '#080B1A',
          foreground: '#C7CDE8',
          border: '#151929',
          accent: '#1A1F38',
          'accent-foreground': '#E8EBFF',
        },
        brand: {
          DEFAULT: '#6366F1',
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        amber: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8FAFC',
          tertiary: '#F1F5F9',
          border: '#E2E8F0',
        },
        ink: {
          DEFAULT: '#0F172A',
          secondary: '#475569',
          tertiary: '#94A3B8',
          placeholder: '#CBD5E1',
        },
        cream: { DEFAULT: '#DEDBC8', dark: '#E1E0CC' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-cal)', 'var(--font-inter)', 'sans-serif'],
        cormorant: ['var(--font-cormorant)', 'serif'],
        serif: ['"Instrument Serif"', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 6px -2px rgb(0 0 0 / 0.06)',
        'sidebar': '1px 0 0 0 rgb(99 102 241 / 0.08)',
        'glow': '0 0 20px 0 rgb(99 102 241 / 0.2)',
        'glow-amber': '0 0 20px 0 rgb(245 158 11 / 0.25)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-left': 'slideLeft 0.4s ease-out forwards',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'meridian-hero': 'linear-gradient(135deg, #080B1A 0%, #0D1030 50%, #080B1A 100%)',
        'card-shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
        'brand-gradient': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        'amber-gradient': 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
