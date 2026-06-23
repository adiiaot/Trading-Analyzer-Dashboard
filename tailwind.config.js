/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0f1419',
        'bg-secondary': '#1a1f2e',
        'bg-tertiary': '#252d3d',
        'text-primary': '#e8eef5',
        'text-secondary': '#a0aac4',
        'text-muted': '#6b7487',
        'accent-gold': '#d4af37',
        'accent-green': '#26a69a',
        'accent-red': '#ef5350',
        'accent-blue': '#5299d3',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
