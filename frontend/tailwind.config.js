/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:       '#141210',
        panel:    '#1E1C1A',
        surface:  '#2A2724',
        orange:   '#E55C22',
        orangeHover: '#FF6B2E',
        cream:    '#FFF8F2',
        muted:    '#999591',
        border:   '#33312F',
        igreen:   '#138808',
        warn:     '#FFC857',
        crit:     '#FF4444',
      },
      fontFamily: {
        display: ['"Gantari"', 'sans-serif'],
        sans:    ['"Golos Text"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        pill: '9999px',
      },
    },
  },
  plugins: [],
};
