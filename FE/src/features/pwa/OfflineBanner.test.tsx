import { act, render, screen } from '@testing-library/react'
import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { expect, it, vi } from 'vitest'
import { OfflineBanner } from './OfflineBanner'

const wrap = () => render(<QueryClientProvider client={new QueryClient()}><OfflineBanner /></QueryClientProvider>)

it('compare senza rete con il motivo collegabile, sparisce con «Di nuovo online» dopo 3 s', async () => {
  vi.useFakeTimers()
  try {
    wrap()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    act(() => onlineManager.setOnline(false))
    expect(screen.getByRole('status')).toHaveTextContent('Sei offline')
    expect(document.getElementById('offline-reason')).toHaveTextContent('serve la rete per salvare')
    act(() => onlineManager.setOnline(true))
    expect(screen.getByRole('status')).toHaveTextContent('Di nuovo online')
    await act(() => vi.advanceTimersByTimeAsync(3000))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  } finally {
    vi.useRealTimers()
  }
})
