import type { QueryCache } from '@tanstack/react-query'

const two = (n: number) => String(n).padStart(2, '0')

/** «Sei offline · dati delle 21:40», o con la data se non sono di oggi: l'età onesta di ciò che si vede (D-63). */
export function dataAgeLabel(oldest: number | null, now: Date = new Date()): string {
  if (!oldest) return 'Sei offline'
  const d = new Date(oldest)
  const time = `${two(d.getHours())}:${two(d.getMinutes())}`
  return d.toDateString() === now.toDateString()
    ? `Sei offline · dati delle ${time}`
    : `Sei offline · dati del ${two(d.getDate())}/${two(d.getMonth() + 1)} alle ${time}`
}

/** Il dato più vecchio tra le query che la pagina sta mostrando (quelle con osservatori). */
export function oldestActiveData(cache: QueryCache): number | null {
  const times = cache.findAll({ type: 'active' }).map((q) => q.state.dataUpdatedAt).filter((t) => t > 0)
  return times.length > 0 ? Math.min(...times) : null
}
