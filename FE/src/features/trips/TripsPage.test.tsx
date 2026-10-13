import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { TripsPage } from './TripsPage'

function loggedIn() {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
}

describe('TripsPage', () => {
  it('mostra i viaggi con destinazione, date e stato', async () => {
    loggedIn()
    server.use(
      http.get('http://localhost/api/trips', () =>
        HttpResponse.json([
          { id: 't1', name: 'Roma 2026', destination: 'Roma', startDate: '2026-11-01', endDate: '2026-11-05', currency: 'EUR', status: 'PLANNING', memberCount: 3, myRole: 'ORGANIZER' },
        ]),
      ),
    )
    renderWithProviders([{ path: '/trips', element: <TripsPage /> }], '/trips')
    expect(await screen.findByRole('heading', { name: 'Roma 2026' })).toBeInTheDocument()
    expect(screen.getByText('Roma')).toBeInTheDocument()
    expect(screen.getByText('1 – 5 nov 2026')).toBeInTheDocument()
    expect(screen.getByText('In pianificazione')).toBeInTheDocument()
    expect(screen.getByText('3 partecipanti')).toBeInTheDocument()
  })

  it('senza viaggi mostra lo stato vuoto', async () => {
    loggedIn()
    server.use(http.get('http://localhost/api/trips', () => HttpResponse.json([])))
    renderWithProviders([{ path: '/trips', element: <TripsPage /> }], '/trips')
    expect(await screen.findByText('Nessun viaggio ancora')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Crea il tuo primo viaggio' })).toHaveAttribute('href', '/trips/new')
  })
})
