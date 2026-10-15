import { useState } from 'react'
import type { Photo, PlaceValue } from '../../shared/api/types'
import { AuthImage } from '../../shared/ui/AuthImage'
import { Button } from '../../shared/ui/Button'
import { FormError } from '../../shared/ui/FormError'
import { Icon } from '../../shared/ui/Icon'
import { Modal } from '../../shared/ui/Modal'
import { PlaceInput } from '../../shared/ui/PlaceInput'
import { formatDate } from '../../shared/utils/format'
import { photoPath } from './photosApi'
import { useDeletePhoto, useSetPhotoPlace } from './usePhotos'

type Props = {
  tripId: string; photo: Photo; canDelete: boolean; canEditPlace: boolean; onClose: () => void
  near?: { latitude: number; longitude: number }
}

export function PhotoViewer({ tripId, photo, canDelete, canEditPlace, onClose, near }: Props) {
  const remove = useDeletePhoto(tripId)
  const setPlace = useSetPhotoPlace(tripId)
  const [confirm, setConfirm] = useState(false)
  const [placeName, setPlaceName] = useState(photo.placeName) // aggiornato dalla risposta, senza riaprire la foto
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<PlaceValue>({ name: '' })

  function save(body: Parameters<typeof setPlace.mutate>[0]['body']) {
    setPlace.mutate({ photoId: photo.id, body }, { onSuccess: (p) => { setPlaceName(p.placeName); setEditing(false) } })
  }

  return (
    <Modal open title={photo.caption ?? 'Foto'} onClose={onClose}>
      <AuthImage path={photoPath(tripId, photo.id, 'image')} alt={photo.caption ?? `Foto di ${photo.uploaderName}`} className="viewer-img" />
      <p className="muted">Caricata da {photo.uploaderName} · {formatDate((photo.takenAt ?? photo.createdAt).slice(0, 10))}</p>
      {placeName && <p className="muted"><Icon name="location_on" className="inline-icon" /> {placeName}</p>}
      {canEditPlace && !editing && (
        <div className="row-actions">
          <Button variant="secondary" className="btn-sm" onClick={() => { setDraft({ name: '' }); setEditing(true) }}>
            <Icon name="edit_location_alt" />{placeName ? 'Cambia luogo' : 'Aggiungi un luogo'}
          </Button>
          {placeName && <Button variant="secondary" className="btn-sm" loading={setPlace.isPending} onClick={() => save({ clear: true })}>Togli luogo</Button>}
        </div>
      )}
      {editing && (
        <div className="stack">
          <PlaceInput id={`viewer-place-${photo.id}`} label="Luogo" placeholder="Città o quartiere" near={near} value={draft} onChange={setDraft}
            hint="Scegli una delle proposte: serve per mettere la foto sulla mappa" />
          <div className="row-actions">
            <Button className="btn-sm" disabled={draft.latitude === undefined} loading={setPlace.isPending}
              onClick={() => draft.latitude !== undefined && save({ placeName: draft.name, latitude: draft.latitude, longitude: draft.longitude! })}>
              Salva luogo
            </Button>
            <Button variant="secondary" className="btn-sm" onClick={() => setEditing(false)}>Annulla</Button>
          </div>
        </div>
      )}
      <FormError error={remove.error ?? setPlace.error} />
      <div className="modal-actions">
        {canDelete && !confirm && <Button variant="danger" onClick={() => setConfirm(true)}><Icon name="delete" />Elimina</Button>}
        {confirm && (
          <Button variant="danger" loading={remove.isPending} onClick={() => remove.mutate(photo.id, { onSuccess: onClose })}>Conferma eliminazione</Button>
        )}
        <Button variant="secondary" onClick={onClose}>Chiudi</Button>
      </div>
    </Modal>
  )
}
