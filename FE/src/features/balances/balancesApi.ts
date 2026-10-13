import { api } from '../../shared/api/client'
import type { Balances, Settlement, SettlementInput, Summary } from '../../shared/api/types'

export const balancesApi = {
  balances: (tripId: string) => api<Balances>(`/trips/${tripId}/balances`),
  summary: (tripId: string) => api<Summary>(`/trips/${tripId}/summary`),
  settlements: (tripId: string) => api<Settlement[]>(`/trips/${tripId}/settlements`),
  createSettlement: (tripId: string, body: SettlementInput) => api<Settlement>(`/trips/${tripId}/settlements`, { method: 'POST', body }),
  removeSettlement: (tripId: string, id: string) => api<void>(`/trips/${tripId}/settlements/${id}`, { method: 'DELETE' }),
}
