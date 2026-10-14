export type PhotoMeta = { takenAt?: string; latitude?: number; longitude?: number }

/** GPS e data di scatto letti sul telefono (D-35): non lasciano il dispositivo senza consenso. */
export async function readPhotoMeta(file: File): Promise<PhotoMeta> {
  try {
    // exifr si carica solo quando si sceglie una foto: non pesa sul bundle principale
    const { default: exifr } = await import('exifr')
    const [gps, tags] = await Promise.all([
      exifr.gps(file).catch(() => undefined),
      exifr.parse(file, ['DateTimeOriginal']).catch(() => undefined),
    ])
    const taken = tags?.DateTimeOriginal
    return {
      takenAt: taken instanceof Date && !Number.isNaN(taken.getTime()) ? taken.toISOString() : undefined,
      latitude: typeof gps?.latitude === 'number' ? gps.latitude : undefined,
      longitude: typeof gps?.longitude === 'number' ? gps.longitude : undefined,
    }
  } catch {
    return {}
  }
}

/** Dimensioni con il lato lungo al massimo maxSide; mai ingrandire. */
export function fitSize(width: number, height: number, maxSide: number) {
  const k = Math.min(1, maxSide / Math.max(width, height))
  return { width: Math.round(width * k), height: Math.round(height * k) }
}

/** Riduce la foto sul telefono (da ~4 MB a ~300 KB): upload veloce coi dati mobili e server leggero. */
export async function downscale(file: Blob, maxSide = 1600, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const { width, height } = fitSize(bitmap.width, bitmap.height, maxSide)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Impossibile preparare la foto'))), 'image/jpeg', quality))
}
