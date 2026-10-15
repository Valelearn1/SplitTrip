import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { expect, it } from 'vitest'
import type { Expense } from '../../shared/api/types'
import { ExpenseRow } from './ExpenseRow'

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
