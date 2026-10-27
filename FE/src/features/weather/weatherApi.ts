import type { Weather, WeatherDay } from '../../shared/api/types'

export const OPEN_METEO_FORECAST = 'https://api.open-meteo.com/v1/forecast'

type Daily = { time?: string[]; weather_code?: (number | null)[]; temperature_2m_max?: (number | null)[]; temperature_2m_min?: (number | null)[] }

/**
 * Previsioni chieste dal browser a Open-Meteo (D-76): il server su Render esce da un IP condiviso con altri siti, che
 * esaurisce il limite gratuito giornaliero; dal dispositivo di chi guarda il limite è il suo. Vanno solo le coordinate
 * della destinazione (vedi l'informativa). Tiene i giorni del viaggio e salta quelli che arrivano senza dati.
 */
export async function fetchForecast(latitude: number, longitude: number, startDate: string, endDate: string): Promise<Weather> {
  const url = new URL(OPEN_METEO_FORECAST)
  url.search = new URLSearchParams({
    latitude: String(latitude), longitude: String(longitude),
    daily: 'weather_code,temperature_2m_max,temperature_2m_min', timezone: 'auto', forecast_days: '16',
  }).toString()
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`)
  const body = (await res.json()) as { daily?: Daily }
  const d = body.daily ?? {}
  const days: WeatherDay[] = []
  ;(d.time ?? []).forEach((date, i) => {
    const code = d.weather_code?.[i], tMax = d.temperature_2m_max?.[i], tMin = d.temperature_2m_min?.[i]
    if (code == null || tMax == null || tMin == null) return
    if (date < startDate || date > endDate) return   // date ISO: il confronto tra stringhe è quello giusto
    days.push({ date, code, tMin, tMax })
  })
  return { days }
}

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
