module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          DEFAULT: 'var(--theme-border)',
          bg: 'var(--theme-bg)',
          surface: 'var(--theme-surface)',
          'surface-subtle': 'var(--theme-surface-subtle)',
          border: 'var(--theme-border)',
          'border-subtle': 'var(--theme-border-subtle)',
          text: 'var(--theme-text)',
          muted: 'var(--theme-muted)',
        },
        accent: {
          DEFAULT: 'var(--accent-primary)',
          hover: 'var(--accent-hover)',
          text: 'var(--accent-text)',
          subtle: 'var(--accent-subtle)',
          border: 'var(--accent-border)',
          contrast: 'var(--accent-contrast)',
        },
      },
      borderColor: {
        theme: 'var(--theme-border)',
        'theme-subtle': 'var(--theme-border-subtle)',
      },
    },
  },
  plugins: [],
}
