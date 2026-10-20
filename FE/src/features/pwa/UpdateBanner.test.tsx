import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { UpdateBanner } from './UpdateBanner'

it('con una versione nuova: «Aggiorna» la attiva, «Dopo» la rimanda; senza, niente barra', async () => {
  const onUpdate = vi.fn(), onLater = vi.fn()
  const { rerender } = render(<UpdateBanner show={false} onUpdate={onUpdate} onLater={onLater} />)
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  rerender(<UpdateBanner show onUpdate={onUpdate} onLater={onLater} />)
  expect(screen.getByRole('status')).toHaveTextContent("C'è una nuova versione di SplitTrip")
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Aggiorna' }))
  await user.click(screen.getByRole('button', { name: 'Dopo' }))
  expect(onUpdate).toHaveBeenCalledTimes(1)
  expect(onLater).toHaveBeenCalledTimes(1)
})

it('testo sopra e i due pulsanti in una riga sotto, ai due estremi (D-65)', () => {
  render(<UpdateBanner show onUpdate={vi.fn()} onLater={vi.fn()} />)
  expect(screen.getByText("C'è una nuova versione di SplitTrip").closest('.ub-text')).not.toBeNull()
  const actions = screen.getByRole('button', { name: 'Aggiorna' }).closest('.ub-actions')
  expect(actions).not.toBeNull()
  expect(actions).toContainElement(screen.getByRole('button', { name: 'Dopo' }))
})
