import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { createInstallStore } from './installPrompt'
import { InstallApp } from './InstallApp'

it('con l\'evento del browser il bottone apre l\'installazione; accettata, dice che è installata', async () => {
  const target = new EventTarget()
  const store = createInstallStore()
  store.listen(target)
  render(<InstallApp store={store} />)
  expect(screen.getByText(/menu del browser/)).toBeInTheDocument()
  const prompt = vi.fn(async () => {})
  const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), { prompt, userChoice: Promise.resolve({ outcome: 'accepted' }) })
  act(() => { target.dispatchEvent(event) })
  expect(event.defaultPrevented).toBe(true)
  await userEvent.setup().click(screen.getByRole('button', { name: 'Installa SplitTrip' }))
  expect(prompt).toHaveBeenCalled()
  expect(await screen.findByText('SplitTrip è installata su questo dispositivo')).toBeInTheDocument()
})
