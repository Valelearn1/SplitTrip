import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { expect, it } from 'vitest'
import type { Expense } from '../../shared/api/types'
import { formatMoney } from '../../shared/utils/format'
import { ExpenseRow } from './ExpenseRow'

// Intl separa importo e valuta con uno spazio non separabile; Testing Library confronta il testo con spazi normali
const money = (n: number, c: string) => formatMoney(n, c).replace(/\s/g, ' ')

const cena: Expense = {
  id: 'e1', description: 'Cena a Bairro Alto', amount: 90, currency: 'EUR', date: '2026-11-03', category: 'FOOD', splitType: 'WEIGHT', dayBasis: null,
  payerId: 'p2', payerName: 'Marco', createdBy: 'u2', createdAt: '2026-11-03T20:00:00Z', receiptPhotoId: null,
  shares: [
    { participantId: 'p1', displayName: 'Vale', amount: 20, weight: 1 },
    { participantId: 'p2', displayName: 'Marco', amount: 40, weight: 2 },
    { participantId: 'p3', displayName: 'Nonna Pina', amount: 10, weight: 0.5 },
  ],
} as Expense

it('«Dettagli» apre la divisione completa e la quota di ognuno', async () => {
  render(<MemoryRouter><ExpenseRow expense={cena} currency="EUR" meId="p1" /></MemoryRouter>)
  const toggle = screen.getByRole('button', { name: 'Dettagli di Cena a Bairro Alto' })
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect(screen.queryByRole('list', { name: 'Quote di Cena a Bairro Alto' })).not.toBeInTheDocument()
  await userEvent.setup().click(toggle)
  expect(toggle).toHaveAttribute('aria-expanded', 'true')
  const quotes = screen.getByRole('list', { name: 'Quote di Cena a Bairro Alto' })
  expect(within(quotes).getByText('Marco · conta per 2')).toBeInTheDocument()
  expect(within(quotes).getByText(/40,00/)).toBeInTheDocument()
  expect(within(quotes).getByText('Tu')).toBeInTheDocument()
  expect(screen.getByText('Pagato da Marco · in parti uguali · Marco conta per 2, Nonna conta per ½')).toBeInTheDocument()
})

it('la mia quota è nella valuta del viaggio, non sempre in euro', () => {
  render(<MemoryRouter><ExpenseRow expense={{ ...cena, currency: 'JPY', amount: 9000, shares: [{ ...cena.shares[0], amount: 2000 }] }} currency="JPY" meId="p1" /></MemoryRouter>)
  expect(screen.getByText(`tua quota ${money(2000, 'JPY')}`)).toBeInTheDocument()
  expect(screen.queryByText(/€/)).not.toBeInTheDocument()
})

it('una spesa in yen mostra lo scontrino e, sotto, l\'importo nella valuta del viaggio', () => {
  render(<MemoryRouter><ExpenseRow currency="EUR" meId="p2" expense={{
    id: 'e1', description: 'Cena', amount: 2000, currency: 'JPY', fxRate: 0.00562366, amountBase: 11.25, date: '2026-11-02', category: 'FOOD',
    splitType: 'EQUAL', dayBasis: null, payerId: 'p1', payerName: 'Ada', createdBy: 'u1', createdAt: '2026-11-02T10:00:00Z', receiptPhotoId: null,
    shares: [{ participantId: 'p1', displayName: 'Ada', amount: 5.63, weight: null }, { participantId: 'p2', displayName: 'Bruno', amount: 5.62, weight: null }],
  }} /></MemoryRouter>)
  expect(screen.getByText(/2\.000\sJPY/)).toBeInTheDocument()
  expect(screen.getByText(/≈ 11,25\s€/)).toBeInTheDocument()
  expect(screen.getByText(/tua quota 5,62\s€/)).toBeInTheDocument()
})
