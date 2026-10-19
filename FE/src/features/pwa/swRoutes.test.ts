import { expect, it } from 'vitest'
import { imageRoutes } from './swRoutes'

const prod = imageRoutes('https://splittrip-api.onrender.com/api')

it('in cache foto, miniature e avatar del server di produzione', () => {
  expect(prod.photos.test('https://splittrip-api.onrender.com/api/trips/t1/photos/p1/image')).toBe(true)
  expect(prod.photos.test('https://splittrip-api.onrender.com/api/trips/t1/photos/p1/thumbnail')).toBe(true)
  expect(prod.avatars.test('https://splittrip-api.onrender.com/api/users/u1/avatar')).toBe(true)
})

it('mai i dati JSON né altri server', () => {
  expect(prod.photos.test('https://splittrip-api.onrender.com/api/trips/t1/photos')).toBe(false)
  expect(prod.photos.test('https://splittrip-api.onrender.com/api/trips/t1/expenses')).toBe(false)
  expect(prod.avatars.test('https://splittrip-api.onrender.com/api/me')).toBe(false)
  expect(prod.photos.test('https://altro.example.com/api/trips/t1/photos/p1/image')).toBe(false)
})

it('con l\'API relativa (sviluppo, preview) vale su qualsiasi origine', () => {
  const local = imageRoutes('/api')
  expect(local.photos.test('http://localhost:4173/api/trips/t1/photos/p1/image')).toBe(true)
  expect(local.avatars.test('http://localhost:4173/api/users/u1/avatar')).toBe(true)
})
