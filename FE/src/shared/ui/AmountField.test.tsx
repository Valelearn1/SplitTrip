import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { AmountField } from './AmountField'

it('in yen il segnaposto è «0», la virgola non entra e il suffisso è JPY', async () => {
  render(<AmountField label="Importo" currency="JPY" />)
  const input = screen.getByLabelText('Importo')
  expect(input).toHaveAttribute('placeholder', '0')
  await userEvent.setup().type(input, '2000,5')
  expect(input).toHaveValue('20005')
  expect(screen.getByText('JPY')).toBeInTheDocument()
})

it('in euro il segnaposto è «0,00» e i decimali entrano', async () => {
  render(<AmountField label="Importo" currency="EUR" />)
  const input = screen.getByLabelText('Importo')
  expect(input).toHaveAttribute('placeholder', '0,00')
  await userEvent.setup().type(input, '12,5')
  expect(input).toHaveValue('12,5')
})
