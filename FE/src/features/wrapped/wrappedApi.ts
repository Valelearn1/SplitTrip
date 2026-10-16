import { api } from '../../shared/api/client'
import type { Wrapped } from '../../shared/api/types'

export const wrappedApi = {
  get: (tripId: string) => api<Wrapped>(`/trips/${tripId}/wrapped`),
  guess: (tripId: string, amount: number) => api<void>(`/trips/${tripId}/wrapped/guess`, { method: 'POST', body: { amount } }),
}
