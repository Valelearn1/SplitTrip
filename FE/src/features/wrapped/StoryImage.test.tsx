import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { StoryImage } from './StoryImage'

it('offre di creare l\'immagine e dice che dentro non ci sono saldi personali', () => {
  render(<StoryImage data={{ name: 'Napoli', dates: '10–14 set 2026', total: 336, perPerson: 168, photos: 0, messages: 2, currency: 'EUR', badges: [] }} coverPath={null} />)
  expect(screen.getByRole('button', { name: /Crea l'immagine per le storie/ })).toBeInTheDocument()
  expect(screen.getByText(/nessun saldo personale/)).toBeInTheDocument()
})
