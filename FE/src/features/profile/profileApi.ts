import { api } from '../../shared/api/client'

export const profileApi = {
  setAvatar: (file: Blob) => {
    const form = new FormData()
    form.append('file', file, 'avatar.jpg')
    return api<void>('/me/avatar', { method: 'PUT', body: form })
  },
  removeAvatar: () => api<void>('/me/avatar', { method: 'DELETE' }),
}

export { avatarPath } from '../../shared/api/avatar'
