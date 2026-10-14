import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { TodoList, TodoListType } from '../../shared/api/types'
import { todoApi, type ItemPatch } from './todoApi'

const key = (tripId: string) => ['trips', tripId, 'todo'] as const

export function useTodoLists(tripId: string) {
  return useQuery({ queryKey: key(tripId), queryFn: () => todoApi.lists(tripId) })
}

function useInvalidate(tripId: string) {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: key(tripId) })
}

export function useCreateList(tripId: string) {
  const invalidate = useInvalidate(tripId)
  return useMutation({ mutationFn: (body: { title: string; type: TodoListType }) => todoApi.createList(tripId, body), onSuccess: invalidate })
}

export function useRenameList(tripId: string) {
  const invalidate = useInvalidate(tripId)
  return useMutation({ mutationFn: ({ listId, title }: { listId: string; title: string }) => todoApi.renameList(tripId, listId, title), onSuccess: invalidate })
}

export function useDeleteList(tripId: string) {
  const invalidate = useInvalidate(tripId)
  return useMutation({ mutationFn: (listId: string) => todoApi.deleteList(tripId, listId), onSuccess: invalidate })
}

export function useAddItem(tripId: string) {
  const invalidate = useInvalidate(tripId)
  return useMutation({
    mutationFn: ({ listId, text, assigneeParticipantId }: { listId: string; text: string; assigneeParticipantId?: string }) =>
      todoApi.addItem(tripId, listId, { text, assigneeParticipantId }),
    onSuccess: invalidate,
  })
}

/** Spunta ottimistica: la casella cambia subito, poi la lista si riallinea col server. */
export function usePatchItem(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ listId, itemId, patch }: { listId: string; itemId: string; patch: ItemPatch }) => todoApi.patchItem(tripId, listId, itemId, patch),
    onMutate: async ({ itemId, patch }) => {
      if (patch.done === undefined) return
      await qc.cancelQueries({ queryKey: key(tripId) })
      qc.setQueryData<TodoList[]>(key(tripId), (lists) =>
        lists?.map((l) => ({ ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, done: patch.done! } : i)) })))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key(tripId) }),
  })
}

export function useDeleteItem(tripId: string) {
  const invalidate = useInvalidate(tripId)
  return useMutation({ mutationFn: ({ listId, itemId }: { listId: string; itemId: string }) => todoApi.deleteItem(tripId, listId, itemId), onSuccess: invalidate })
}
