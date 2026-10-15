import { differenceInMinutes, format, isSameDay, parseISO, subDays } from 'date-fns'
import { it as itLocale } from 'date-fns/locale'
import type { ChatMessage } from '../../shared/api/types'

export type TimelineItem =
  | { kind: 'day'; key: string; label: string }
  | { kind: 'message'; key: string; message: ChatMessage; showAuthor: boolean }

function dayLabel(d: Date, now: Date) {
  if (isSameDay(d, now)) return 'Oggi'
  if (isSameDay(d, subDays(now, 1))) return 'Ieri'
  return format(d, 'EEE d MMM', { locale: itLocale })
}

/** Separatori di giorno e blocchi: nome e avatar solo sul primo messaggio di una persona entro 5 minuti. */
export function buildTimeline(oldestFirst: ChatMessage[], now: Date = new Date()): TimelineItem[] {
  const out: TimelineItem[] = []
  let prev: ChatMessage | null = null
  for (const m of oldestFirst) {
    const at = parseISO(m.createdAt)
    if (!prev || !isSameDay(parseISO(prev.createdAt), at)) out.push({ kind: 'day', key: `day-${m.createdAt}`, label: dayLabel(at, now) })
    const sameBlock = prev !== null && prev.kind === 'TEXT' && m.kind === 'TEXT' && prev.authorParticipantId === m.authorParticipantId
      && isSameDay(parseISO(prev.createdAt), at) && differenceInMinutes(at, parseISO(prev.createdAt)) < 5
    out.push({ kind: 'message', key: m.id, message: m, showAuthor: m.kind === 'TEXT' && !sameBlock })
    prev = m
  }
  return out
}
