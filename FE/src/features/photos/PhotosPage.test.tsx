import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { expect, it } from 'vitest'
import { expectAccessible } from '../../test/a11y'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { TripLayout } from '../trips/TripLayout'
import { PhotosPage } from './PhotosPage'

const trip = {
  id: 't1', name: 'Roma', destination: 'Roma', startDate: '2026-11-01', endDate: '2026-11-05', currency: 'EUR', status: 'ONGOING',
  inviteCode: 'ROMA-7K2P', ownerId: 'u1',
  participants: [{ id: 'p1', userId: 'u1', displayName: 'Vale', role: 'ORGANIZER', defaultWeight: 1, arrivalDate: null, departureDate: null }],
}

it('la pagina delle foto è accessibile', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
  server.use(
    http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
    http.get('http://localhost/api/trips/t1/photos', () => HttpResponse.json([])),
  )
  renderWithProviders([{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'photos', element: <PhotosPage /> }] }], '/trips/t1/photos')
  expect(await screen.findByRole('heading', { name: 'Foto' })).toBeInTheDocument()
  await expectAccessible()
})
