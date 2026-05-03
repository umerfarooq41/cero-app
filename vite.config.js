import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      // ✅ FIX 1: disable PWA in dev (removes warning)
      devOptions: {
        enabled: false
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}']
      },

      manifest: {
        name: 'Cero Budget',
        short_name: 'Cero',
        description: 'Zero-based budgeting app',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',

        // ✅ FIX 2: change filenames (forces icon refresh)
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ]
      }
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})