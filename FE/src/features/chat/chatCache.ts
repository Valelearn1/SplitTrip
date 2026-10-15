import type { InfiniteData } from '@tanstack/react-query'
import type { ChatMessage, MessagePage } from '../../shared/api/types'

export type ChatData = InfiniteData<MessagePage, string | undefined>

export const chatKeys = {
  messages: (tripId: string) => ['chat', tripId, 'messages'] as const,
  unread: (tripId: string) => ['chat', tripId, 'unread'] as const,
}

/** Il proprio messaggio arriva due volte (risposta REST e canale): si inserisce una volta sola. */
export function insertMessage(data: ChatData | undefined, msg: ChatMessage): ChatData | undefined {
  if (!data) return data
  if (data.pages.some((p) => p.items.some((m) => m.id === msg.id))) return data
  const [first, ...rest] = data.pages
  return { ...data, pages: [{ ...first, items: [msg, ...first.items] }, ...rest] }
}

export function markDeleted(data: ChatData | undefined, id: string): ChatData | undefined {
  if (!data) return data
  return { ...data, pages: data.pages.map((p) => ({ ...p, items: p.items.map((m) => (m.id === id ? { ...m, content: null, deleted: true } : m)) })) }
}
