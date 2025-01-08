import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/study-companion/',  
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false, 
    minify: 'esbuild', 
    rollupOptions: {
      output: {
        manualChunks: {
          'ui-libs': ['@emotion/react', '@emotion/styled', '@fortawesome/fontawesome-free']
        }
      }
    }
  },
  define: {
    'process.env': {}
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
