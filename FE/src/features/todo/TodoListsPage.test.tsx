import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { TripLayout } from '../trips/TripLayout'
import { TodoListsPage } from './TodoListsPage'
import { expectAccessible } from '../../test/a11y'

const trip = {
  id: 't1', name: 'Roma', destination: 'Roma', startDate: '2026-11-01', endDate: '2026-11-05', currency: 'EUR', status: 'ONGOING',
  inviteCode: 'ROMA-7K2P', ownerId: 'u1',
  participants: [
    { id: 'p1', userId: 'u1', displayName: 'Vale', role: 'ORGANIZER', defaultWeight: 1, arrivalDate: null, departureDate: null, hasAvatar: false },
    { id: 'p2', userId: 'u2', displayName: 'Marco', role: 'MEMBER', defaultWeight: 1, arrivalDate: null, departureDate: null, hasAvatar: false },
  ],
}

it('spunta una voce, la assegna a un partecipante e filtra le mie', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u2', email: 'm@e.it', displayName: 'Marco', hasAvatar: false } }))
  const lists = [{ id: 'l1', title: 'Valigia', type: 'PACKING', createdAt: '2026-10-14T10:00:00Z', items: [
    { id: 'i1', text: 'Phon', done: false, assigneeParticipantId: 'p1', assigneeName: 'Vale', assigneeLeft: false, createdBy: 'u1', createdAt: '2026-10-14T10:00:00Z' },
    { id: 'i2', text: 'Costume', done: false, assigneeParticipantId: null, assigneeName: null, assigneeLeft: false, createdBy: 'u1', createdAt: '2026-10-14T10:01:00Z' },
  ] }]
  const patches: unknown[] = []
  server.use(
    http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
    http.get('http://localhost/api/trips/t1/balances', () => HttpResponse.json({ balances: [], suggestedTransfers: [] })),
    http.get('http://localhost/api/trips/t1/messages/unread-count', () => HttpResponse.json({ count: 0 })),
    http.get('http://localhost/api/trips/t1/ai/tips', () => HttpResponse.json({ available: false, remainingToday: 5, tips: [], generatedAt: null })),
    http.get('http://localhost/api/notifications/unread-count', () => HttpResponse.json({ count: 0 })),
    http.get('http://localhost/api/trips/t1/todo-lists', () => HttpResponse.json(lists)),
    http.patch('http://localhost/api/trips/t1/todo-lists/l1/items/:iid', async ({ request, params }) => {
      patches.push({ iid: params.iid, body: await request.json() })
      return HttpResponse.json(lists[0].items[0])
    }),
  )
  renderWithProviders([{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'lists', element: <TodoListsPage /> }] }], '/trips/t1/lists')
  const user = userEvent.setup()
  expect(await screen.findByRole('heading', { name: 'Valigia' })).toBeInTheDocument()
  await user.click(screen.getByRole('checkbox', { name: 'Phon' }))
  expect(patches[0]).toEqual({ iid: 'i1', body: { done: true } })
  // la lista è del gruppo, e lo dice
  expect(screen.getByText('Lista condivisa: decidete chi porta cosa')).toBeInTheDocument()
  // chi porta il phon è già deciso: si vede subito; per il costume la scelta compare solo se la chiedo
  expect(screen.getByRole('combobox', { name: 'Chi porta Phon?' })).toHaveValue('p1')
  expect(screen.queryByRole('combobox', { name: 'Chi porta Costume?' })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Chi porta Costume?' }))
  await user.selectOptions(screen.getByRole('combobox', { name: 'Chi porta Costume?' }), 'p2')
  expect(patches[1]).toEqual({ iid: 'i2', body: { assigneeParticipantId: 'p2' } })
  await user.selectOptions(screen.getByRole('combobox', { name: 'Chi porta Costume?' }), '')
  expect(patches[2]).toEqual({ iid: 'i2', body: { clearAssignee: true } })
  await user.click(screen.getByRole('checkbox', { name: 'Solo quelle per me' }))
  expect(screen.queryByText('Phon')).not.toBeInTheDocument() // assegnato a Vale, non a me
  await expectAccessible()   // D-65
})

it('a lista Valigia completata la valigia si chiude, e lo dice anche il testo', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false } }))
  const done = (id: string, text: string) => ({ id, text, done: true, assigneeParticipantId: null, assigneeName: null, assigneeLeft: false, createdBy: 'u1', createdAt: '2026-10-14T10:00:00Z' })
  server.use(
    http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
    http.get('http://localhost/api/trips/t1/balances', () => HttpResponse.json({ balances: [], suggestedTransfers: [] })),
    http.get('http://localhost/api/notifications/unread-count', () => HttpResponse.json({ count: 0 })),
    http.get('http://localhost/api/trips/t1/messages/unread-count', () => HttpResponse.json({ count: 0 })),
    http.get('http://localhost/api/trips/t1/ai/tips', () => HttpResponse.json({ available: false, remainingToday: 5, tips: [], generatedAt: null })),
    http.get('http://localhost/api/trips/t1/todo-lists', () => HttpResponse.json([
      { id: 'l1', title: 'Valigia', type: 'PACKING', createdAt: '2026-10-14T10:00:00Z', items: [done('i1', 'Phon'), done('i2', 'Costume')] },
    ])),
  )
  renderWithProviders([{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'lists', element: <TodoListsPage /> }] }], '/trips/t1/lists')
  const heading = await screen.findByRole('heading', { name: 'Valigia' })
  expect(heading.querySelector('[data-state]')).toHaveAttribute('data-state', 'closed')
  expect(screen.getByText('2/2 fatte')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /^Chi porta/ })).not.toBeInTheDocument() // voci già fatte: non serve più chiederlo
})

it('si crea una lista «Da portare (insieme)» o «Da fare»: sono del gruppo', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false } }))
  let created: unknown
  server.use(
    http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
    http.get('http://localhost/api/trips/t1/balances', () => HttpResponse.json({ balances: [], suggestedTransfers: [] })),
    http.get('http://localhost/api/notifications/unread-count', () => HttpResponse.json({ count: 0 })),
    http.get('http://localhost/api/trips/t1/messages/unread-count', () => HttpResponse.json({ count: 0 })),
    http.get('http://localhost/api/trips/t1/ai/tips', () => HttpResponse.json({ available: false, remainingToday: 5, tips: [], generatedAt: null })),
    http.get('http://localhost/api/trips/t1/todo-lists', () => HttpResponse.json([])),
    http.post('http://localhost/api/trips/t1/todo-lists', async ({ request }) => { created = await request.json(); return HttpResponse.json({ id: 'l9', items: [] }, { status: 201 }) }),
  )
  renderWithProviders([{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'lists', element: <TodoListsPage /> }] }], '/trips/t1/lists')
  const user = userEvent.setup()
  expect(await screen.findByText('Le liste sono del gruppo: le vedono e le usano tutte le persone del viaggio.')).toBeInTheDocument()
  await user.type(screen.getByLabelText('Nome'), 'Prenotazioni')
  await user.click(screen.getByRole('radio', { name: 'Da fare' }))
  await user.click(screen.getByRole('button', { name: 'Crea lista' }))
  await waitFor(() => expect(created).toEqual({ title: 'Prenotazioni', type: 'GENERAL' }))
  expect(screen.getByRole('radio', { name: 'Da portare (insieme)' })).toBeInTheDocument()
})
