const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')

/**
 * Indirizzi delle immagini che il service worker salva (D-63): foto, miniature, scontrini e avatar. Mai il JSON di /api.
 * Workbox confronta l'URL intero e serializza solo RegExp (non funzioni): per questo si costruiscono qui da VITE_API_URL.
 */
export function imageRoutes(apiUrl: string): { photos: RegExp; avatars: RegExp } {
  const trimmed = apiUrl.replace(/\/+$/, '')
  const base = /^https?:\/\//.test(trimmed) ? escape(trimmed) : `https?://[^/]+${escape(trimmed)}`
  return {
    photos: new RegExp(`^${base}/trips/[^/]+/photos/[^/]+/(image|thumbnail)$`),
    avatars: new RegExp(`^${base}/users/[^/]+/avatar$`),
  }
}
