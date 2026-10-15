import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { expect, it, vi } from 'vitest'
import { server } from '../../test/server'
import { PhotoViewer } from './PhotoViewer'

vi.mock('../../shared/ui/AuthImage', () => ({ AuthImage: () => <img alt="" /> }))

it('mostra il luogo e chi può lo cambia o lo toglie', async () => {
  let patched: unknown
  server.use(
    http.get('http://localhost/api/places', () => HttpResponse.json([{ name: 'Castello di São Jorge', detail: 'Lisbona', latitude: 38.7139, longitude: -9.1335 }])),
    http.patch('http://localhost/api/trips/t1/photos/p1/place', async ({ request }) => { patched = await request.json(); return HttpResponse.json({ id: 'p1', placeName: 'Castello di São Jorge', latitude: 38.7139, longitude: -9.1335 }) }),
  )
  const photo = { id: 'p1', kind: 'PHOTO', expenseId: null, uploaderId: 'u1', uploaderName: 'Vale', caption: null, takenAt: null, latitude: 38.7128, longitude: -9.1297, placeName: 'Belvedere di Santa Luzia', width: 1, height: 1, createdAt: '2026-11-02T10:00:00Z' } as const
  render(<QueryClientProvider client={new QueryClient()}><PhotoViewer tripId="t1" photo={photo} canDelete canEditPlace onClose={() => {}} /></QueryClientProvider>)
  expect(screen.getByText(/Belvedere di Santa Luzia/)).toBeInTheDocument()
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Cambia luogo' }))
  await user.type(screen.getByRole('combobox', { name: 'Luogo' }), 'cast')
  await user.click(await screen.findByRole('option', { name: /Castello/ }))
  await user.click(screen.getByRole('button', { name: 'Salva luogo' }))
  await waitFor(() => expect(patched).toEqual({ placeName: 'Castello di São Jorge', latitude: 38.7139, longitude: -9.1335 }))
})
