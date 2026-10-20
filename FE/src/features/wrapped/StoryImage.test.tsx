import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { StoryImage } from './StoryImage'

it('offre di creare l\'immagine e dice che dentro non ci sono saldi personali', () => {
  render(<StoryImage data={{ name: 'Napoli', dates: '10–14 set 2026', total: 336, perPerson: 168, photos: 0, messages: 2, currency: 'EUR', badges: [] }} coverPath={null} />)
  expect(screen.getByRole('button', { name: /Crea l'immagine per le storie/ })).toBeInTheDocument()
  expect(screen.getByText(/nessun saldo personale/)).toBeInTheDocument()
})

it('senza condivisione del sistema offre «Scarica» con il file', async () => {
  const fake = new Proxy({} as CanvasRenderingContext2D, {   // come in storyCanvas.test: misure finte ma numeriche
    get: (_t, prop) => {
      if (prop === 'canvas') return { width: 1080, height: 1920 }
      if (prop === 'measureText') return (s: string) => ({ width: s.length * 20 })
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return () => ({ addColorStop: () => {} })
      return () => {}
    },
    set: () => true,
  })
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(fake)
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb) => cb(new Blob(['x'], { type: 'image/png' })))
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:storia')
  vi.stubGlobal('Path2D', class {})   // jsdom non ha Path2D (il logo nell'immagine)
  render(<StoryImage data={{ name: 'Napoli', dates: '10–14 set 2026', total: 336, perPerson: 168, photos: 0, messages: 2, currency: 'EUR', badges: [] }} coverPath={null} />)
  await userEvent.setup().click(screen.getByRole('button', { name: /Crea l'immagine per le storie/ }))
  const link = await screen.findByRole('link', { name: /Scarica/ })
  expect(link).toHaveAttribute('download', 'splittrip-napoli.png')
  vi.restoreAllMocks(); vi.unstubAllGlobals()
})
