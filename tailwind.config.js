/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'rgb(var(--surface-rgb) / <alpha-value>)',
          raised: 'rgb(var(--surface-raised-rgb) / <alpha-value>)',
          overlay: 'rgb(var(--surface-overlay-rgb) / <alpha-value>)',
          border: 'var(--border)',
        },
        accent: {
          gold: 'rgb(var(--accent-gold-rgb) / <alpha-value>)',
          'gold-hover': 'rgb(var(--accent-gold-hover-rgb) / <alpha-value>)',
          green: 'rgb(var(--accent-green-rgb) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--text-primary-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary-rgb) / <alpha-value>)',
          muted: 'rgb(var(--text-muted-rgb) / <alpha-value>)',
        },
        status: {
          win: 'rgb(var(--status-win-rgb) / <alpha-value>)',
          loss: 'rgb(var(--status-loss-rgb) / <alpha-value>)',
          warn: 'rgb(var(--status-warn-rgb) / <alpha-value>)',
          info: 'rgb(var(--status-info-rgb) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        btn: '10px',
        input: '8px',
        pill: '9999px',
      },
      boxShadow: {
        card: '0 0 0 1px rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.3)',
        'card-hover': '0 0 0 1px rgba(240,180,41,0.15), 0 8px 32px rgba(0,0,0,0.4)',
        'card-glow': '0 0 0 1px rgba(240,180,41,0.2), 0 0 24px rgba(240,180,41,0.06)',
        panel: '0 0 0 1px rgba(255,255,255,0.04), 0 2px 12px rgba(0,0,0,0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      transitionDuration: {
        '250': '250ms',
        '400': '400ms',
      },
    },
  },
  plugins: [],
  safelist: [
    'text-status-win', 'text-status-loss', 'text-status-warn', 'text-status-info',
    'bg-status-win/10', 'bg-status-loss/10', 'bg-status-warn/10', 'bg-status-info/10',
    'text-accent-gold',
  ],
}
