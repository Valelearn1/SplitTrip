import { act, renderHook, waitFor } from '@testing-library/react'
import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { expect, it } from 'vitest'
import { server } from '../../test/server'
import { usePatchItem } from './useTodo'

it('una spunta offline non resta spuntata: torna com\'era e non finisce salvata sul telefono (revisione v3.5)', async () => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false, networkMode: 'always' } } })
  const key = ['trips', 't1', 'todo']
  client.setQueryData(key, [{ id: 'l1', name: 'Valigia', type: 'PACKING', items: [{ id: 'i1', text: 'Crema solare', done: false }] }])
  server.use(http.patch('http://localhost/api/trips/t1/todo-lists/l1/items/i1', () => HttpResponse.error()))
  onlineManager.setOnline(false)
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
  const { result } = renderHook(() => usePatchItem('t1'), { wrapper })
  act(() => result.current.mutate({ listId: 'l1', itemId: 'i1', patch: { done: true } }))
  await waitFor(() => expect(result.current.isError).toBe(true))
  expect(client.getQueryData<{ items: { done: boolean }[] }[]>(key)?.[0].items[0].done).toBe(false)
})
