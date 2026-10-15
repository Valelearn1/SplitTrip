import { api } from '../../shared/api/client'
import type { Stats, User } from '../../shared/api/types'

export type Preferences = Partial<Pick<User, 'preferredCurrency' | 'chatSound' | 'reduceMotion'>>

export const profileApi = {
  setAvatar: (file: Blob) => {
    const form = new FormData()
    form.append('file', file, 'avatar.jpg')
    return api<void>('/me/avatar', { method: 'PUT', body: form })
  },
  removeAvatar: () => api<void>('/me/avatar', { method: 'DELETE' }),
  update: (body: { displayName?: string; email?: string }) => api<User>('/me', { method: 'PATCH', body }),
  changePassword: (body: { currentPassword: string; newPassword: string }) => api<void>('/me/password', { method: 'POST', body }),
  updatePreferences: (body: Preferences) => api<User>('/me/preferences', { method: 'PATCH', body }),
  stats: () => api<Stats>('/me/stats'),
}

export { avatarPath } from '../../shared/api/avatar'
