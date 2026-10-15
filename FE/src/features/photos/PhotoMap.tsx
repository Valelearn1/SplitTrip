import { useEffect } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import type { Photo } from '../../shared/api/types'
import { AuthImage } from '../../shared/ui/AuthImage'
import { formatDate } from '../../shared/utils/format'
import { photoPath } from './photosApi'

const reducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Inquadra tutti i marcatori; niente animazioni con prefers-reduced-motion (D-24). */
function FitBounds({ photos }: { photos: Photo[] }) {
  const map = useMap()
  useEffect(() => {
    if (photos.length === 0) return
    const points = photos.map((p) => [p.latitude!, p.longitude!] as [number, number])
    map.fitBounds(points, { padding: [32, 32], maxZoom: 15, animate: !reducedMotion })
  }, [map, photos])
  return null
}

type Props = { tripId: string; photos: Photo[]; onOpen: (p: Photo) => void }

/** Mappa delle foto con posizione (D-10): sotto, la stessa lista in testo, perché la mappa non sia l'unico accesso. */
export function PhotoMap({ tripId, photos, onOpen }: Props) {
  const located = photos.filter((p) => p.latitude !== null && p.longitude !== null)
  if (located.length === 0) {
    return <p className="muted">Nessuna foto con posizione: al caricamento spunta «Mostra sulla mappa dove è stata scattata».</p>
  }
  return (
    <div className="stack">
      <div className="photo-map" aria-label="Mappa delle foto">
        <MapContainer center={[located[0].latitude!, located[0].longitude!]} zoom={13} scrollWheelZoom={false} zoomAnimation={!reducedMotion}>
          <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          <FitBounds photos={located} />
          {located.map((p) => (
            <CircleMarker key={p.id} center={[p.latitude!, p.longitude!]} radius={10}
              pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#00685c', fillOpacity: 1 }}>
              <Popup>
                <button type="button" className="map-popup" onClick={() => onOpen(p)}>
                  <AuthImage path={photoPath(tripId, p.id, 'thumbnail')} alt={p.caption ?? `Foto di ${p.uploaderName}`} />
                  <span>{p.caption ?? 'Senza didascalia'}</span>
                  {p.placeName && <small className="muted">{p.placeName}</small>}
                </button>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <ul className="list">
        {located.map((p) => (
          <li key={p.id} className="row">
            <button type="button" className="link-button" onClick={() => onOpen(p)}>
              {p.caption ?? 'Foto'} — {formatDate((p.takenAt ?? p.createdAt).slice(0, 10))}, {p.uploaderName}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
