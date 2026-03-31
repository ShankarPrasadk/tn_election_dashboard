import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Advanced code obfuscation via Terser
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,       // Remove console.log from production
        drop_debugger: true,      // Remove debugger statements
        passes: 2,                // Multiple compression passes
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        toplevel: true,           // Mangle top-level names
        properties: {
          regex: /^_/,            // Mangle properties starting with _
        },
      },
      format: {
        comments: false,          // Strip all comments
        ascii_only: true,         // ASCII-only output
      },
    },
    // Chunk splitting to make code harder to reassemble
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          maps: ['leaflet', 'react-leaflet'],
        },
        // Hash-based filenames to prevent predictable paths
        chunkFileNames: 'assets/[hash].js',
        entryFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]',
      },
    },
    // Disable source maps in production
    sourcemap: false,
  },
})
