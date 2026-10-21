import { describe, expect, it } from 'vitest'
import { settlementSchema } from '../balances/settlementSchema'
import { amountSchema, expenseSchema, parseCents, toExpenseInput } from './expenseSchema'

const base = { description: 'Cena', amount: '90', date: '2026-11-02', category: 'FOOD', payerId: 'p1', splitType: 'EQUAL' as const, dayBasis: 'DAYS' as const,
  shares: [{ participantId: 'p1', included: true }, { participantId: 'p2', included: true }, { participantId: 'p3', included: false }] }

describe('expenseSchema', () => {
  it('EQUAL: manda solo i partecipanti inclusi, senza importi', () => {
    const parsed = expenseSchema('EUR').parse(base)
    expect(toExpenseInput(parsed)).toEqual({
      description: 'Cena', amount: 90, currency: 'EUR', fxRate: 1, date: '2026-11-02', category: 'FOOD', payerId: 'p1', splitType: 'EQUAL',
      shares: [{ participantId: 'p1' }, { participantId: 'p2' }],
    })
  })

  it('CUSTOM: la somma delle quote deve corrispondere al totale', () => {
    const custom = { ...base, splitType: 'CUSTOM' as const, shares: [
      { participantId: 'p1', included: true, amount: '40' }, { participantId: 'p2', included: true, amount: '40' }, { participantId: 'p3', included: false }] }
    const result = expenseSchema('EUR').safeParse(custom)
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('10,00')
  })

  it('CUSTOM valido converte gli importi in numeri', () => {
    const custom = { ...base, splitType: 'CUSTOM' as const, shares: [
      { participantId: 'p1', included: true, amount: '50,50' }, { participantId: 'p2', included: true, amount: '39.50' }, { participantId: 'p3', included: false }] }
    const parsed = expenseSchema('EUR').parse(custom)
    expect(toExpenseInput(parsed).shares).toEqual([{ participantId: 'p1', amount: 50.5 }, { participantId: 'p2', amount: 39.5 }])
  })

  it('serve almeno un partecipante', () => {
    const none = { ...base, shares: base.shares.map((s) => ({ ...s, included: false })) }
    expect(expenseSchema('EUR').safeParse(none).success).toBe(false)
  })

  it('WEIGHT: pesi validi passano, tutti a zero no', () => {
    const weighted = { ...base, splitType: 'WEIGHT' as const, shares: [
      { participantId: 'p1', included: true, weight: '2' }, { participantId: 'p2', included: true, weight: '0' }, { participantId: 'p3', included: false }] }
    expect(toExpenseInput(expenseSchema('EUR').parse(weighted)).shares).toEqual([{ participantId: 'p1', weight: 2 }, { participantId: 'p2', weight: 0 }])
    const zero = { ...weighted, shares: weighted.shares.map((s) => ({ ...s, weight: '0' })) }
    const result = expenseSchema('EUR').safeParse(zero)
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Almeno uno deve contare per più di zero')
  })

  it('parti uguali: se qualcuno conta per più o meno di 1 si invia WEIGHT, altrimenti EQUAL senza pesi', () => {
    const counts = (w1: string, w2: string) => ({ ...base, splitType: 'EQUAL' as const, shares: [
      { participantId: 'p1', included: true, weight: w1 }, { participantId: 'p2', included: true, weight: w2 }, { participantId: 'p3', included: false, weight: '2' }] })
    expect(toExpenseInput(expenseSchema('EUR').parse(counts('1', '2')))).toMatchObject({ splitType: 'WEIGHT', shares: [{ participantId: 'p1', weight: 1 }, { participantId: 'p2', weight: 2 }] })
    expect(toExpenseInput(expenseSchema('EUR').parse(counts('1', '1')))).toMatchObject({ splitType: 'EQUAL', shares: [{ participantId: 'p1' }, { participantId: 'p2' }] })
    expect(toExpenseInput(expenseSchema('EUR').parse(counts('1', '1'))).shares[0]).not.toHaveProperty('weight')
    expect(expenseSchema('EUR').safeParse(counts('1', 'abc')).success).toBe(false)
  })

  it('oltre 999.999,99 il messaggio dice il tetto, non «maggiore di zero»', () => {
    const r = expenseSchema('EUR').safeParse({ ...base, amount: '1000000,00' })
    expect(r.success).toBe(false)
    expect(r.error?.issues.find((i) => i.path[0] === 'amount')?.message).toBe('Al massimo 999.999,99')
    const s = settlementSchema('EUR').safeParse({ fromParticipantId: 'p1', toParticipantId: 'p2', amount: '1000000', date: '2026-11-02' })
    expect(s.error?.issues.find((i) => i.path[0] === 'amount')?.message).toBe('Al massimo 999.999,99')
  })

  it('parseCents legge anche i punti delle migliaia rimasti nel campo', () => {
    expect(parseCents('1.234,56')).toBe(123456)
    expect(parseCents('1.234')).toBe(123400)
    expect(parseCents('12.5')).toBe(1250)
  })
})

it('tetto per valuta (D-70): 999.999,99 con centesimi, 99.999.999 senza', () => {
  expect(amountSchema('EUR').safeParse('999999,99').success).toBe(true)
  expect(amountSchema('EUR').safeParse('1000000').success).toBe(false)
  expect(amountSchema('JPY').safeParse('99999999').success).toBe(true)
  expect(amountSchema('JPY').safeParse('100000000').error?.issues[0].message).toBe('Al massimo 99.999.999')
  expect(amountSchema('JPY').safeParse('2000,5').error?.issues[0].message).toBe('Lo yen non ha centesimi')
  expect(parseCents('99999999', 'JPY')).toBe(9_999_999_900)
  expect(parseCents('1000000', 'EUR')).toBeNull()
})
