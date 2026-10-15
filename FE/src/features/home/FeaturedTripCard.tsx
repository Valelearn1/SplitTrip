import { Link } from 'react-router'
import type { HomeFeatured } from '../../shared/api/types'
import { AuthImage } from '../../shared/ui/AuthImage'
import { Icon } from '../../shared/ui/Icon'
import { MoneyText } from '../../shared/ui/MoneyText'
import { Suitcase } from '../../shared/ui/illustrations/Suitcase'
import { formatDate } from '../../shared/utils/format'
import { photoPath } from '../photos/photosApi'
import { weatherLabel } from '../weather/weatherApi'

function statusLine(f: HomeFeatured): string {
  if (f.status === 'ONGOING') return `In corso · giorno ${f.dayOfTotal} di ${f.totalDays}`
  if (f.status === 'UPCOMING') return f.daysUntil === 0 ? 'Si parte oggi' : f.daysUntil === 1 ? 'Si parte domani' : `Tra ${f.daysUntil} giorni`
  if (f.status === 'ENDED') return `Finito il ${formatDate(f.trip.endDate)} · da chiudere`
  return `Chiuso · finito il ${formatDate(f.trip.endDate)}`
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Il viaggio in evidenza della Home (D-49): a che punto è, che tempo fa, come sei messo. */
export function FeaturedTripCard({ featured: f }: { featured: HomeFeatured }) {
  const weather = f.weatherToday ? weatherLabel(f.weatherToday.code) : null
  return (
    <article className="card featured">
      <div className="featured-cover">
        {f.coverPhotoId
          ? <AuthImage path={photoPath(f.trip.id, f.coverPhotoId, 'image')} alt={`Ultima foto di ${f.trip.name}`} />
          : <Suitcase size={56} />}
      </div>
      <div className="featured-body">
        <p className="featured-status">{statusLine(f)}</p>
        <h2>{f.trip.name}</h2>
        <p className="muted"><Icon name="location_on" className="inline-icon" /> {f.trip.destination}</p>
        {weather && f.weatherToday && (
          <p><Icon name={weather.icon} className="inline-icon" /> {capitalize(weather.label)} · {Math.round(f.weatherToday.tMin)}°–{Math.round(f.weatherToday.tMax)}°</p>
        )}
        {/* il saldo a parole e col segno: mai solo il colore (D-24) */}
        <p>
          {f.myNet > 0 ? 'Ti devono ' : f.myNet < 0 ? 'Devi ' : 'Sei in pari'}
          {f.myNet !== 0 && <MoneyText amount={Math.abs(f.myNet)} currency={f.trip.currency} />}
        </p>
        <Link to={`/trips/${f.trip.id}`} className="btn btn-primary" aria-label={`Apri ${f.trip.name}`}>Apri il viaggio<Icon name="arrow_forward" /></Link>
      </div>
    </article>
  )
}
