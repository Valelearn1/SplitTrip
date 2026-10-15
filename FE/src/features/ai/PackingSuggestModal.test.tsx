import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { PackingSuggestModal } from './PackingSuggestModal'

it('propone le voci già spuntate e aggiunge solo quelle che restano spuntate', async () => {
  const added: unknown[] = []
  server.use(
    http.post('http://localhost/api/trips/t1/todo-lists/l1/ai/suggestions', () => HttpResponse.json({ items: ['Ombrello', 'Adattatore', 'Crema solare'], remainingToday: 4 })),
    http.post('http://localhost/api/trips/t1/todo-lists/l1/items', async ({ request }) => { added.push(await request.json()); return HttpResponse.json({ id: 'x' }, { status: 201 }) }),
  )
  const onClose = vi.fn()
  renderWithProviders([{ path: '/', element: <PackingSuggestModal tripId="t1" listId="l1" open onClose={onClose} /> }], '/')
  const user = userEvent.setup()
  const solare = await screen.findByRole('checkbox', { name: 'Crema solare' })
  expect(solare).toBeChecked()
  await user.click(solare)
  await user.click(screen.getByRole('button', { name: 'Aggiungi 2 voci' }))
  await waitFor(() => expect(onClose).toHaveBeenCalled())
  expect(added).toEqual([{ text: 'Ombrello' }, { text: 'Adattatore' }])
})
