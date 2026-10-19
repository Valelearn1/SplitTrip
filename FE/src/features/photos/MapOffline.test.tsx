import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { MapOffline } from './MapOffline'

it('al posto della mappa, offline, dice che serve la rete', () => {
  render(<MapOffline />)
  expect(screen.getByRole('status')).toHaveTextContent('La mappa serve la rete')
})
