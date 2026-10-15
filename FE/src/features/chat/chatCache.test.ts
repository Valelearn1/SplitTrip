import { expect, it } from 'vitest'
import type { ChatMessage } from '../../shared/api/types'
import { insertMessage, markDeleted } from './chatCache'

const msg = (id: string, content = id): ChatMessage => ({
  id, kind: 'TEXT', authorParticipantId: 'p1', authorName: 'Vale', authorUserId: 'u1', authorHasAvatar: false,
  content, eventType: null, refId: null, createdAt: '2026-11-01T10:00:00Z', deleted: false,
})
const data = { pages: [{ items: [msg('b'), msg('a')], hasMore: false }], pageParams: [undefined] }

it('un messaggio nuovo va in cima; uno già presente non si duplica (Review Focus 2)', () => {
  const once = insertMessage(data, msg('c'))
  expect(once!.pages[0].items.map((m) => m.id)).toEqual(['c', 'b', 'a'])
  expect(insertMessage(once, msg('c'))!.pages[0].items).toHaveLength(3)
  expect(insertMessage(undefined, msg('c'))).toBeUndefined()
})

it('eliminato: niente testo e flag deleted', () => {
  const after = markDeleted(data, 'a')
  expect(after!.pages[0].items[1]).toMatchObject({ id: 'a', content: null, deleted: true })
})
