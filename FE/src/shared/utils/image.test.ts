import { afterEach, describe, expect, it, vi } from 'vitest'
import { downscale, fitSize } from './image'

describe('fitSize', () => {
  it('riduce il lato lungo a 1600 mantenendo le proporzioni', () => {
    expect(fitSize(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 })
    expect(fitSize(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 })
  })
  it('non ingrandisce le immagini piccole', () => {
    expect(fitSize(800, 600, 1600)).toEqual({ width: 800, height: 600 })
  })
})

describe('downscale', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('disegna su un canvas 1600×1200 e lo esporta in JPEG 0,85', async () => {
    const close = vi.fn()
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 4000, height: 3000, close })))
    const drawImage = vi.fn()
    const toBlob = vi.fn((cb: (b: Blob | null) => void, type: string, quality: number) => cb(new Blob(['x'], { type: `${type};q=${quality}` })))
    const canvas = { width: 0, height: 0, getContext: () => ({ drawImage, fillRect: vi.fn(), fillStyle: '' }), toBlob }
    const realCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => (tag === 'canvas' ? canvas : realCreate(tag))) as typeof document.createElement)

    const blob = await downscale(new File(['x'], 'a.jpg', { type: 'image/jpeg' }))
    expect(canvas.width).toBe(1600)
    expect(canvas.height).toBe(1200)
    expect(drawImage).toHaveBeenCalled()
    expect(toBlob.mock.calls[0][1]).toBe('image/jpeg')
    expect(toBlob.mock.calls[0][2]).toBe(0.85)
    expect(blob.size).toBeGreaterThan(0)
    expect(close).toHaveBeenCalled()
  })

  it('riempie di bianco prima di disegnare: un PNG trasparente non diventa nero nel JPEG', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 100, height: 50, close: vi.fn() })))
    const calls: string[] = []
    const ctx = {
      fillStyle: '',
      fillRect: vi.fn(() => calls.push(`fillRect ${ctx.fillStyle}`)),
      drawImage: vi.fn(() => calls.push('drawImage')),
    }
    const canvas = { width: 0, height: 0, getContext: () => ctx, toBlob: (cb: (b: Blob | null) => void) => cb(new Blob(['x'])) }
    const realCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => (tag === 'canvas' ? canvas : realCreate(tag))) as typeof document.createElement)

    await downscale(new File(['x'], 'a.png', { type: 'image/png' }))
    expect(calls).toEqual(['fillRect #ffffff', 'drawImage'])
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 100, 50)
  })
})
