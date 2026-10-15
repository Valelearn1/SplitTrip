import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, expect, it } from 'vitest'
import { AuthProvider } from '../features/auth/AuthProvider'
import { AUTH_STORAGE_KEY } from '../features/auth/authContext'
import { reduceMotion } from '../shared/utils/motion'
import { MotionRoot } from './MotionRoot'

const user = (reduce: boolean) => ({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false, preferredCurrency: 'EUR', chatSound: true, reduceMotion: reduce } })
const mount = () => render(<QueryClientProvider client={new QueryClient()}><AuthProvider><MotionRoot><p>app</p></MotionRoot></AuthProvider></QueryClientProvider>)

afterEach(() => { delete document.documentElement.dataset.reduceMotion })

it('«Riduci le animazioni» vale anche per CSS e mappe, non solo per Motion (revisione v3.1)', () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user(true)))
  mount()
  expect(document.documentElement.dataset.reduceMotion).toBe('true')   // la regola CSS spegne transizioni e animazioni
  expect(reduceMotion()).toBe(true)                                      // le mappe non animano zoom e spostamenti
})

it('preferenza spenta: decide il sistema', () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user(false)))
  mount()
  expect(document.documentElement.dataset.reduceMotion).toBe('false')
  expect(reduceMotion()).toBe(false)
})
