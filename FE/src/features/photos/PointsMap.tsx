import { useEffect } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import { reduceMotion } from '../../shared/utils/motion'

export type MapPoint = { id: string; name: string; latitude: number; longitude: number }


function FitPoints({ points }: { points: MapPoint[] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    map.fitBounds(points.map((p) => [p.latitude, p.longitude] as [number, number]), { padding: [32, 32], maxZoom: 6, animate: !reduceMotion() })
  }, [map, points])
  return null
}

/** Mappa semplice di punti con nome (profilo, «i miei numeri»): i nomi sono anche in testo fuori dalla mappa. */
export function PointsMap({ points }: { points: MapPoint[] }) {
  return (
    <div className="points-map" aria-label="Mappa delle destinazioni">
      <MapContainer center={[points[0].latitude, points[0].longitude]} zoom={4} scrollWheelZoom={false} zoomAnimation={!reduceMotion()} fadeAnimation={!reduceMotion()} markerZoomAnimation={!reduceMotion()}>
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        <FitPoints points={points} />
        {points.map((p) => (
          <CircleMarker key={p.id} center={[p.latitude, p.longitude]} radius={9} pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#00685c', fillOpacity: 1 }}>
            <Popup>{p.name}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
