/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Flamia Design System Colors ──
        flame: {
          50:  '#FDF8F0',
          100: '#F9EDD9',
          200: '#F0D9B0',
          300: '#E4C080',
          400: '#D4A85C',
          500: '#C8944A', // Primary — Flame Gold
          600: '#A97B3D',
          700: '#8B6430',
          800: '#6D4E25',
          900: '#4F381A',
        },
        charcoal: {
          50:  '#F5F5F5',
          100: '#E0E0E0',
          200: '#BDBDBD',
          300: '#9E9E9E',
          400: '#757575',
          500: '#4A4A4A',
          600: '#333333',
          700: '#262626',
          800: '#1A1A1A', // Deep Charcoal
          900: '#0D0D0D', // Rich Black
        },
        cream:  '#F5F0E8',
        ivory:  '#FEFCF8',
        taupe:  '#B8A99A',
        bronze: '#8B7355',

        // Semantic
        success: '#4A7C59',
        warning: '#C8944A',
        error:   '#A35D5D',
        info:    '#5D7A8C',
      },
      fontFamily: {
        serif:  ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:   ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:   ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-xl': ['72px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '300' }],
        'display-lg': ['56px', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '300' }],
        'display-md': ['44px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '400' }],
        'heading-1':  ['36px', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '500' }],
        'heading-2':  ['28px', { lineHeight: '1.3', fontWeight: '500' }],
        'heading-3':  ['24px', { lineHeight: '1.35', fontWeight: '500' }],
        'heading-4':  ['20px', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '600' }],
        'body-lg':    ['18px', { lineHeight: '1.6' }],
        'body-md':    ['16px', { lineHeight: '1.6' }],
        'body-sm':    ['14px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'caption':    ['12px', { lineHeight: '1.4', letterSpacing: '0.02em', fontWeight: '500' }],
        'overline':   ['11px', { lineHeight: '1.0', letterSpacing: '0.15em', fontWeight: '600' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        'content':  '1200px',
        'narrow':   '780px',
        'wide':     '1400px',
      },
      borderRadius: {
        'luxury': '2px',
      },
      animation: {
        'ken-burns':    'kenBurns 12s ease-in-out infinite alternate',
        'fade-up':      'fadeUp 0.6s ease-out forwards',
        'fade-in':      'fadeIn 0.4s ease-out forwards',
        'slide-right':  'slideRight 0.35s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
        'float':        'float 2s ease-in-out infinite',
        'shimmer':      'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        kenBurns: {
          '0%':   { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.06)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideRight: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'luxury':   '0 8px 32px rgba(13, 13, 13, 0.08)',
        'luxury-lg':'0 16px 48px rgba(13, 13, 13, 0.12)',
        'gold':     '0 0 0 3px rgba(200, 148, 74, 0.15)',
      },
      transitionTimingFunction: {
        'luxury':       'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'smooth-decel': 'cubic-bezier(0, 0, 0.2, 1)',
        'quick':        'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
