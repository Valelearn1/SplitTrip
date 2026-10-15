import { expect, it } from 'vitest'
import { chatFallbackInterval } from './useChat'

it('senza canale collegato la chat si ricarica da sola ogni 15 s; col canale no', () => {
  expect(chatFallbackInterval('connected')).toBe(false)
  expect(chatFallbackInterval('connecting')).toBe(15_000)
  expect(chatFallbackInterval('offline')).toBe(15_000)
})
