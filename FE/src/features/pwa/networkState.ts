import { onlineManager } from '@tanstack/react-query'

/**
 * TanStack Query parte sempre «online» e ascolta solo i cambi (D-63): aprendo l'app già in modalità aereo crederebbe di
 * avere la rete, chiederebbe i dati e mostrerebbe errori invece della copia salvata. Qui lo stato iniziale è quello vero.
 */
export function watchBrowserNetwork(target: EventTarget = window, nav: { onLine: boolean } = navigator) {
  onlineManager.setEventListener((setOnline) => {
    setOnline(nav.onLine)
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    target.addEventListener('online', on)
    target.addEventListener('offline', off)
    return () => {
      target.removeEventListener('online', on)
      target.removeEventListener('offline', off)
    }
  })
}
