import { afterAll, beforeAll, expect, it, vi } from 'vitest'
import { drawStory, type StoryData } from './storyCanvas'

// Canvas finto: registra le chiamate; i testi a parte (un importo come «1248,60 €» contiene una virgola)
function fakeCtx() {
  const calls: string[] = []
  const texts: string[] = []
  const ctx = new Proxy({} as CanvasRenderingContext2D, {
    get: (_t, prop) => {
      if (prop === 'canvas') return { width: 1080, height: 1920 }
      if (prop === 'measureText') return (s: string) => ({ width: s.length * 20 })
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return () => ({ addColorStop: () => {} })
      return (...args: unknown[]) => {
        if (prop === 'fillText') texts.push(String(args[0]).replace(/\s/g, ' '))
        calls.push(`${String(prop)}(${args.map((a) => (typeof a === 'string' ? a : typeof a === 'number' ? Math.round(a) : '…')).join(',')})`)
      }
    },
    set: () => true,
  })
  return { ctx, calls, texts }
}
// jsdom non ha Path2D (il logo disegna i continenti con i path dell'SVG)
beforeAll(() => vi.stubGlobal('Path2D', class {}))
afterAll(() => vi.unstubAllGlobals())

const data: StoryData = { name: 'Lisbona 2026', dates: '13–18 ott 2026 · 5 notti · 4 persone', total: 1248.6, perPerson: 312.15, photos: 16, messages: 34, currency: 'EUR',
  badges: [{ title: '💰 Il banchiere' }, { title: '📸 Il fotografo' }, { title: '💬 La voce del gruppo' }, { title: '🍝 Il buongustaio' }, { title: '⏱️ Il puntuale' }] }

it('senza foto disegna il gradiente, poi titolo, totale, numeri, al massimo 4 badge e la firma', () => {   // Review Focus 4
  const { ctx, calls, texts } = fakeCtx()
  drawStory(ctx, data)
  expect(texts).toEqual(['Lisbona 2026', '13–18 ott 2026 · 5 notti · 4 persone', '1248,60 €', 'in tutto', '312,15 €', 'a persona', '16', 'foto', '34', 'messaggi',
    '💰 Il banchiere', '📸 Il fotografo', '💬 La voce del gruppo', '🍝 Il buongustaio', 'SplitTrip · Dividete le spese, non gli amici.'])
  expect(calls.some((c) => c.startsWith('drawImage'))).toBe(false)
})

it('con una foto molto grande la ritaglia al formato 9:16 e la sfoca', () => {
  const { ctx, calls } = fakeCtx()
  drawStory(ctx, data, { width: 6000, height: 4000 } as unknown as HTMLImageElement)
  // 6000×4000 → si prende una fascia alta 4000 e larga 2250 (9:16) centrata: x = (6000−2250)/2 = 1875
  expect(calls.find((c) => c.startsWith('drawImage'))).toBe('drawImage(…,1875,0,2250,4000,0,0,1080,1920)')
})

it('un nome di viaggio lunghissimo si accorcia per stare nella larghezza', () => {
  const { ctx, texts } = fakeCtx()
  drawStory(ctx, { ...data, name: 'Il grande giro delle capitali del nord con gli amici di sempre' })
  expect(texts[0].endsWith('…')).toBe(true)
  expect(texts[0].length * 20).toBeLessThanOrEqual(960)                     // measureText finto: 20 px a carattere
})

it('le colonne a zero (foto, messaggi) non compaiono: resta la quota a persona', () => {
  const { ctx, texts } = fakeCtx()
  drawStory(ctx, { ...data, photos: 0, messages: 0 })
  expect(texts).toContain('a persona')
  expect(texts).not.toContain('foto')
  expect(texts).not.toContain('messaggi')
})
