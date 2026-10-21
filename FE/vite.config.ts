import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { configDefaults } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'
import { apiTarget } from './apiTarget.ts'
import { manifest } from './src/features/pwa/manifest.ts'
import { imageRoutes } from './src/features/pwa/swRoutes.ts'

const DAY = 24 * 60 * 60

export default defineConfig(({ mode }) => {
  const { photos, avatars } = imageRoutes(loadEnv(mode, process.cwd(), '').VITE_API_URL ?? '/api')
  const api = apiTarget(process.env)
  const proxy = { '/api': api.http, '/ws': { target: api.ws, ws: true } }
  return {
    plugins: [
      react(),
      // D-63: app installabile, guscio e immagini già viste offline; il JSON di /api non passa mai dalla cache
      VitePWA({
        registerType: 'prompt',
        injectRegister: false,
        manifest,
        includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
        devOptions: { enabled: false },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//, /^\/ws/],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            { urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/, handler: 'StaleWhileRevalidate',
              options: { cacheName: 'splittrip-font-css', expiration: { maxEntries: 10 } } },
            { urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/, handler: 'CacheFirst',
              options: { cacheName: 'splittrip-font', expiration: { maxEntries: 30, maxAgeSeconds: 365 * DAY }, cacheableResponse: { statuses: [0, 200] } } },
            { urlPattern: photos, handler: 'CacheFirst',   // una foto caricata non cambia più
              options: { cacheName: 'splittrip-foto', expiration: { maxEntries: 150, maxAgeSeconds: 30 * DAY }, cacheableResponse: { statuses: [200] }, matchOptions: { ignoreVary: true } } },
            { urlPattern: avatars, handler: 'NetworkFirst', // l'avatar cambia: online sempre quello nuovo, offline la copia
              options: { cacheName: 'splittrip-avatar', networkTimeoutSeconds: 3, expiration: { maxEntries: 60, maxAgeSeconds: 30 * DAY }, cacheableResponse: { statuses: [200] }, matchOptions: { ignoreVary: true } } },
          ],
        },
      }),
    ],
    server: { proxy },
    preview: { proxy },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.ts',
      exclude: [...configDefaults.exclude, 'e2e/**'],   // le specifiche Playwright non sono test di Vitest
      css: false,
      env: { VITE_API_URL: 'http://localhost/api' },
      alias: { 'virtual:pwa-register/react': fileURLToPath(new URL('./src/test/pwaRegisterStub.ts', import.meta.url)) },
    },
  }
})
