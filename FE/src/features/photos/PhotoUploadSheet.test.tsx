import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect, it, vi } from 'vitest'
import { server } from '../../test/server'
import { readPhotoMeta } from '../../shared/utils/image'
import { photosApi, type PhotoUpload } from './photosApi'
import { PhotoUploadSheet } from './PhotoUploadSheet'

vi.mock('../../shared/utils/image', () => ({
  readPhotoMeta: vi.fn(async () => ({ takenAt: '2026-11-02T10:00:00.000Z', latitude: 41.89, longitude: 12.49 })),
  downscale: vi.fn(async () => new Blob(['x'], { type: 'image/jpeg' })),
}))

// jsdom non può inviare un FormData attraverso il fetch di Node: qui si verifica cosa arriva all'API,
// la costruzione del FormData è verificata in photosApi.test.ts
it('la posizione parte solo se do il consenso, la data della foto sempre', async () => {
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  const sent: PhotoUpload[] = []
  vi.spyOn(photosApi, 'upload').mockImplementation(async (_tripId, p) => { sent.push(p); return { id: `p${sent.length}` } as never })
  render(<QueryClientProvider client={new QueryClient()}><PhotoUploadSheet tripId="t1" open onClose={() => {}} /></QueryClientProvider>)
  const user = userEvent.setup()
  const input = screen.getByLabelText('Scegli le foto')

  await user.upload(input, new File(['x'], 'a.jpg', { type: 'image/jpeg' }))
  const consent = await screen.findByRole('checkbox', { name: 'Mostra sulla mappa dove è stata scattata' })
  expect(consent).not.toBeChecked()
  await user.click(screen.getByRole('button', { name: 'Carica 1 foto' }))
  await waitFor(() => expect(sent).toHaveLength(1))
  expect(sent[0].latitude).toBeUndefined()
  expect(sent[0].longitude).toBeUndefined()
  expect(sent[0].takenAt).toBe('2026-11-02T10:00:00.000Z')

  await user.upload(input, new File(['y'], 'b.jpg', { type: 'image/jpeg' }))
  await user.click(await screen.findByRole('checkbox', { name: 'Mostra sulla mappa dove è stata scattata' }))
  await user.click(screen.getByRole('button', { name: 'Carica 1 foto' }))
  await waitFor(() => expect(sent).toHaveLength(2))
  expect(sent[1].latitude).toBe(41.89)
  expect(sent[1].longitude).toBe(12.49)
})

it('«Scatta foto» apre la fotocamera posteriore e la foto segue lo stesso percorso', async () => {
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  render(<QueryClientProvider client={new QueryClient()}><PhotoUploadSheet tripId="t1" open onClose={() => {}} /></QueryClientProvider>)
  const camera = screen.getByLabelText('Scatta una foto')
  expect(camera).toHaveAttribute('capture', 'environment')
  expect(camera).toHaveAttribute('accept', 'image/*')
  await userEvent.setup().upload(camera, new File(['x'], 'scatto.jpg', { type: 'image/jpeg' }))
  expect(await screen.findByRole('button', { name: 'Carica 1 foto' })).toBeInTheDocument()
})

it('«Cerca un luogo» mette la foto sulla mappa con nome e coordinate', async () => {
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  vi.mocked(readPhotoMeta).mockResolvedValueOnce({})            // foto senza GPS
  server.use(http.get('http://localhost/api/places', () => HttpResponse.json([{ name: 'Belvedere di Santa Luzia', detail: 'Alfama, Lisbona', latitude: 38.7128, longitude: -9.1297 }])))
  const sent: PhotoUpload[] = []
  vi.spyOn(photosApi, 'upload').mockImplementation(async (_tripId, p) => { sent.push(p); return { id: 'p1' } as never })
  render(<QueryClientProvider client={new QueryClient()}><PhotoUploadSheet tripId="t1" open onClose={() => {}} near={{ latitude: 38.72, longitude: -9.14 }} /></QueryClientProvider>)
  const user = userEvent.setup()
  await user.upload(screen.getByLabelText('Scegli le foto'), new File(['x'], 'a.jpg', { type: 'image/jpeg' }))
  await user.type(await screen.findByRole('combobox', { name: 'Cerca un luogo' }), 'belv')
  await user.click(await screen.findByRole('option', { name: /Belvedere/ }))
  await user.click(screen.getByRole('button', { name: 'Carica 1 foto' }))
  await waitFor(() => expect(sent).toHaveLength(1))
  expect(sent[0]).toMatchObject({ placeName: 'Belvedere di Santa Luzia', latitude: 38.7128, longitude: -9.1297 })
})
