import { expect, it } from 'vitest'
import { parentOf } from './backTarget'

it.each([
  ['/trips/t1/expenses/new', '/trips/t1/expenses'],
  ['/trips/t1/expenses/e9/edit', '/trips/t1/expenses'],
  ['/trips/t1/expenses/trash', '/trips/t1/expenses'],
  ['/trips/t1/settlements/new', '/trips/t1/balances'],
  ['/trips/t1/expenses', '/trips/t1'],
  ['/trips/t1/balances', '/trips/t1'],
  ['/trips/t1/lists', '/trips/t1'],
  ['/trips/t1/photos', '/trips/t1'],
  ['/trips/t1/chat', '/trips/t1'],
  ['/trips/t1/settings', '/trips/t1'],
  ['/trips/t1/riepilogo', '/trips/t1'],
  ['/trips/t1/benvenuto', '/trips/t1'],
  ['/trips/t1', '/trips'],
  ['/trips/t1/', '/trips'],
  ['/trips/new', '/trips'],
  ['/join', '/trips'],
  ['/join/ROMA-7K2P', '/trips'],
  ['/notifications', '/trips'],
  ['/profile', '/trips'],
  ['/pagina-che-non-esiste', '/trips'],
  ['/termini', '/'],            // pagine legali: anche senza account, si torna alla presentazione
  ['/privacy', '/'],
])('da %s la pagina madre è %s', (from, to) => {
  expect(parentOf(from)).toBe(to)
})
