import { expect, it } from 'vitest'
import type { ChatMessage } from '../../shared/api/types'
import { buildTimeline } from './chatGrouping'

const m = (id: string, author: string | null, at: string, kind: 'TEXT' | 'EVENT' = 'TEXT'): ChatMessage => ({
  id, kind, authorParticipantId: author, authorName: author, authorUserId: null, authorHasAvatar: false,
  content: id, eventType: kind === 'EVENT' ? 'EXPENSE_CREATED' : null, refId: null, createdAt: at, deleted: false,
})

it('separatori «Ieri»/«Oggi» e autore solo sul primo di un blocco entro 5 minuti', () => {
  const now = new Date('2026-11-03T12:00:00')
  const t = buildTimeline([
    m('a', 'p1', '2026-11-02T20:00:00'), m('b', 'p1', '2026-11-03T09:00:00'), m('c', 'p1', '2026-11-03T09:03:00'),
    m('d', 'p1', '2026-11-03T09:10:00'), m('e', null, '2026-11-03T09:11:00', 'EVENT'), m('f', 'p1', '2026-11-03T09:12:00'),
  ], now)
  expect(t.map((i) => (i.kind === 'day' ? i.label : `${i.message.id}${i.showAuthor ? '*' : ''}`)))
    .toEqual(['Ieri', 'a*', 'Oggi', 'b*', 'c', 'd*', 'e', 'f*'])
})

it('giorni più vecchi con giorno della settimana abbreviato', () => {
  const t = buildTimeline([m('a', 'p1', '2026-11-01T10:00:00')], new Date('2026-11-05T10:00:00'))
  expect(t[0]).toMatchObject({ kind: 'day', label: 'dom 1 nov' })
})
