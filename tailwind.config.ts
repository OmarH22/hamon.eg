import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Quiet-luxury palette. Warm ivory ground, near-black type, one restrained accent.
        ivory: '#F7F5F1',
        paper: '#FFFDFA',
        panel: '#EFEBE4',
        ink: '#141312',
        muted: '#5F5B54',
        subtle: '#8A857C',
        line: '#E4DFD6',
        champagne: '#B29A72',
        alert: '#9C3B32',
      },
      fontFamily: {
        sans: ['var(--font-arabic)', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      spacing: {
        13: '3.25rem',
      },
      maxWidth: {
        shell: '1180px',
        prose: '46ch',
      },
      borderRadius: {
        card: '18px',
        field: '14px',
      },
      boxShadow: {
        lift: '0 1px 2px rgba(20,19,18,0.04), 0 12px 32px -18px rgba(20,19,18,0.18)',
        select: '0 1px 2px rgba(20,19,18,0.05), 0 8px 24px -16px rgba(20,19,18,0.35)',
      },
      transitionTimingFunction: {
        calm: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        rise: 'rise 520ms cubic-bezier(0.22, 0.61, 0.36, 1) both',
        breathe: 'breathe 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
