/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00E5FF',
        'primary-dark': '#00B8D4',
        surface: '#001529',
        'surface-dark': '#000C17',
        accent: '#05D5FF'
      },
      animation: {
        'terminal-blink': 'blink 1s step-end infinite',
        'terminal-glow': 'terminalGlow 2s ease-in-out infinite',
        'terminal-scan': 'scanline 10s linear infinite',
        'terminal-float': 'float 6s ease-in-out infinite',
        'terminal-glitch': 'glitch 2s infinite linear alternate-reverse',
      },
      fontFamily: {
        terminal: ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}