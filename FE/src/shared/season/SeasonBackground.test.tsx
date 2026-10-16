import { render } from '@testing-library/react'
import { expect, it } from 'vitest'
import { SeasonBackground } from './SeasonBackground'
import { SeasonProvider } from './SeasonProvider'
import { useTripSeason } from './seasonContext'

type TripDates = { startDate: string; endDate: string; latitude: number | null }
function OpenTrip({ trip }: { trip: TripDates }) {
  useTripSeason(trip)
  return null
}
const season = (c: HTMLElement) => c.querySelector('.season-bg')?.getAttribute('data-season')

it('fuori da un viaggio è la stagione di oggi, disegno decorativo in versione chiara e scura', () => {
  const { container } = render(<SeasonProvider><SeasonBackground today="2026-07-15" /></SeasonProvider>)
  const bg = container.querySelector('.season-bg')!
  expect(season(container)).toBe('summer')
  expect(bg).toHaveAttribute('aria-hidden', 'true')
  const imgs = bg.querySelectorAll('img')
  expect(imgs).toHaveLength(2)
  imgs.forEach((img) => expect(img).toHaveAttribute('alt', ''))
})

it('dentro un viaggio vale la sua stagione; uscendo si torna a oggi', () => {
  const trip = { startDate: '2027-01-10', endDate: '2027-01-14', latitude: 46.5 }
  const { container, rerender } = render(<SeasonProvider><OpenTrip trip={trip} /><SeasonBackground today="2026-07-15" /></SeasonProvider>)
  expect(season(container)).toBe('winter')
  rerender(<SeasonProvider><SeasonBackground today="2026-07-15" /></SeasonProvider>)
  expect(season(container)).toBe('summer')
})
