import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three']
        },
        // Ensure proper file extensions
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000,
    // Ensure source maps for debugging
    sourcemap: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'three']
  },
  server: {
    port: 3000,
    open: true,
    // Ensure correct MIME types in dev server
    headers: {
      'Content-Type': 'application/javascript'
    }
  }
})