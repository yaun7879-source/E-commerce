import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (['react', 'react-dom', 'react-router-dom'].some((pkg) => id.includes(`/node_modules/${pkg}/`))) {
            return 'react-vendor';
          }
        },
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
}))
