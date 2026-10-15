import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, expect, it } from 'vitest'
import { server } from '../../test/server'
import { loginAsVale, mount, msg, push } from './chatTestUtils'

beforeEach(loginAsVale)

it('reagire e togliere la reazione, con aggiornamento dal canale', async () => {
  const calls: string[] = []
  server.use(
    http.post('http://localhost/api/trips/t1/messages/m1/reactions/:emoji', ({ params }) => { calls.push(`+${params.emoji}`); return new HttpResponse(null, { status: 204 }) }),
    http.delete('http://localhost/api/trips/t1/messages/m1/reactions/:emoji', ({ params }) => { calls.push(`-${params.emoji}`); return new HttpResponse(null, { status: 204 }) }),
  )
  mount('ONGOING', [msg({ id: 'm1', content: 'Ci vediamo alle 20', reactions: [{ emoji: '👍', count: 1, participantIds: ['p2'] }] })])
  const user = userEvent.setup()
  const pill = await screen.findByRole('button', { name: 'pollice in su, 1' })
  await user.click(pill)                                                          // mi aggiungo
  await waitFor(() => expect(calls).toEqual(['+👍']))
  expect(screen.getByRole('button', { name: 'pollice in su, 2, tra cui tu' })).toBeInTheDocument()   // ottimistico
  act(() => push({ type: 'message.reacted', data: { id: 'm1', reactions: [{ emoji: '👍', count: 2, participantIds: ['p2', 'p1'] }, { emoji: '❤️', count: 1, participantIds: ['p2'] }] } }))
  expect(await screen.findByRole('button', { name: 'cuore, 1' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'pollice in su, 2, tra cui tu' }))             // la tolgo
  await waitFor(() => expect(calls).toEqual(['+👍', '-👍']))
  // da tastiera: il bottone «Reagisci» apre la striscia
  await user.click(screen.getByRole('button', { name: 'Reagisci' }))
  await user.click(screen.getByRole('button', { name: 'faccina che ride' }))
  await waitFor(() => expect(calls).toEqual(['+👍', '-👍', '+😂']))
})

it('niente reazioni su messaggi eliminati, righe evento e viaggio chiuso', async () => {
  mount('CLOSED', [msg({ id: 'm1', deleted: true, content: null, reactions: [] }), msg({ id: 'e1', kind: 'EVENT', authorParticipantId: null, content: 'Marco ha aggiunto «Cena»', eventType: 'EXPENSE_CREATED', reactions: [] })])
  await screen.findByText('Messaggio eliminato')
  expect(screen.queryByRole('button', { name: 'Reagisci' })).not.toBeInTheDocument()
})
