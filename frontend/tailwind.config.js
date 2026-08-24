/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        founder: {
          darkest: '#0A0514',
          dark: '#130B24',
          card: '#1A0F30',
          border: '#331B5E',
          primary: '#8833FF',
          secondary: '#3388FF',
          highlight: '#B892FF',
          textMain: '#FFFFFF',
          textMuted: '#A399BC',
        }
      },
      backgroundImage: {
        'page-gradient': 'linear-gradient(to bottom, #100624, #0A0314)',
        'hero-glow': 'radial-gradient(circle at 50% 30%, rgba(136, 51, 255, 0.15) 0%, transparent 60%)',
        'node-glow': 'radial-gradient(circle at center, rgba(136, 51, 255, 0.4) 0%, transparent 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'flow-line': 'flowLine 2s linear infinite',
        'marquee': 'marquee 30s linear infinite',
        'marquee-reverse': 'marqueeReverse 30s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.8', boxShadow: '0 0 15px rgba(136, 51, 255, 0.3)' },
          '50%': { opacity: '1', boxShadow: '0 0 30px rgba(136, 51, 255, 0.6)' },
        },
        flowLine: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marqueeReverse: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        }
      }
    },
  },
  plugins: [],
}
