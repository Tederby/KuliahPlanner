import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',   // Required for Capacitor: assets use relative paths in Android WebView
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
  }
})
