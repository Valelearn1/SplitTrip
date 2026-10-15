import { expect, it } from 'vitest'
import { wsUrl } from './wsUrl'

it('ricava l\'indirizzo del WebSocket dall\'API', () => {
  expect(wsUrl({ VITE_API_URL: 'https://splittrip-api.onrender.com/api' }, { protocol: 'https:', host: 'x' })).toBe('wss://splittrip-api.onrender.com/ws')
  expect(wsUrl({}, { protocol: 'http:', host: 'localhost:5173' })).toBe('ws://localhost:5173/ws')
  expect(wsUrl({ VITE_WS_URL: 'ws://altro/ws' }, { protocol: 'http:', host: 'x' })).toBe('ws://altro/ws')
})
