/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:          '#04060A',
        spaceDark:   '#070A10',
        spacePanel:  'rgba(10, 14, 22, 0.45)',
        spaceSurface:'rgba(16, 22, 34, 0.35)',
        cyanAccent:  '#00E5FF',
        orange:      '#F97316',
        isroBlue:    '#0284C7',
        cream:       '#F8FAFC',
        muted:       '#94A3B8',
        border:      'rgba(255, 255, 255, 0.08)',
        borderHover: 'rgba(255, 255, 255, 0.16)',
        igreen:      '#10B981',
        warn:        '#F59E0B',
        crit:        '#EF4444',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
        sans:    ['"Inter"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.2)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.25)',
      },
      borderRadius: {
        'pill': '9999px',
        '2.5xl': '20px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
