import { useQuery } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { isUnreachable } from '../../shared/api/client'
import { FormError } from '../../shared/ui/FormError'
import { Spinner } from '../../shared/ui/Spinner'
import { formatMoney } from '../../shared/utils/format'
import { profileApi } from './profileApi'

// Leaflet pesa: la mappa si scarica solo se ci sono destinazioni da mostrare
const PointsMap = lazy(() => import('../photos/PointsMap').then((m) => ({ default: m.PointsMap })))

/** «I miei numeri»: i viaggi raccontati in quattro cifre e una mappa. */
export function StatsSection() {
  const stats = useQuery({ queryKey: ['me', 'stats'], queryFn: profileApi.stats })
  if (stats.isPending) return <Spinner />
  if (stats.error && !(isUnreachable(stats.error) && stats.data)) return <FormError error={stats.error} />   // D-63: i numeri già visti restano
  const s = stats.data!
  const points = s.destinations
    .filter((d) => d.latitude !== null && d.longitude !== null)
    .map((d) => ({ id: d.name, name: d.name, latitude: d.latitude!, longitude: d.longitude! }))
  return (
    <div className="stack">
      <div className="stats-grid">
        <div className="stat-big"><strong>{s.trips}</strong><span>{s.trips === 1 ? 'viaggio' : 'viaggi'}</span></div>
        <div className="stat-big"><strong>{s.destinations.length}</strong><span>{s.destinations.length === 1 ? 'destinazione' : 'destinazioni'}</span></div>
        <div className="stat-big"><strong>{s.photos}</strong><span>foto caricate</span></div>
        {/* una riga per valuta del viaggio: yen ed euro non si sommano */}
        {s.spending.map((x) => (
          <div key={x.currency} className="stat-big stat-money">
            <strong>{formatMoney(x.groupTotal, x.currency)}</strong><span>speso dal gruppo</span>
            <small className="muted">la tua parte: {formatMoney(x.myShare, x.currency)}</small>
          </div>
        ))}
      </div>
      {s.destinations.length > 0 && (
        <ul className="chips" aria-label="Destinazioni">
          {s.destinations.map((d) => <li key={d.name} className="chip chip-static">{d.name}</li>)}
        </ul>
      )}
      {points.length > 0 && (
        <Suspense fallback={<Spinner />}>
          <PointsMap points={points} />
        </Suspense>
      )}
    </div>
  )
}
