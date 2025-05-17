import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 5173,
    strictPort: true,
    cors: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  resolve: {
    alias: {
      'jspdf': path.resolve(__dirname, './node_modules/jspdf/dist/jspdf.umd.min.js')
    }
  },
  optimizeDeps: {
    include: ['jspdf', 'jspdf-autotable']
  }
})
