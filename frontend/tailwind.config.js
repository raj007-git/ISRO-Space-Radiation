/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:          '#05070C',
        spaceDark:   '#080C14',
        spacePanel:  'rgba(10, 15, 26, 0.7)',
        spaceSurface:'rgba(16, 24, 40, 0.6)',
        cyanAccent:  '#00F0FF',
        cyanMuted:   '#0099A8',
        orange:      '#FF6B2B',
        orangeHover: '#FF854D',
        cream:       '#F3F7FA',
        muted:       '#7E8B9B',
        border:      'rgba(255, 255, 255, 0.08)',
        borderCyan:  'rgba(0, 240, 255, 0.2)',
        igreen:      '#00E676',
        warn:        '#FFB300',
        crit:        '#FF3B30',
      },
      fontFamily: {
        display: ['"Gantari"', 'sans-serif'],
        sans:    ['"Golos Text"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.65)',
        'cyan-glow': '0 0 25px rgba(0, 240, 255, 0.25)',
        'orange-glow': '0 0 25px rgba(255, 107, 43, 0.3)',
        'green-glow': '0 0 25px rgba(0, 230, 118, 0.25)',
        'red-glow': '0 0 25px rgba(255, 59, 48, 0.3)',
      },
      borderRadius: {
        'pill': '9999px',
        '2.5xl': '20px',
        '3xl': '24px',
      },
      animation: {
        'radar': 'spin 14s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
