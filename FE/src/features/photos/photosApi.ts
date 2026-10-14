import { api } from '../../shared/api/client'
import type { Photo, PhotoKind } from '../../shared/api/types'

export type PhotoUpload = { file: Blob; caption?: string; takenAt?: string; latitude?: number; longitude?: number; expenseId?: string }

export const photosApi = {
  list: (tripId: string, kind: PhotoKind = 'PHOTO') => api<Photo[]>(`/trips/${tripId}/photos?kind=${kind}`),
  upload: (tripId: string, p: PhotoUpload) => {
    const form = new FormData()
    form.append('file', p.file, 'foto.jpg')
    if (p.caption?.trim()) form.append('caption', p.caption.trim())
    if (p.takenAt) form.append('takenAt', p.takenAt)
    // coordinate solo se l'utente ha dato il consenso: altrimenti il chiamante non le passa (D-35)
    if (p.latitude !== undefined && p.longitude !== undefined) {
      form.append('latitude', String(p.latitude))
      form.append('longitude', String(p.longitude))
    }
    if (p.expenseId) form.append('expenseId', p.expenseId)
    return api<Photo>(`/trips/${tripId}/photos`, { method: 'POST', body: form })
  },
  remove: (tripId: string, photoId: string) => api<void>(`/trips/${tripId}/photos/${photoId}`, { method: 'DELETE' }),
}

export const photoPath = (tripId: string, photoId: string, size: 'image' | 'thumbnail') => `/trips/${tripId}/photos/${photoId}/${size}`
