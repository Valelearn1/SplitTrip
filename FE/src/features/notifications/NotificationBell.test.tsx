import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { expect, it } from 'vitest'
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
