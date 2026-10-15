/** Animazioni da evitare se lo chiede il sistema oppure la preferenza dell'account («Riduci le animazioni», D-48). */
export function reduceMotion(): boolean {
  if (typeof window === 'undefined') return false
  if (document.documentElement.dataset.reduceMotion === 'true') return true
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}
