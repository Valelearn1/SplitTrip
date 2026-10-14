import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
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
