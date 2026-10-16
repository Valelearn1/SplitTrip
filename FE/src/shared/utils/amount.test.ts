import { describe, expect, it } from 'vitest'
import { sanitizeAmount } from './amount'

describe('sanitizeAmount', () => {
  it.each([
    ['12a', '12'], ['€ 12,50', '12,50'], ['12.5', '12,5'], ['1,2,3', '1,23'], ['12,345', '12,34'],
    ['1234567', '123456'], ['007', '7'], ['0,5', '0,5'], [',5', '0,5'], ['', ''], ['abc', ''],
    ['1.234,56', '1234,56'], ['1,234.56', '1234,56'], ['999999,99', '999999,99'], ['0,01', '0,01'],
    ['1.234', '1234'], ['12.50', '12,50'], ['1.234.567', '123456'],   // punto + 3 cifre = migliaia (nei soldi non ci sono 3 decimali)
  ])('%s → %s', (raw, out) => expect(sanitizeAmount(raw)).toBe(out))
})
