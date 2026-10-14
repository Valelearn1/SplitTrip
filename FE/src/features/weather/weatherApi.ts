import { api } from '../../shared/api/client'
import type { Weather } from '../../shared/api/types'

export const weatherApi = { forecast: (tripId: string) => api<Weather>(`/trips/${tripId}/weather`) }

/** Codici meteo WMO → icona Material e testo (D-24: mai solo l'icona). */
export function weatherLabel(code: number): { icon: string; label: string } {
  if (code === 0) return { icon: 'sunny', label: 'sereno' }
  if (code <= 2) return { icon: 'partly_cloudy_day', label: 'poco nuvoloso' }
  if (code === 3) return { icon: 'cloud', label: 'nuvoloso' }
  if (code === 45 || code === 48) return { icon: 'foggy', label: 'nebbia' }
  if (code >= 51 && code <= 67) return { icon: 'rainy', label: 'pioggia' }
  if (code >= 71 && code <= 77) return { icon: 'weather_snowy', label: 'neve' }
  if (code >= 80 && code <= 82) return { icon: 'rainy', label: 'rovesci' }
  if (code === 85 || code === 86) return { icon: 'weather_snowy', label: 'nevicate' }
  if (code >= 95) return { icon: 'thunderstorm', label: 'temporale' }
  return { icon: 'cloud', label: 'variabile' }
}
