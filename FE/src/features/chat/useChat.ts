import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chatApi } from './chatApi'
import { chatKeys, insertMessage, markDeleted, type ChatData } from './chatCache'

export function useMessages(tripId: string) {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(tripId),
    queryFn: ({ pageParam }) => chatApi.list(tripId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore ? last.items.at(-1)?.id : undefined),
  })
}

export function useChatUnread(tripId: string) {
  return useQuery({ queryKey: chatKeys.unread(tripId), queryFn: () => chatApi.unread(tripId) })
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
