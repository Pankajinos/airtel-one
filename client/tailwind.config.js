/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        airtel: {
          bg: '#050505',
          surface: '#111111',
          card: '#161616',
          cardHover: '#1c1c1c',
          input: '#141414',
          red: '#E60000',
          neon: '#FF2020',
          white: '#FFFFFF',
          textMuted: '#B5B5B5',
          border: 'rgba(255, 255, 255, 0.12)',
          borderFocus: 'rgba(230, 0, 0, 0.6)'
        },
        brand: {
          50: '#fff1f1',
          100: '#ffe1e1',
          500: '#E60000',
          600: '#cc0000',
          700: '#b30000',
          800: '#8c0000',
          900: '#5c0000',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
        heading: ['Inter', 'Poppins', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      boxShadow: {
        'neon-red': '0 0 20px rgba(230, 0, 0, 0.45), 0 0 40px rgba(230, 0, 0, 0.2)',
        'neon-red-sm': '0 0 10px rgba(255, 32, 32, 0.4)',
        'neon-red-lg': '0 0 35px rgba(230, 0, 0, 0.6), 0 0 70px rgba(255, 32, 32, 0.25)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 15px rgba(230,0,0,0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 28px rgba(255,32,32,0.8))' },
        }
      }
    },
  },
  plugins: [],
}
