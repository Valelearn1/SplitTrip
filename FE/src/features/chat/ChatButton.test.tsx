import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { ChatButton } from './ChatButton'

it('dice quanti messaggi non letti ci sono', async () => {
  server.use(http.get('http://localhost/api/trips/t1/messages/unread-count', () => HttpResponse.json({ count: 3 })))
  renderWithProviders([{ path: '/trips/:tripId', element: <ChatButton tripId="t1" /> }], '/trips/t1')
  const link = await screen.findByRole('link', { name: 'Chat, 3 messaggi non letti' })
  expect(link).toHaveAttribute('href', '/trips/t1/chat')
})
