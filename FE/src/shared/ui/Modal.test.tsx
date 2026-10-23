import { render, screen } from '@testing-library/react'
import { StrictMode } from 'react'
import { expect, it, vi } from 'vitest'
import { Modal } from './Modal'

it('ogni modale ha il proprio titolo come nome, anche con più modali nella pagina', () => {
  render(
    <>
      <Modal open={false} title="Eliminare «Valigia»?" onClose={() => {}}>a</Modal>
      <Modal open={false} title="Eliminare «Spesa»?" onClose={() => {}}>b</Modal>
    </>,
  )
  const [first, second] = screen.getAllByRole('dialog', { hidden: true })
  // aria-labelledby deve puntare al titolo della propria modale, non al primo con lo stesso id
  const titleOf = (d: HTMLElement) => document.getElementById(d.getAttribute('aria-labelledby') ?? '')?.textContent
  expect(titleOf(first)).toBe('Eliminare «Valigia»?')
  expect(titleOf(second)).toBe('Eliminare «Spesa»?')
})

it('in StrictMode (sviluppo) la modale resta aperta: il doppio effetto non la chiude e non chiama onClose', () => {
  const onClose = vi.fn()
  render(<StrictMode><Modal open title="Prova" onClose={onClose}><p>ciao</p></Modal></StrictMode>)
  expect(screen.getByRole('dialog', { name: 'Prova' })).toHaveAttribute('open')
  expect(onClose).not.toHaveBeenCalled()
})
