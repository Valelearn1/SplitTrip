import { useState } from 'react'
import { useOutletContext } from 'react-router'
import type { Photo } from '../../shared/api/types'
import { EmptyState } from '../../shared/ui/EmptyState'
import { FormError } from '../../shared/ui/FormError'
import { Icon } from '../../shared/ui/Icon'
import { Spinner } from '../../shared/ui/Spinner'
import { useOnline } from '../pwa/useOnline'
import type { TripContext } from '../trips/TripLayout'
import { PhotoGrid } from './PhotoGrid'
import { PhotoMap } from './PhotoMap'
import { PhotoUploadSheet } from './PhotoUploadSheet'
import { PhotoViewer } from './PhotoViewer'
import { usePhotos } from './usePhotos'

export function PhotosPage() {
  const { trip, me, isOrganizer, canWrite } = useOutletContext<TripContext>()
  const online = useOnline()
  const photos = usePhotos(trip.id)
  // le proposte di luoghi preferiscono quelli vicini alla destinazione del viaggio (D-46)
  const near = trip.latitude != null && trip.longitude != null ? { latitude: trip.latitude, longitude: trip.longitude } : undefined
  const [view, setView] = useState<'grid' | 'map'>('grid')
  const [open, setOpen] = useState<Photo | null>(null)
  const [uploading, setUploading] = useState(false)

  return (
    <div className="stack">
      <div className="page-head">
        <h2>Foto</h2>
        <div className="chips" role="radiogroup" aria-label="Vista" style={{ marginBottom: 0 }}>
          <label className="chip"><input type="radio" name="photo-view" checked={view === 'grid'} onChange={() => setView('grid')} /><Icon name="grid_view" />Griglia</label>
          <label className="chip"><input type="radio" name="photo-view" checked={view === 'map'} onChange={() => setView('map')} /><Icon name="map" />Mappa</label>
        </div>
      </div>
      {photos.isPending && <Spinner />}
      <FormError error={photos.error} />
      {photos.data?.length === 0 && <EmptyState title="Ancora nessuna foto del viaggio" icon="photo_camera" />}
      {photos.data && photos.data.length > 0 && (view === 'grid'
        ? <PhotoGrid tripId={trip.id} photos={photos.data} onOpen={setOpen} />
        : <PhotoMap tripId={trip.id} photos={photos.data} onOpen={setOpen} />)}
      {canWrite && (
        <button type="button" className="fab" aria-label={online ? 'Carica foto' : 'Carica foto (serve la rete)'} disabled={!online} title={online ? undefined : 'Serve la rete'} onClick={() => setUploading(true)}><Icon name="add_a_photo" /></button>
      )}
      {uploading && <PhotoUploadSheet tripId={trip.id} open near={near} onClose={() => setUploading(false)} />}
      {open && (
        <PhotoViewer tripId={trip.id} photo={open} near={near} canDelete={open.uploaderId === me.userId || isOrganizer}
          canEditPlace={canWrite && (open.uploaderId === me.userId || isOrganizer)} onClose={() => setOpen(null)} />
      )}
    </div>
  )
}
