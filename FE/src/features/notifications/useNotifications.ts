import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLiveStatus, useNotificationsChannel } from '../../shared/live/useLive'
import { notificationsApi } from './notificationsApi'

const keys = { all: ['notifications'] as const, count: ['notifications', 'unread-count'] as const }

/** Il polling ogni 60 s resta come riserva: col canale collegato la campanella si aggiorna da sola (D-39). */
export function useUnreadCount() {
  const live = useLiveStatus()
  return useQuery({
    queryKey: keys.count,
    queryFn: notificationsApi.unreadCount,
    refetchInterval: () => (live !== 'connected' && document.visibilityState === 'visible' ? 60_000 : false),
    refetchIntervalInBackground: false,
  })
}

/** Ogni notifica spinta aggiorna subito il numero e la lista. */
export function useLiveNotifications() {
  const qc = useQueryClient()
  useNotificationsChannel((e) => {
    qc.setQueryData(keys.count, { count: e.unreadCount })
    void qc.invalidateQueries({ queryKey: [...keys.all, 'list'] })
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
