import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'img/**/*', 'css/*', 'js/*'],
      manifest: {
        name: 'Docs Locs Masterkey',
        short_name: 'Docs Locs MK',
        description: 'Locksmith requests for realtors at closing — Little Rock and Ft. Wayne.',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#F5F5F5',
        theme_color: '#FF1818',
        icons: [72, 96, 128, 144, 152, 192].map((s) => ({
          src: `img/icons/icon-${s}x${s}.png`, sizes: `${s}x${s}`, type: 'image/png'
        })).concat([
          { src: 'img/icons/icon-384x384.png', sizes: '384x384', type: 'image/png', purpose: 'any maskable' },
          { src: 'img/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ])
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        navigateFallback: 'index.html',
        runtimeCaching: [{
          urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
          handler: 'CacheFirst',
          options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 31536000 } }
        }]
      }
    })
  ]
})
