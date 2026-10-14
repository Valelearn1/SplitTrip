import { api } from '../../shared/api/client'
import type { AppNotification } from '../../shared/api/types'

export const notificationsApi = {
  list: (unread = false) => api<AppNotification[]>(`/notifications${unread ? '?unread=true' : ''}`),
  unreadCount: () => api<{ count: number }>('/notifications/unread-count'),
  markRead: (id: string) => api<void>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => api<void>('/notifications/read-all', { method: 'POST' }),
}
