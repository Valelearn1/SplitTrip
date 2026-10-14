import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { DayBasis, ExpenseCategory } from '../api/types'

/** Giorni o notti di presenza: intersezione tra le date del partecipante e quelle del viaggio (D-31). Specchio di PresenceCalculator. */
export function presence(
  trip: { startDate: string; endDate: string },
  p: { arrivalDate: string | null; departureDate: string | null },
  basis: DayBasis,
): number {
  const start = parseISO(trip.startDate)
  const end = parseISO(trip.endDate)
  const from = p.arrivalDate && parseISO(p.arrivalDate) > start ? parseISO(p.arrivalDate) : start
  const to = p.departureDate && parseISO(p.departureDate) < end ? parseISO(p.departureDate) : end
  if (to < from) return 0
  const nights = differenceInCalendarDays(to, from)
  return basis === 'NIGHTS' ? nights : nights + 1
}

/** Divide un totale in centesimi in proporzione ai pesi; resto maggiore, poi ordine di id. Specchio di WeightedSplitter. */
export function splitByWeight(totalCents: number, weights: { id: string; weight: number }[]): Map<string, number> {
  const sorted = [...weights].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  const sum = sorted.reduce((s, w) => s + w.weight, 0)
  const result = new Map<string, number>()
  if (sum <= 0) {
    for (const w of sorted) result.set(w.id, 0)
    return result
  }
  const exact = sorted.map((w) => (totalCents * w.weight) / sum)
  const floors = exact.map((x) => Math.floor(x + 1e-9))
  let remainder = totalCents - floors.reduce((a, b) => a + b, 0)
  const order = sorted.map((_, i) => i).sort((i, j) => exact[j] - floors[j] - (exact[i] - floors[i]) || (sorted[i].id < sorted[j].id ? -1 : 1))
  for (const i of order) {
    if (remainder <= 0) break
    floors[i]++
    remainder--
  }
  sorted.forEach((w, i) => result.set(w.id, floors[i]))
  return result
}

export function defaultBasis(category: ExpenseCategory): DayBasis {
  return category === 'LODGING' ? 'NIGHTS' : 'DAYS'
}
