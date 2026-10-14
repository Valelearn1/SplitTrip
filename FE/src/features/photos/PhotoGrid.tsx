import type { Photo } from '../../shared/api/types'
import { AuthImage } from '../../shared/ui/AuthImage'
import { photoPath } from './photosApi'

type Props = { tripId: string; photos: Photo[]; onOpen: (p: Photo) => void }

export function PhotoGrid({ tripId, photos, onOpen }: Props) {
  return (
    <ul className="photo-grid">
      {photos.map((p) => (
        <li key={p.id}>
          <button type="button" className="photo-tile" onClick={() => onOpen(p)} aria-label={`Apri ${p.caption ?? `la foto di ${p.uploaderName}`}`}>
            <AuthImage path={photoPath(tripId, p.id, 'thumbnail')} alt={p.caption ?? `Foto di ${p.uploaderName}`} />
          </button>
        </li>
      ))}
    </ul>
  )
}
