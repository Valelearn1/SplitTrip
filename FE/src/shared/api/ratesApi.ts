import { api } from './client'
import type { Rate } from './types'

/** Cambio BCE del giorno, solo dal backend (D-69): quanto vale 1 unità di `from` in `to`. */
export const ratesApi = {
  rate: (from: string, to: string, date: string) => api<Rate>(`/rates?from=${from}&to=${to}&date=${date}`),
}
