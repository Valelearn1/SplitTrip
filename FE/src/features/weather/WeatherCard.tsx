import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { it as itLocale } from 'date-fns/locale'
import { Icon } from '../../shared/ui/Icon'
import { weatherApi, weatherLabel } from './weatherApi'

/** Meteo della destinazione (D-37). Senza previsioni (viaggio lontano o servizio giù) non compare: mai un errore in panoramica. */
export function WeatherCard({ tripId }: { tripId: string }) {
  const { data } = useQuery({ queryKey: ['trips', tripId, 'weather'], queryFn: () => weatherApi.forecast(tripId), staleTime: 60 * 60_000, retry: false })
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
