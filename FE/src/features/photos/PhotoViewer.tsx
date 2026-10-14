import { useState } from 'react'
import type { Photo } from '../../shared/api/types'
import { AuthImage } from '../../shared/ui/AuthImage'
import { Button } from '../../shared/ui/Button'
import { FormError } from '../../shared/ui/FormError'
import { Icon } from '../../shared/ui/Icon'
import { Modal } from '../../shared/ui/Modal'
import { formatDate } from '../../shared/utils/format'
import { photoPath } from './photosApi'
import { useDeletePhoto } from './usePhotos'

type Props = { tripId: string; photo: Photo; canDelete: boolean; onClose: () => void }

export function PhotoViewer({ tripId, photo, canDelete, onClose }: Props) {
  const remove = useDeletePhoto(tripId)
  const [confirm, setConfirm] = useState(false)
  return (
    <Modal open title={photo.caption ?? 'Foto'} onClose={onClose}>
      <AuthImage path={photoPath(tripId, photo.id, 'image')} alt={photo.caption ?? `Foto di ${photo.uploaderName}`} className="viewer-img" />
      <p className="muted">Caricata da {photo.uploaderName} · {formatDate((photo.takenAt ?? photo.createdAt).slice(0, 10))}</p>
      <FormError error={remove.error} />
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
