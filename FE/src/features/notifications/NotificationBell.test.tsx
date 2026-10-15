import { act, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { expect, it } from 'vitest'
import { LiveContext } from '../../shared/live/liveContext'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { NotificationBell } from './NotificationBell'

it('mostra il numero di non lette nel nome accessibile e nel badge', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false } }))
  server.use(http.get('http://localhost/api/notifications/unread-count', () => HttpResponse.json({ count: 3 })))
  renderWithProviders([{ path: '/', element: <NotificationBell /> }], '/')
  const bell = await screen.findByRole('link', { name: 'Notifiche, 3 non lette' })
  expect(bell).toHaveAttribute('href', '/notifications')
  expect(screen.getByText('3')).toBeInTheDocument()
})

it('si aggiorna subito quando arriva una notifica dal canale personale', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false } }))
  server.use(http.get('http://localhost/api/notifications/unread-count', () => HttpResponse.json({ count: 0 })))
  let push: ((body: unknown) => void) | undefined
  const live = { status: 'connected' as const, publish: () => {}, subscribe: (d: string, cb: (b: unknown) => void) => { if (d === '/user/queue/notifications') push = cb; return () => {} } }
  renderWithProviders([{ path: '/', element: <LiveContext value={live}><NotificationBell /></LiveContext> }], '/')
  await screen.findByRole('link', { name: 'Notifiche' })
  act(() => push!({ notification: { id: 'n1', tripId: 't1', type: 'EXPENSE_ADDED', message: 'Marco ha aggiunto «Cena»', link: '/trips/t1', readAt: null, createdAt: '2026-11-01T10:00:00Z' }, unreadCount: 5 }))
  expect(await screen.findByRole('link', { name: 'Notifiche, 5 non lette' })).toBeInTheDocument()
})
