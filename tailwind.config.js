/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0A0E27',
          sidebar: '#0F1432',
          card: '#1A1F3A',
          'card-hover': 'rgba(26, 31, 58, 0.6)',
          border: '#2D3561',
        },
        neon: {
          green: '#00FF88',
          'green-hover': '#00DD77',
          'green-dark': '#00CC77',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A0AEC0',
          tertiary: '#718096',
        },
        alert: {
          loss: '#FF3D71',
          warning: '#FFD700',
          info: '#3B82F6',
        },
      },
      backdropBlur: {
        md: '10px',
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        input: '8px',
      },
      boxShadow: {
        card: '0 4px 12px rgba(0, 0, 0, 0.3)',
        modal: '0 20px 40px rgba(0, 0, 0, 0.5)',
        neon: '0 0 20px rgba(0, 255, 136, 0.15)',
      },
      fontSize: {
        h1: ['32px', { lineHeight: '40px', fontWeight: '700' }],
        h2: ['24px', { lineHeight: '32px', fontWeight: '700' }],
        h3: ['18px', { lineHeight: '28px', fontWeight: '600' }],
        body: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        small: ['12px', { lineHeight: '16px', fontWeight: '400' }],
        label: ['11px', { lineHeight: '14px', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
}
