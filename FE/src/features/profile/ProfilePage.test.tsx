import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { profileApi } from './profileApi'
import { ProfilePage } from './ProfilePage'

vi.mock('../../shared/utils/image', () => ({ downscale: vi.fn(async () => new Blob(['x'], { type: 'image/jpeg' })) }))

it('carica la foto profilo e poi permette di rimuoverla', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false } }))
  const set = vi.spyOn(profileApi, 'setAvatar').mockResolvedValue(undefined)
  vi.spyOn(profileApi, 'removeAvatar').mockResolvedValue(undefined)
  renderWithProviders([{ path: '/profile', element: <ProfilePage /> }], '/profile')
  const user = userEvent.setup()
  expect(screen.queryByRole('button', { name: 'Rimuovi la foto' })).not.toBeInTheDocument()
  await user.upload(screen.getByLabelText('Carica una foto profilo'), new File(['x'], 'me.jpg', { type: 'image/jpeg' }))
  await waitFor(() => expect(set).toHaveBeenCalled())
  expect(await screen.findByRole('button', { name: 'Rimuovi la foto' })).toBeInTheDocument()
  expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)!).user.hasAvatar).toBe(true)
})
