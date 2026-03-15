/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Flamia Brand Colors — Flame Gold System
        flame: {
          50:  '#FFF8F0',
          100: '#FFEFD6',
          200: '#FFDBA8',
          300: '#FFC470',
          400: '#FFAA3C',
          500: '#FF8F0A',  // Primary Flame Gold
          600: '#E07300',
          700: '#B85600',
          800: '#8F3F00',
          900: '#6B2E00',
          950: '#3D1800',
        },
        candle: {
          50:  '#FAFAF5',
          100: '#F5F0E6',
          200: '#EDE4CC',
          300: '#DFD0A8',
          400: '#CFBA83',
          500: '#BFA365',  // Warm Wax
          600: '#A68A4E',
          700: '#856E3E',
          800: '#6B5834',
          900: '#574A2E',
          950: '#302818',
        },
        charcoal: {
          50:  '#F7F7F8',
          100: '#EDEDEF',
          200: '#D5D5DA',
          300: '#B3B3BC',
          400: '#8A8A97',
          500: '#6B6B79',
          600: '#555563',
          700: '#454553',
          800: '#1E1E28',  // Deep Charcoal background
          900: '#141419',  // Near black
          950: '#0A0A0F',
        },
      },
      fontFamily: {
        serif:  ['Cormorant Garamond', 'Playfair Display', 'serif'],
        sans:   ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'flame-flicker': 'flicker 3s ease-in-out infinite',
        'fade-up':       'fadeUp 0.8s ease-out',
        'glow':          'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.85' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 20px rgba(255, 143, 10, 0.15)' },
          '100%': { boxShadow: '0 0 40px rgba(255, 143, 10, 0.35)' },
        },
      },
    },
  },
  plugins: [],
}
