import { expect, it } from 'vitest'
import { apiTarget } from './apiTarget.ts'

it('senza variabile il proxy resta quello di sviluppo; con API_TARGET va al backend del giro (D-66)', () => {
  expect(apiTarget({})).toEqual({ http: 'http://localhost:8080', ws: 'ws://localhost:8080' })
  expect(apiTarget({ API_TARGET: 'http://localhost:8081' })).toEqual({ http: 'http://localhost:8081', ws: 'ws://localhost:8081' })
})
