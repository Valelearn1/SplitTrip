import { QueryClient, QueryObserver } from '@tanstack/react-query'
import { expect, it } from 'vitest'
import { dataAgeLabel, oldestActiveData } from './dataAge'

const now = new Date(2026, 9, 19, 22, 5)

it('oggi: l\'ora dei dati', () => {
  expect(dataAgeLabel(new Date(2026, 9, 19, 21, 40).getTime(), now)).toBe('Sei offline · dati delle 21:40')
})

it('un altro giorno: data e ora', () => {
  expect(dataAgeLabel(new Date(2026, 9, 18, 9, 3).getTime(), now)).toBe('Sei offline · dati del 18/10 alle 09:03')
})

it('nessun dato sulla pagina: solo «Sei offline»', () => {
  expect(dataAgeLabel(null, now)).toBe('Sei offline')
})

it('conta il dato più vecchio tra le query attive, non quelle ferme', () => {
  const client = new QueryClient()
  client.setQueryData(['trips', 't1'], {}, { updatedAt: 2000 })
  client.setQueryData(['trips', 't1', 'balances'], {}, { updatedAt: 1000 })
  client.setQueryData(['home'], {}, { updatedAt: 500 })
  const cache = client.getQueryCache()
  const observe = (key: unknown[]) => new QueryObserver(client, { queryKey: key, queryFn: () => ({}), staleTime: Infinity }).subscribe(() => {})
  observe(['trips', 't1']); observe(['trips', 't1', 'balances'])   // la pagina mostra queste due, non la Home
  expect(oldestActiveData(cache)).toBe(1000)
})
