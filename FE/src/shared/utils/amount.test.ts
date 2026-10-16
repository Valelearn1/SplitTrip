import { describe, expect, it } from 'vitest'
import { nextAmount, sanitizeAmount, tidyAmount } from './amount'

/** Scrive un tasto alla volta in fondo al campo, come una persona. */
const typeKeys = (keys: string, start = '') => [...keys].reduce((prev, k) => nextAmount(prev, prev + k), start)

describe('sanitizeAmount (incolla)', () => {
  it.each([
    ['12a', '12'], ['€ 12,50', '12,50'], ['12.5', '12,5'], ['1,2,3', '1,23'], ['12,345', '12,34'],
    ['007', '7'], ['0,5', '0,5'], [',5', '0,5'], ['', ''], ['abc', ''],
    ['1.234,56', '1234,56'], ['1,234.56', '1234,56'], ['999999,99', '999999,99'], ['0,01', '0,01'],
    ['1.234', '1234'], ['12.50', '12,50'],                               // punto + 3 cifre = migliaia (nei soldi non ci sono 3 decimali)
    ['1234567', '1234567'], ['1.234.567', '1234567'], ['1.000.000,00', '1000000,00'],   // oltre il tetto: niente tagli, lo dice la validazione
  ])('%s → %s', (raw, out) => expect(sanitizeAmount(raw)).toBe(out))
})

describe('nextAmount (un tasto alla volta)', () => {
  it.each([
    ['12a', '12'], ['007', '7'], [',5', '0,5'], ['12,345', '12,34'], ['1234567', '123456'],
    ['12.5', '12.5'], ['1.234', '1.234'], ['1.234,56', '1.234,56'], ['1.234.567', '1.234.56'],
  ])('scrivere %s → %s', (keys, out) => expect(typeKeys(keys)).toBe(out))

  it('un separatore in più si rifiuta invece di spostare la virgola', () => {
    expect(nextAmount('12,50', '12,50.')).toBe('12,50')
    expect(nextAmount('12,5', '12,5.')).toBe('12,5')
    expect(nextAmount('12.50', '12.50.')).toBe('12.50')
  })

  it('una settima cifra intera si rifiuta anche in mezzo', () => {
    expect(nextAmount('123456,78', '9123456,78')).toBe('123456,78')
  })

  it('incollare ripulisce senza tagliare le cifre intere', () => {
    expect(nextAmount('', '€ 12,50')).toBe('12,50')
    expect(nextAmount('', '1.000.000,00')).toBe('1000000,00')
    expect(nextAmount('5', '1.234,56')).toBe('1.234,56')
  })

  it('cancellare lascia il campo com\'è', () => {
    expect(nextAmount('12,50', '1250')).toBe('1250')
    expect(nextAmount('1.234', '1.23')).toBe('1.23')
  })
})

describe('tidyAmount (uscendo dal campo)', () => {
  it.each([
    ['1.234,56', '1234,56'], ['1.234', '1234'], ['12.5', '12,5'], ['12,', '12'], ['', ''], ['12,50', '12,50'],
  ])('%s → %s', (raw, out) => expect(tidyAmount(raw)).toBe(out))
})
