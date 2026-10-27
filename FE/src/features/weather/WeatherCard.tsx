import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { it as itLocale } from 'date-fns/locale'
import { Icon } from '../../shared/ui/Icon'
import type { Trip } from '../../shared/api/types'
import { fetchForecast, weatherLabel } from './weatherApi'

type WeatherTrip = Pick<Trip, 'id' | 'latitude' | 'longitude' | 'startDate' | 'endDate'>

/**
 * Meteo della destinazione (D-37), chiesto dal browser a Open-Meteo (D-76). Senza coordinate, senza previsioni (viaggio
 * lontano) o col servizio giù non compare: mai un errore in panoramica. La chiave resta sotto «trips» per la copia offline.
 */
export function WeatherCard({ trip }: { trip: WeatherTrip }) {
  const { id, latitude, longitude, startDate, endDate } = trip
  const { data } = useQuery({
    queryKey: ['trips', id, 'weather', 'browser', startDate, endDate],
    queryFn: () => fetchForecast(latitude as number, longitude as number, startDate, endDate),
    enabled: latitude != null && longitude != null,
    staleTime: 60 * 60_000, retry: false,
  })
  if (!data || data.days.length === 0) return null
  return (
    <section className="card span-2" aria-labelledby="weather-title">
      <h2 id="weather-title">Meteo</h2>
      <ul className="weather">
        {data.days.map((d) => {
          const w = weatherLabel(d.code)
          return (
            <li key={d.date}>
              <span className="weather-day">{format(parseISO(d.date), 'EEE d', { locale: itLocale })}</span>
              <Icon name={w.icon} label={w.label} />
              <span className="weather-temp">{Math.round(d.tMin)}° / {Math.round(d.tMax)}°</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
