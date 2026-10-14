import { api } from '../../shared/api/client'
import type { TodoItem, TodoList, TodoListType } from '../../shared/api/types'

export type ItemPatch = { text?: string; done?: boolean; assigneeParticipantId?: string; clearAssignee?: boolean }

export const todoApi = {
  lists: (tripId: string) => api<TodoList[]>(`/trips/${tripId}/todo-lists`),
  createList: (tripId: string, body: { title: string; type: TodoListType }) => api<TodoList>(`/trips/${tripId}/todo-lists`, { method: 'POST', body }),
  renameList: (tripId: string, listId: string, title: string) => api<TodoList>(`/trips/${tripId}/todo-lists/${listId}`, { method: 'PATCH', body: { title } }),
  deleteList: (tripId: string, listId: string) => api<void>(`/trips/${tripId}/todo-lists/${listId}`, { method: 'DELETE' }),
  addItem: (tripId: string, listId: string, body: { text: string; assigneeParticipantId?: string }) =>
    api<TodoItem>(`/trips/${tripId}/todo-lists/${listId}/items`, { method: 'POST', body }),
  patchItem: (tripId: string, listId: string, itemId: string, body: ItemPatch) =>
    api<TodoItem>(`/trips/${tripId}/todo-lists/${listId}/items/${itemId}`, { method: 'PATCH', body }),
  deleteItem: (tripId: string, listId: string, itemId: string) =>
    api<void>(`/trips/${tripId}/todo-lists/${listId}/items/${itemId}`, { method: 'DELETE' }),
}
