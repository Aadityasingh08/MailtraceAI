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
          accent: 'var(--soc-accent)',
          accentHover: 'var(--soc-accent-hover)',
          accentGlow: 'var(--soc-accent-glow)',
          cyan: '#06B6D4',        // Electric Cyan
          emerald: '#10B981',     // Mint Emerald
          forest: '#064E3B',      // Executive Forest
          mint: '#ECFDF5',        // Soft Mint Pill
          danger: '#DC2626',      // Crimson Alert Red
          warning: '#D97706',     // Amber Warning
          success: '#10B981',     // Success
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
        glow: '0 0 20px -3px var(--soc-accent-glow)',
        glowDanger: '0 0 20px -3px rgba(220, 38, 38, 0.35)',
        glowSuccess: '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        socCard: 'var(--soc-card-shadow)',
        socCardHover: '0 8px 30px -4px rgba(0, 0, 0, 0.5), 0 0 15px -3px var(--soc-border-glow)'
      }
    },
  },
  plugins: [],
}
