import { api } from '../../shared/api/client'
import type { AiTips, PackingSuggestions } from '../../shared/api/types'

export const aiApi = {
  tips: (tripId: string) => api<AiTips>(`/trips/${tripId}/ai/tips`),
  generateTips: (tripId: string) => api<AiTips>(`/trips/${tripId}/ai/tips`, { method: 'POST' }),
  packing: (tripId: string, listId: string) => api<PackingSuggestions>(`/trips/${tripId}/todo-lists/${listId}/ai/suggestions`, { method: 'POST' }),
}
