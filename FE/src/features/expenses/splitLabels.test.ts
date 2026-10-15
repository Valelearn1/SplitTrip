import { expect, it } from 'vitest'
import { splitLabel } from './splitLabels'

it('etichetta del tipo di divisione, con le mie notti se sono incluso', () => {
  const share = (participantId: string, weight: number | null) => ({ participantId, displayName: '', amount: 0, weight })
  expect(splitLabel({ splitType: 'EQUAL', dayBasis: null, shares: [] })).toBe('in parti uguali')
  expect(splitLabel({ splitType: 'CUSTOM', dayBasis: null, shares: [] })).toBe('importi personalizzati')
  expect(splitLabel({ splitType: 'WEIGHT', dayBasis: null, shares: [] })).toBe('in parti uguali')
  const named = (displayName: string, weight: number) => ({ participantId: displayName, displayName, amount: 0, weight })
  expect(splitLabel({ splitType: 'WEIGHT', dayBasis: null, shares: [named('Vale Rossi', 1), named('Marco Bianchi', 2), named('Nonna Pina', 0.5)] }))
    .toBe('in parti uguali · Marco conta per 2, Nonna conta per ½')
  expect(splitLabel({ splitType: 'DAYS', dayBasis: 'NIGHTS', shares: [share('p1', 3)] }, 'p1')).toBe('per presenza (3 notti)')
  expect(splitLabel({ splitType: 'DAYS', dayBasis: 'DAYS', shares: [share('p1', 3)] }, 'p2')).toBe('per presenza (giorni)')
})
