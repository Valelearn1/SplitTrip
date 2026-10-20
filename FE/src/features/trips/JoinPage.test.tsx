import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { JoinPage } from './JoinPage'
import { expectAccessible } from '../../test/a11y'

it('propone i posti liberi e manda participantId se ne scelgo uno', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u9', email: 'p@e.it', displayName: 'Giuseppina' } }))
  let sent: unknown
  server.use(
    http.get('http://localhost/api/trips/join-preview', () => HttpResponse.json({
      name: 'Roma', destination: 'Roma', startDate: '2026-11-01', endDate: '2026-11-05', memberCount: 2,
      unclaimed: [{ id: 'p3', displayName: 'Nonna Pina' }],
    })),
    http.post('http://localhost/api/trips/join', async ({ request }) => { sent = await request.json(); return HttpResponse.json({ id: 't1' }) }),
  )
  renderWithProviders([{ path: '/join/:code', element: <JoinPage /> }, { path: '/trips/:tripId/benvenuto', element: <h1>Viaggio</h1> }], '/join/ROMA-7K2P')
  const user = userEvent.setup()
  expect(await screen.findByText('Sei già nella lista del viaggio?')).toBeInTheDocument()
  expect(screen.getByRole('radio', { name: 'No, non sono nella lista' })).toBeChecked()
  await user.click(screen.getByRole('radio', { name: 'Nonna Pina' }))
  await user.click(screen.getByRole('button', { name: 'Entra' }))
  expect(await screen.findByRole('heading', { name: 'Viaggio' })).toBeInTheDocument()
  expect(sent).toEqual({ code: 'ROMA-7K2P', participantId: 'p3' })
  await expectAccessible()   // D-65
})

it('con una sola persona nel viaggio scrive «1 partecipante»', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u9', email: 'p@e.it', displayName: 'Giuseppina' } }))
  server.use(http.get('http://localhost/api/trips/join-preview', () => HttpResponse.json({
    name: 'Roma', destination: 'Roma', startDate: '2026-11-01', endDate: '2026-11-05', memberCount: 1, unclaimed: [],
  })))
  renderWithProviders([{ path: '/join/:code', element: <JoinPage /> }], '/join/ROMA-7K2P')
  expect(await screen.findByText('1 partecipante')).toBeInTheDocument()
})
