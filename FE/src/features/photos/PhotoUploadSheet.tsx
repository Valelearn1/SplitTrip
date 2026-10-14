import { useEffect, useState } from 'react'
import { ApiError } from '../../shared/api/client'
import { Button } from '../../shared/ui/Button'
import { Icon } from '../../shared/ui/Icon'
import { Modal } from '../../shared/ui/Modal'
import { downscale, readPhotoMeta, type PhotoMeta } from '../../shared/utils/image'
import { useUploadPhoto } from './usePhotos'

type Item = {
  key: string
  file: File
  preview: string
  meta: PhotoMeta
  caption: string
  share: boolean       // consenso a mostrare la posizione sulla mappa: spento di default (D-35)
  status: 'ready' | 'uploading' | 'done' | 'error'
  error?: string
}

type Props = { tripId: string; open: boolean; onClose: () => void }

export function PhotoUploadSheet({ tripId, open, onClose }: Props) {
  const upload = useUploadPhoto(tripId)
  const [items, setItems] = useState<Item[]>([])
  const [progress, setProgress] = useState<string>('')

  useEffect(() => () => items.forEach((i) => URL.revokeObjectURL(i.preview)), [items])

  async function pick(files: FileList | null) {
    if (!files) return
    const added = await Promise.all([...files].map(async (file, n) => ({
      key: `${Date.now()}-${n}-${file.name}`, file, preview: URL.createObjectURL(file), meta: await readPhotoMeta(file),
      caption: '', share: false, status: 'ready' as const,
    })))
    setItems((prev) => [...prev.filter((i) => i.status !== 'done'), ...added])
  }

  const update = (key: string, patch: Partial<Item>) => setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)))

  function askCurrentPosition(key: string) {
    navigator.geolocation?.getCurrentPosition(
      (pos) => update(key, { meta: { ...items.find((i) => i.key === key)!.meta, latitude: pos.coords.latitude, longitude: pos.coords.longitude }, share: true }),
      () => update(key, { error: 'Posizione non disponibile: controlla i permessi del browser' }),
    )
  }

  async function uploadAll() {
    const queue = items.filter((i) => i.status === 'ready' || i.status === 'error')
    for (const [n, item] of queue.entries()) {
      setProgress(`Caricamento ${n + 1} di ${queue.length}…`)
      update(item.key, { status: 'uploading', error: undefined })
      try {
        const file = await downscale(item.file)
        await upload.mutateAsync({
          file, caption: item.caption, takenAt: item.meta.takenAt,
          ...(item.share && item.meta.latitude !== undefined ? { latitude: item.meta.latitude, longitude: item.meta.longitude } : {}),
        })
        update(item.key, { status: 'done' })
      } catch (e) {
        update(item.key, { status: 'error', error: e instanceof ApiError ? e.detail : 'Caricamento non riuscito' })
      }
    }
    setProgress('Fatto')
  }

  const pending = items.filter((i) => i.status === 'ready' || i.status === 'error').length

  return (
    <Modal open={open} title="Carica foto" onClose={onClose}>
      <label className="btn btn-secondary file-pick">
        <Icon name="add_photo_alternate" />Scegli dal telefono
        <input type="file" accept="image/*" multiple aria-label="Scegli le foto" onChange={(e) => { void pick(e.target.files); e.target.value = '' }} />
      </label>
      <ul className="list upload-list">
        {items.map((i) => (
          <li key={i.key} className="upload-item">
            <img src={i.preview} alt="" className="upload-thumb" />
            <div className="stack" style={{ gap: 6, minWidth: 0, flex: 1 }}>
              <input aria-label={`Didascalia di ${i.file.name}`} placeholder="Didascalia (facoltativa)" maxLength={200} value={i.caption}
                disabled={i.status === 'uploading' || i.status === 'done'} onChange={(e) => update(i.key, { caption: e.target.value })} />
              {i.meta.latitude !== undefined ? (
                <label className="check">
                  <input type="checkbox" checked={i.share} disabled={i.status === 'done'} onChange={(e) => update(i.key, { share: e.target.checked })} />
                  Mostra sulla mappa dove è stata scattata
                </label>
              ) : (
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => askCurrentPosition(i.key)}>
                  <Icon name="my_location" />Usa la mia posizione attuale
                </button>
              )}
              {i.status === 'done' && <small className="money-positive">Caricata</small>}
              {i.error && <p className="field-error"><Icon name="error" /><span>{i.error}</span></p>}
            </div>
          </li>
        ))}
      </ul>
      <p role="status" className="muted">{progress}</p>
      <div className="modal-actions">
        <Button variant="secondary" onClick={onClose}>Chiudi</Button>
        <Button disabled={pending === 0} loading={upload.isPending} onClick={() => void uploadAll()}>
          {`Carica ${pending} foto`}
        </Button>
      </div>
    </Modal>
  )
}
