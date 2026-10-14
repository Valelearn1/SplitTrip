import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from './notificationsApi'

const keys = { all: ['notifications'] as const, count: ['notifications', 'unread-count'] as const }

/** Polling ogni 60 s, solo con la scheda visibile: in v3 arriverà il tempo reale (D-36). */
export function useUnreadCount() {
  return useQuery({
    queryKey: keys.count,
    queryFn: notificationsApi.unreadCount,
    refetchInterval: () => (document.visibilityState === 'visible' ? 60_000 : false),
    refetchIntervalInBackground: false,
  })
}

export function useNotifications() {
  return useQuery({ queryKey: [...keys.all, 'list'], queryFn: () => notificationsApi.list() })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: notificationsApi.markRead, onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }) })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: notificationsApi.markAllRead, onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }) })
}
