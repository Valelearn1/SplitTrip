import { useQuery } from '@tanstack/react-query'
import { ApiError } from '../../shared/api/client'
import { ratesApi } from '../../shared/api/ratesApi'
import { normalizeSeparators } from '../../shared/utils/amount'

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
  // «1.08», «1,08» e «1.523,45» come li scrive una persona (revisione v3.6: il punto non è sempre delle migliaia)
  const n = Number(normalizeSeparators(perUnit.trim()).replace(',', '.'))
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

/**
 * Centesimi nella valuta del viaggio da centesimi dello scontrino, HALF_UP come il server (BigDecimal): conti interi
 * con BigInt, niente virgola mobile (revisione v3.6: l'anteprima poteva differire di un centesimo dal salvato).
 */
export function convertCents(cents: number, fxRate: number): number {
  const rate = BigInt(Math.round(fxRate * 1e8))
  return Number((BigInt(Math.round(cents)) * rate + 50_000_000n) / 100_000_000n)
}

/**
 * «Salda» in un'altra valuta (revisione v3.6): l'importo nello scontrino che, convertito, fa esattamente `targetCents`;
 * se la valuta non lo permette (1 penny ≈ 1,17 centesimi), il più vicino che non lo supera: resta al massimo 1 centesimo
 * da dare, mai un credito al contrario. In centesimi dello scontrino; senza centesimi, multipli di 100.
 */
export function receiptFor(targetCents: number, fxRate: number, digits: number): number {
  const unit = digits === 0 ? 100 : 1
  const start = Math.round(targetCents / fxRate / unit) * unit
  const candidates = [0, -1, 1, -2, 2].map((d) => start + d * unit).filter((c) => c > 0)   // prima la conversione diretta, poi i vicini
  const exact = candidates.find((c) => convertCents(c, fxRate) === targetCents)
  if (exact !== undefined) return exact
  const under = candidates.filter((c) => convertCents(c, fxRate) < targetCents)
  return under.length > 0 ? Math.max(...under) : start
}
