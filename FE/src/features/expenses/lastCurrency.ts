/** D-69: l'ultima valuta usata in questo viaggio su questo telefono, solo comodità (localStorage, D-48). */
const key = (tripId: string) => `splittrip:currency:${tripId}`
export function lastCurrency(tripId: string): string | null {
  try { return localStorage.getItem(key(tripId)) } catch { return null }
}
export function rememberCurrency(tripId: string, code: string) {
  try { localStorage.setItem(key(tripId), code) } catch { /* privato o bloccato: pazienza */ }
}
