import { describe, expect, it } from 'vitest'
import { expenseSchema, toExpenseInput } from './expenseSchema'

const base = { description: 'Cena', amount: '90', date: '2026-11-02', category: 'FOOD', payerId: 'u1', splitType: 'EQUAL' as const,
  shares: [{ userId: 'u1', included: true }, { userId: 'u2', included: true }, { userId: 'u3', included: false }] }

describe('expenseSchema', () => {
  it('EQUAL: manda solo i partecipanti inclusi, senza importi', () => {
    const parsed = expenseSchema.parse(base)
    expect(toExpenseInput(parsed)).toEqual({
      description: 'Cena', amount: 90, date: '2026-11-02', category: 'FOOD', payerId: 'u1', splitType: 'EQUAL',
      shares: [{ userId: 'u1' }, { userId: 'u2' }],
    })
  })

  it('CUSTOM: la somma delle quote deve corrispondere al totale', () => {
    const custom = { ...base, splitType: 'CUSTOM' as const, shares: [
      { userId: 'u1', included: true, amount: '40' }, { userId: 'u2', included: true, amount: '40' }, { userId: 'u3', included: false }] }
    const result = expenseSchema.safeParse(custom)
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('10,00')
  })

  it('CUSTOM valido converte gli importi in numeri', () => {
    const custom = { ...base, splitType: 'CUSTOM' as const, shares: [
      { userId: 'u1', included: true, amount: '50,50' }, { userId: 'u2', included: true, amount: '39.50' }, { userId: 'u3', included: false }] }
    const parsed = expenseSchema.parse(custom)
    expect(toExpenseInput(parsed).shares).toEqual([{ userId: 'u1', amount: 50.5 }, { userId: 'u2', amount: 39.5 }])
  })

  it('serve almeno un partecipante', () => {
    const none = { ...base, shares: base.shares.map((s) => ({ ...s, included: false })) }
    expect(expenseSchema.safeParse(none).success).toBe(false)
  })
})
