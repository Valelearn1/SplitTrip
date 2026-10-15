import { api } from '../../shared/api/client'
import type { Home } from '../../shared/api/types'

export const homeApi = { get: () => api<Home>('/me/home') }
