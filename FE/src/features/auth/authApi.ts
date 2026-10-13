import { api } from '../../shared/api/client'
import type { AuthResponse } from '../../shared/api/types'
import type { LoginForm, RegisterForm } from './authSchemas'

export const authApi = {
  login: (body: LoginForm) => api<AuthResponse>('/auth/login', { method: 'POST', body }),
  register: (body: RegisterForm) => api<AuthResponse>('/auth/register', { method: 'POST', body }),
}
