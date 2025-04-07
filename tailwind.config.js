/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff0000',
          dark: '#990000',
        },
        surface: {
          DEFAULT: '#1a0000',
          dark: '#0a0000',
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 3s infinite',
        'connection-loss': 'connectionLoss 4s infinite',
        'color-flash': 'colorFlash 5s infinite',
        'scan-lines': 'scanlines 1s linear infinite',
        'static-noise': 'staticNoise 0.5s steps(2) infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            filter: 'brightness(1)',
          },
          '50%': {
            opacity: '.8',
            filter: 'brightness(1.2) hue-rotate(45deg)',
          },
        },
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(90deg, rgba(255, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(0deg, rgba(255, 0, 0, 0.1) 1px, transparent 1px)',
      },
      backgroundSize: {
        'cyber-grid': '20px 20px',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}