import { onlineManager } from '@tanstack/react-query'
import { afterEach, expect, it } from 'vitest'
import { watchBrowserNetwork } from './networkState'

afterEach(() => watchBrowserNetwork(window, { onLine: true }))

it('aprendo l\'app già senza rete (modalità aereo) si parte offline, non «online per default»', () => {
  const target = new EventTarget()
  watchBrowserNetwork(target, { onLine: false })
  expect(onlineManager.isOnline()).toBe(false)
  target.dispatchEvent(new Event('online'))
  expect(onlineManager.isOnline()).toBe(true)
  target.dispatchEvent(new Event('offline'))
  expect(onlineManager.isOnline()).toBe(false)
})
