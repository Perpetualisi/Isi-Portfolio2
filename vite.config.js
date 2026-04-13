import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Three.js ecosystem (split further)
          'three-core': ['three'],
          'three-addons': ['@react-three/fiber', '@react-three/drei'],
          
          // Other large dependencies (if any)
          // 'utils': ['lodash', 'date-fns'], // add if you have these
        }
      }
    },
    // Optional: Increase warning threshold if 500 KB is too strict
    chunkSizeWarningLimit: 600
  }
})