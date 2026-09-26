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
        soc: {
          bg: 'var(--soc-bg)',
          secondary: 'var(--soc-secondary)',
          card: 'var(--soc-card)',
          cardHover: 'var(--soc-card-hover)',
          border: 'var(--soc-border)',
          borderStrong: 'var(--soc-border-strong)',
          borderGlow: 'var(--soc-border-glow)',
          cyan: '#059669',        // Primary Emerald Green
          emerald: '#10B981',     // Vibrant Mint Emerald
          forest: '#064E3B',      // Deep Executive Forest
          mint: '#ECFDF5',        // Soft Mint Pill
          danger: '#DC2626',      // Crimson Alert Red
          warning: '#D97706',     // Amber Warning
          success: '#10B981',     // Emerald Success
          text: 'var(--soc-text)',
          textSecondary: 'var(--soc-text-secondary)',
          muted: 'var(--soc-muted)',
          subtle: 'var(--soc-subtle)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      boxShadow: {
        glow: '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        glowDanger: '0 0 20px -3px rgba(220, 38, 38, 0.25)',
        glowSuccess: '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        socCard: 'var(--soc-card-shadow)',
        socCardHover: '0 4px 20px -2px rgba(16, 185, 129, 0.15), 0 2px 6px -1px rgba(0, 0, 0, 0.05)'
      }
    },
  },
  plugins: [],
}
