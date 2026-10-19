// Nei test il service worker non esiste: il modulo virtuale di vite-plugin-pwa diventa un hook fermo
export function useRegisterSW() {
  return { needRefresh: [false, () => {}], offlineReady: [false, () => {}], updateServiceWorker: async () => {} } as const
}
