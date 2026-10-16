import { render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import type { Wrapped } from '../../shared/api/types'
import { Podium } from './Podium'
import { Reveal } from './Reveal'

const data = {
  trip: { id: 't1', name: 'Napoli', destination: 'Napoli', startDate: '2026-09-10', endDate: '2026-09-14', nights: 4, people: 2, currency: 'EUR', coverPhotoId: null },
  totals: { groupTotal: 336, perPerson: 168, expenseCount: 4, photos: 0, messages: 2, reactions: 1 },
  guess: { mine: 300, played: 2, others: [{ participantId: 'p2', displayName: 'Marco', amount: 350, diff: 14 }, { participantId: 'p1', displayName: 'Vale', amount: 300, diff: 36 }] },
} as Wrapped
afterEach(() => { delete document.documentElement.dataset.reduceMotion })

it('com\'è andata la scommessa compare solo quando il numero si è fermato', async () => {
  render(<Reveal data={data} me="p1" colors={['#ffcf9f']} onContinue={() => {}} />)
  expect(screen.queryByText(/scarto di/)).not.toBeInTheDocument()            // il totale sta ancora salendo
  expect(await screen.findByText(/scarto di 36,00\s€/)).toBeInTheDocument()
  expect(screen.getByText(/336,00\s€/)).toBeInTheDocument()
})

it('con «Riduci le animazioni» totale e risultato subito', () => {
  document.documentElement.dataset.reduceMotion = 'true'
  render(<Reveal data={data} me="p1" colors={['#ffcf9f']} onContinue={() => {}} />)
  expect(screen.getByText(/scarto di 36,00\s€/)).toBeInTheDocument()
})

it('il podio usa il singolare con 1', () => {
  const p = (id: string, name: string, messages: number) => ({ participantId: id, displayName: name, hasAccount: true, userId: id, joinedAt: '2026-09-01T00:00:00Z', paid: 0, photos: 0, messages, reactionsReceived: 0, foodPaid: 0, places: 0 })
  render(<Podium title="Chi ha scritto di più" people={[p('p1', 'Vale', 1), p('p2', 'Marco', 3)]} value={(x) => x.messages} unit={['messaggio', 'messaggi']} />)
  expect(screen.getByText('1 messaggio')).toBeInTheDocument()
  expect(screen.getByText('3 messaggi')).toBeInTheDocument()
})
