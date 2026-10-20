import { expect, it, vi } from 'vitest'
import { checkForUpdate } from './updateCheck'

it('offline non cerca aggiornamenti; online un errore non resta senza gestione', async () => {
  const offline = { update: vi.fn(async () => {}) }
  checkForUpdate(offline, false)
  expect(offline.update).not.toHaveBeenCalled()
  const failing = { update: vi.fn(async () => { throw new TypeError('Failed to fetch') }) }
  checkForUpdate(failing, true)
  await new Promise((r) => setTimeout(r, 0))
  expect(failing.update).toHaveBeenCalled()
})
