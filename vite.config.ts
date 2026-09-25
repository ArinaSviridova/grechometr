import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'assets/icons/*.png'],
      manifest: {
        name: 'Грехометр',
        short_name: 'Грехометр',
        description: 'Локальный счётчик грехов, кругов ада и искуплений.',
        lang: 'ru',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#120807',
        theme_color: '#7d1a10',
        categories: ['lifestyle', 'entertainment'],
        icons: [
          { src: '/assets/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/assets/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/assets/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,json}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true
      },
      devOptions: { enabled: true }
    })
  ]
})
