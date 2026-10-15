import { api } from '../../shared/api/client'
import type { ChatMessage, MessagePage } from '../../shared/api/types'

export const chatApi = {
  list: (tripId: string, before?: string) => api<MessagePage>(`/trips/${tripId}/messages${before ? `?before=${before}` : ''}`),
  send: (tripId: string, content: string) => api<ChatMessage>(`/trips/${tripId}/messages`, { method: 'POST', body: { content } }),
  remove: (tripId: string, id: string) => api<void>(`/trips/${tripId}/messages/${id}`, { method: 'DELETE' }),
  unread: (tripId: string) => api<{ count: number }>(`/trips/${tripId}/messages/unread-count`),
  read: (tripId: string) => api<void>(`/trips/${tripId}/messages/read`, { method: 'POST' }),
}
