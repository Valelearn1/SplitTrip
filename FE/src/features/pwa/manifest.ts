import type { ManifestOptions } from 'vite-plugin-pwa'

/** Manifest dell'app installabile (D-63): nome, schermo intero, colori e icone del mappamondo. */
export const manifest: Partial<ManifestOptions> = {
  name: 'SplitTrip',
  short_name: 'SplitTrip',
  description: 'Spese divise, conti chiari',
  lang: 'it',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  theme_color: '#2347b8',
  background_color: '#f8f9ff',
  icons: [
    { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}
