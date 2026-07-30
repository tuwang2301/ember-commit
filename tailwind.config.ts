import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        surface: {
          DEFAULT: 'var(--surface)',
          raised: 'var(--surface-raised)',
        },
        line: 'var(--line)',
        text: {
          primary: 'var(--text-primary)',
          muted: 'var(--text-muted)',
        },
        grid: {
          l0: 'var(--grid-l0)',
          l1: 'var(--grid-l1)',
          l2: 'var(--grid-l2)',
          l3: 'var(--grid-l3)',
          l4: 'var(--grid-l4)',
        },
        status: {
          safe: 'var(--status-safe)',
          'at-risk': 'var(--status-at-risk)',
          critical: 'var(--status-critical)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '6px',
        lg: '6px',
        xl: '6px',
        '2xl': '6px',
        '3xl': '6px',
        pill: '999px',
      },
    },
  },
  plugins: [],
};

export default config;
