import type { InfiniteData } from '@tanstack/react-query'
import type { ChatMessage, MessagePage, ReactionSummary } from '../../shared/api/types'
import { REACTIONS } from './emojiList'

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

function mapMessage(data: ChatData | undefined, id: string, fn: (m: ChatMessage) => ChatMessage): ChatData | undefined {
  if (!data) return data
  return { ...data, pages: data.pages.map((p) => ({ ...p, items: p.items.map((m) => (m.id === id ? fn(m) : m)) })) }
}

/** Il riepilogo che arriva dal canale (message.reacted) è quello vero: sostituisce il nostro. */
export function setReactions(data: ChatData | undefined, id: string, reactions: ReactionSummary[]): ChatData | undefined {
  return mapMessage(data, id, (m) => ({ ...m, reactions }))
}

const ORDER: readonly string[] = REACTIONS.map((r) => r.emoji)

/** Aggiornamento ottimistico: mi aggiungo o mi tolgo da un'emoji, nell'ordine della lista. */
export function toggleMyReaction(data: ChatData | undefined, id: string, emoji: string, me: string): ChatData | undefined {
  return mapMessage(data, id, (m) => {
    const current = m.reactions.find((r) => r.emoji === emoji)
    let reactions: ReactionSummary[]
    if (current?.participantIds.includes(me)) {
      reactions = m.reactions
        .map((r) => (r.emoji === emoji ? { ...r, count: r.count - 1, participantIds: r.participantIds.filter((p) => p !== me) } : r))
        .filter((r) => r.count > 0)
    } else if (current) {
      reactions = m.reactions.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1, participantIds: [...r.participantIds, me] } : r))
    } else {
      reactions = [...m.reactions, { emoji, count: 1, participantIds: [me] }].sort((a, b) => ORDER.indexOf(a.emoji) - ORDER.indexOf(b.emoji))
    }
    return { ...m, reactions }
  })
}
