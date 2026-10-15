import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { LiveStatus } from '../../shared/live/liveContext'
import { useLiveStatus } from '../../shared/live/useLive'
import { chatApi } from './chatApi'
import { chatKeys, insertMessage, markDeleted, toggleMyReaction, type ChatData } from './chatCache'

/** Senza canale collegato (proxy, risveglio di Render) la chat si ricarica da sola ogni 15 s, con la scheda visibile. */
export function chatFallbackInterval(status: LiveStatus): number | false {
  return status !== 'connected' && document.visibilityState === 'visible' ? 15_000 : false
}

export function useMessages(tripId: string) {
  const status = useLiveStatus()
  return useInfiniteQuery({
    refetchInterval: () => chatFallbackInterval(status),
    queryKey: chatKeys.messages(tripId),
    queryFn: ({ pageParam }) => chatApi.list(tripId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore ? last.items.at(-1)?.id : undefined),
  })
}

export function useChatUnread(tripId: string) {
  const status = useLiveStatus()
  return useQuery({ queryKey: chatKeys.unread(tripId), queryFn: () => chatApi.unread(tripId), refetchInterval: () => chatFallbackInterval(status) })
}

export function useSendMessage(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => chatApi.send(tripId, content),
    onSuccess: (m) => qc.setQueryData<ChatData>(chatKeys.messages(tripId), (d) => insertMessage(d, m)),
  })
}

export function useDeleteMessage(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => chatApi.remove(tripId, id),
    onSuccess: (_v, id) => qc.setQueryData<ChatData>(chatKeys.messages(tripId), (d) => markDeleted(d, id)),
  })
}

export function useMarkChatRead(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => chatApi.read(tripId),
    onSuccess: () => qc.setQueryData(chatKeys.unread(tripId), { count: 0 }),
  })
}

/** Reazioni (D-47): a schermo subito; se il server rifiuta si torna a com'era; il canale porta poi il riepilogo vero. */
export function useToggleReaction(tripId: string, myParticipantId: string) {
  const qc = useQueryClient()
  const key = chatKeys.messages(tripId)
  return useMutation({
    mutationFn: ({ id, emoji, mine }: { id: string; emoji: string; mine: boolean }) =>
      mine ? chatApi.unreact(tripId, id, emoji) : chatApi.react(tripId, id, emoji),
    onMutate: async ({ id, emoji }) => {
      await qc.cancelQueries({ queryKey: key })
      const before = qc.getQueryData<ChatData>(key)
      qc.setQueryData<ChatData>(key, (d) => toggleMyReaction(d, id, emoji, myParticipantId))
      return { before }
    },
    onError: (_e, _v, ctx) => { if (ctx?.before) qc.setQueryData(key, ctx.before) },
  })
}
