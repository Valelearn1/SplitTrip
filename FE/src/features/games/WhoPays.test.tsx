import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import type { Trip } from '../../shared/api/types'
import { localToday } from '../../shared/utils/format'
import { wheelColors } from './wheel'
import { WhoPays } from './WhoPays'

const trip = {
  id: 't1', name: 'Lisbona', destination: 'Lisbona', startDate: '2026-11-01', endDate: '2026-11-06', currency: 'EUR', status: 'ONGOING',
  inviteCode: 'X', ownerId: 'u1', latitude: null, longitude: null,
  participants: [
    { id: 'p1', userId: 'u1', displayName: 'Vale', role: 'ORGANIZER', defaultWeight: 1, arrivalDate: null, departureDate: null, hasAvatar: false },
    { id: 'p2', userId: 'u2', displayName: 'Marco', role: 'MEMBER', defaultWeight: 2, arrivalDate: null, departureDate: null, hasAvatar: false },
    { id: 'p3', userId: null, displayName: 'Nonna Pina', role: 'MEMBER', defaultWeight: 0.5, arrivalDate: null, departureDate: null, hasAvatar: false },
  ],
} as Trip
const navigate = vi.fn()
vi.mock('react-router', async (orig) => ({ ...(await orig<typeof import('react-router')>()), useNavigate: () => navigate }))
afterEach(() => { navigate.mockClear(); delete document.documentElement.dataset.reduceMotion })

it('chi non ha account non è spuntato; con una sola persona non si gira; il vincitore apre la spesa precompilata', async () => {
  document.documentElement.dataset.reduceMotion = 'true'                       // verdetto immediato
  render(<WhoPays trip={trip} me={trip.participants[0]} open onClose={() => {}} random={() => 0.5} />)
  const user = userEvent.setup()
  expect(screen.getByRole('checkbox', { name: 'Vale' })).toBeChecked()
  expect(screen.getByRole('checkbox', { name: 'Marco' })).toBeChecked()
  expect(screen.getByRole('checkbox', { name: 'Nonna Pina' })).not.toBeChecked()   // Review Focus 5
  await user.click(screen.getByRole('checkbox', { name: 'Marco' }))
  expect(screen.getByRole('button', { name: 'Gira!' })).toBeDisabled()               // resta solo Vale
  await user.click(screen.getByRole('checkbox', { name: 'Marco' }))
  await user.click(screen.getByRole('button', { name: 'Gira!' }))
  expect(await screen.findByRole('status')).toHaveTextContent('Offre Marco!')         // random 0.5 su [Vale, Marco] → indice 1
  await user.click(screen.getByRole('button', { name: 'Registra la spesa' }))
  expect(navigate).toHaveBeenCalledWith('/trips/t1/expenses/new', { state: { prefill: expect.objectContaining({
    payerId: 'p2', participantIds: ['p1', 'p2'], category: 'FOOD', date: localToday() }) } })
})

it('compaiono tutti i partecipanti del viaggio (gli usciti il server non li manda)', () => {
  render(<WhoPays trip={trip} me={trip.participants[0]} open onClose={() => {}} />)
  for (const p of trip.participants) expect(screen.getByRole('checkbox', { name: p.displayName })).toBeInTheDocument()
})

it('gli spicchi hanno i pastelli della stagione del viaggio', () => {
  const { container } = render(<WhoPays trip={trip} me={trip.participants[0]} open onClose={() => {}} />)
  const fills = [...container.ownerDocument.querySelectorAll('.wheel path')].map((el) => el.getAttribute('fill'))
  expect(fills).toEqual(wheelColors('autumn').slice(0, 2))                 // novembre a Lisbona, spuntati Vale e Marco
})
