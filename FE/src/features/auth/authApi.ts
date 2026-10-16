import { api } from '../../shared/api/client'
import type { AuthResponse, User } from '../../shared/api/types'
import type { LoginForm, RegisterForm } from './authSchemas'

export const authApi = {
  login: (body: LoginForm) => api<AuthResponse>('/auth/login', { method: 'POST', body }),
  register: (body: RegisterForm) => api<AuthResponse>('/auth/register', { method: 'POST', body }),
  me: () => api<User>('/me'),
  // password dimenticata (D-61): la richiesta risponde sempre 204, il link arriva via email
  requestReset: (email: string) => api<void>('/auth/password-reset/request', { method: 'POST', body: { email } }),
  confirmReset: (token: string, newPassword: string) => api<void>('/auth/password-reset/confirm', { method: 'POST', body: { token, newPassword } }),
}
