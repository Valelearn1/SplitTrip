import { useQuery } from '@tanstack/react-query'
import { ApiError } from '../../shared/api/client'
import { ratesApi } from '../../shared/api/ratesApi'

/** Il cambio di un giorno passato non cambia: resta in memoria; 404 e 503 non si ritentano (si scrive a mano). */
export function useRate(from: string, to: string, date: string, enabled: boolean) {
  return useQuery({
    queryKey: ['rates', date, from, to],
    queryFn: () => ratesApi.rate(from, to, date),
    enabled: enabled && from !== to && /^\d{4}-\d{2}-\d{2}$/.test(date),
    staleTime: Infinity,
    retry: (count, error) => !(error instanceof ApiError && (error.status === 404 || error.status === 503)) && count < 1,
  })
}

/** «1 € = 177,82 JPY» → fxRate 0.00562366 (quanto vale 1 JPY in €), 8 decimali. */
export function toFxRate(perUnit: string): number {
  const n = Number(perUnit.replace(/\./g, '').replace(',', '.'))
  if (!Number.isFinite(n) || n <= 0) return 0
  return Number((1 / n).toFixed(8))
}

/**
 * fxRate → «177,82»: quanti `from` vale 1 unità della valuta del viaggio. 6 cifre significative: il cambio è salvato a
 * 8 decimali e l'inverso porta un po' di rumore (1 / 0,00562366 = 177,82007).
 */
export function fromFxRate(fxRate: number): string {
  if (!(fxRate > 0)) return ''
  return String(Number((1 / fxRate).toPrecision(6))).replace('.', ',')
}
