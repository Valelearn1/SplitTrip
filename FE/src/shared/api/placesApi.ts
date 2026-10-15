import { api } from './client'
import type { Place } from './types'

export const placesApi = {
  search: (q: string, near?: { latitude: number; longitude: number }) =>
    api<Place[]>(`/places?q=${encodeURIComponent(q)}${near ? `&near=${near.latitude},${near.longitude}` : ''}`),
}
