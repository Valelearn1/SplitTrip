import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
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
