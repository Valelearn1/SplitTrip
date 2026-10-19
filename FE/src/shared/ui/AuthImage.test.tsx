import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { expect, it, vi } from 'vitest'
import '../../features/auth/AuthProvider' // configura il client col token letto dallo storage
import { server } from '../../test/server'
import { AuthImage } from './AuthImage'

it('scarica con il Bearer, mostra un object URL e lo libera allo smontaggio', async () => {
  localStorage.setItem('splittrip.auth', JSON.stringify({ token: 'tok', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false } }))
  let auth = ''
  server.use(http.get('http://localhost/api/trips/t1/photos/p1/thumbnail', ({ request }) => {
    auth = request.headers.get('authorization') ?? ''
    return new HttpResponse(new Uint8Array([0xff, 0xd8, 0xff]), { headers: { 'Content-Type': 'image/jpeg' } })
  }))
  const createUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake')
  const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  const { unmount } = render(
    <QueryClientProvider client={new QueryClient()}><AuthImage path="/trips/t1/photos/p1/thumbnail" alt="Colosseo" /></QueryClientProvider>,
  )
  await waitFor(() => expect(screen.getByRole('img', { name: 'Colosseo' })).toHaveAttribute('src', 'blob:fake'))
  expect(auth).toBe('Bearer tok')
  expect(createUrl).toHaveBeenCalled()
  unmount()
  expect(revoke).toHaveBeenCalledWith('blob:fake')
})

it('offline una foto mai vista lascia un segnaposto che dice che serve la rete', async () => {
  server.use(http.get('http://localhost/api/trips/t1/photos/p9/image', () => HttpResponse.error()))
  onlineManager.setOnline(false)
  render(<QueryClientProvider client={new QueryClient()}><AuthImage path="/trips/t1/photos/p9/image" alt="Tramonto" /></QueryClientProvider>)
  expect(await screen.findByRole('img', { name: 'Tramonto: serve la rete' })).toHaveTextContent('Serve la rete')
})
