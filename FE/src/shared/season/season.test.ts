import { describe, expect, it } from 'vitest'
import { seasonOf, tripSeason } from './season'

describe('seasonOf', () => {
  it.each([['2026-03-01', 'spring'], ['2026-05-31', 'spring'], ['2026-06-01', 'summer'], ['2026-08-31', 'summer'],
    ['2026-09-01', 'autumn'], ['2026-11-30', 'autumn'], ['2026-12-01', 'winter'], ['2027-02-28', 'winter']])('%s → %s', (d, s) => {
    expect(seasonOf(d)).toBe(s)
  })
  it('sotto l\'equatore le stagioni sono invertite', () => {
    expect(seasonOf('2026-12-20', -33.9)).toBe('summer')
    expect(seasonOf('2026-07-10', -33.9)).toBe('winter')
  })
})

it('il viaggio prende la stagione del giorno a metà', () => {
  expect(tripSeason({ startDate: '2026-05-26', endDate: '2026-06-09', latitude: 38.7 })).toBe('summer')
  expect(tripSeason({ startDate: '2026-05-20', endDate: '2026-05-28', latitude: null })).toBe('spring')
})
