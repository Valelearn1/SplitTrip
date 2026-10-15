import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { expect, it } from 'vitest'
import { LiveContext } from '../../shared/live/liveContext'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { TripLayout } from './TripLayout'

it('il canale del viaggio si apre solo quando risulto partecipante (niente sottoscrizioni rifiutate)', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u9', email: 'x@e.it', displayName: 'Estraneo', hasAvatar: false } }))
  server.use(
    http.get('http://localhost/api/trips/t1', () => HttpResponse.json({
      id: 't1', name: 'Roma', destination: 'Roma', startDate: '2026-11-01', endDate: '2026-11-05', currency: 'EUR', status: 'ONGOING',
      inviteCode: 'ROMA-7K2P', ownerId: 'u1',
      participants: [{ id: 'p1', userId: 'u1', displayName: 'Vale', role: 'ORGANIZER', defaultWeight: 1, arrivalDate: null, departureDate: null, hasAvatar: false }],
    })),
    http.get('http://localhost/api/trips/t1/balances', () => HttpResponse.json({ balances: [], suggestedTransfers: [] })),
  )
  const destinations: string[] = []
  const live = { status: 'connected' as const, publish: () => {}, subscribe: (d: string) => { destinations.push(d); return () => {} } }
  renderWithProviders([{ path: '/trips/:tripId', element: <LiveContext value={live}><TripLayout /></LiveContext> }], '/trips/t1')
  expect(await screen.findByText('Non fai parte di questo viaggio.')).toBeInTheDocument()
  expect(destinations).toEqual([])
})
