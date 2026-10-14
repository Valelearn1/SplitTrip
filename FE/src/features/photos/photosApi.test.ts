import { describe, expect, it, vi } from 'vitest'

const calls: { path: string; body: FormData }[] = []
vi.mock('../../shared/api/client', () => ({
  api: vi.fn(async (path: string, opts: { body: FormData }) => { calls.push({ path, body: opts.body }); return {} }),
}))

const { photosApi } = await import('./photosApi')

describe('photosApi.upload', () => {
  it('senza coordinate non manda latitude e longitude', async () => {
    await photosApi.upload('t1', { file: new Blob(['x']), caption: '  Colosseo ', takenAt: '2026-11-02T10:00:00Z' })
    const form = calls.at(-1)!.body
    expect(calls.at(-1)!.path).toBe('/trips/t1/photos')
    expect(form.get('file')).toBeInstanceOf(Blob)
    expect(form.get('caption')).toBe('Colosseo')
    expect(form.get('takenAt')).toBe('2026-11-02T10:00:00Z')
    expect(form.get('latitude')).toBeNull()
    expect(form.get('expenseId')).toBeNull()
  })

  it('con coordinate e spesa le manda entrambe', async () => {
    await photosApi.upload('t1', { file: new Blob(['x']), latitude: 41.89, longitude: 12.49, expenseId: 'e1' })
    const form = calls.at(-1)!.body
    expect(form.get('latitude')).toBe('41.89')
    expect(form.get('longitude')).toBe('12.49')
    expect(form.get('expenseId')).toBe('e1')
  })
})
