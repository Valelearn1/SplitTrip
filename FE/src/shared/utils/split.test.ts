import { describe, expect, it } from 'vitest'
import { defaultBasis, presence, splitByWeight } from './split'

const trip = { startDate: '2026-10-01', endDate: '2026-10-06' }

describe('presence', () => {
  it('tutto il viaggio con date nulle', () => {
    expect(presence(trip, { arrivalDate: null, departureDate: null }, 'DAYS')).toBe(6)
    expect(presence(trip, { arrivalDate: null, departureDate: null }, 'NIGHTS')).toBe(5)
  })
  it('chi arriva il 3 fa 4 giorni e 3 notti', () => {
    expect(presence(trip, { arrivalDate: '2026-10-03', departureDate: null }, 'DAYS')).toBe(4)
    expect(presence(trip, { arrivalDate: '2026-10-03', departureDate: null }, 'NIGHTS')).toBe(3)
  })
  it('date fuori dal viaggio vengono tagliate, intervallo vuoto dà 0', () => {
    expect(presence(trip, { arrivalDate: '2026-09-20', departureDate: '2026-10-20' }, 'NIGHTS')).toBe(5)
    expect(presence(trip, { arrivalDate: '2026-10-07', departureDate: null }, 'DAYS')).toBe(0)
    expect(presence(trip, { arrivalDate: '2026-10-02', departureDate: '2026-10-02' }, 'NIGHTS')).toBe(0)
  })
})

describe('splitByWeight', () => {
  it('stessi esempi del backend', () => {
    expect([...splitByWeight(10000, [{ id: 'a', weight: 2 }, { id: 'b', weight: 1 }, { id: 'c', weight: 1 }]).values()]).toEqual([5000, 2500, 2500])
    expect([...splitByWeight(10000, [{ id: 'c', weight: 1 }, { id: 'a', weight: 1 }, { id: 'b', weight: 1 }]).entries()]).toEqual([['a', 3334], ['b', 3333], ['c', 3333]])
    expect([...splitByWeight(1000, [{ id: 'a', weight: 1 }, { id: 'b', weight: 2 }]).values()]).toEqual([333, 667])
    expect([...splitByWeight(1000, [{ id: 'a', weight: 3 }, { id: 'b', weight: 0 }]).values()]).toEqual([1000, 0])
    expect([...splitByWeight(1, [{ id: 'b', weight: 1 }, { id: 'a', weight: 1 }]).entries()]).toEqual([['a', 1], ['b', 0]])
  })
  it('somma pesi zero dà tutte quote zero senza errori', () => {
    expect([...splitByWeight(1000, [{ id: 'a', weight: 0 }]).values()]).toEqual([0])
  })
  it('la somma torna sempre al totale', () => {
    for (const total of [1, 3, 100, 9999, 1234567]) {
      for (const ws of [[1, 1, 1], [2.5, 0.5], [5, 3, 0]]) {
        const parts = splitByWeight(total, ws.map((w, i) => ({ id: String(i), weight: w })))
        expect([...parts.values()].reduce((a, b) => a + b, 0)).toBe(total)
      }
    }
  })
})

it('defaultBasis: notti per alloggio, giorni per il resto', () => {
  expect(defaultBasis('LODGING')).toBe('NIGHTS')
  expect(defaultBasis('FOOD')).toBe('DAYS')
})
