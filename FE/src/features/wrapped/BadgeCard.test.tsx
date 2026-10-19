import { render } from '@testing-library/react'
import { expect, it } from 'vitest'
import { BadgeCard } from './BadgeCard'

it('l\'emoji va accanto al nome e il titolo resta testo con l\'articolo attaccato: niente righe con una parola sola', () => {
  const { container } = render(<BadgeCard badge={{ participantId: 'p1', code: 'FOODIE', title: '🍝 Il buongustaio', detail: 'ha offerto cibo per 142,00 €' }} person={undefined} />)
  expect(container.querySelector('strong')?.textContent).toBe('Il buongustaio')
  expect(container.querySelector('.badge-emoji')).toHaveTextContent('🍝')
  expect(container.querySelector('.badge-emoji')).toHaveAttribute('aria-hidden', 'true')
})

it('un titolo senza emoji resta com\'è', () => {
  const { container } = render(<BadgeCard badge={{ participantId: 'p1', code: 'COMPANION', title: 'Compagno di viaggio', detail: 'c\'era' }} person={undefined} />)
  expect(container.querySelector('strong')?.textContent).toBe('Compagno di viaggio')
  expect(container.querySelector('.badge-emoji')).not.toBeInTheDocument()
})

it('il nome sta in .badge-name, la classe che lo manda a capo quando è lungo', () => {
  const person = { participantId: 'p1', userId: null, displayName: 'Massimiliano Rossi' }
  const { container } = render(<BadgeCard badge={{ participantId: 'p1', code: 'FOODIE', title: '🍝 Il buongustaio', detail: 'x' }} person={person as never} />)
  expect(container.querySelector('.badge-name')).toHaveTextContent('Massimiliano Rossi')
})
