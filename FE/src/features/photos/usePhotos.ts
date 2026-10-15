import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { photosApi, type PhotoPlace, type PhotoUpload } from './photosApi'

export function usePhotos(tripId: string) {
  return useQuery({ queryKey: ['trips', tripId, 'photos'], queryFn: () => photosApi.list(tripId) })
}

/** Dopo upload o eliminazione si invalida tutto il viaggio: galleria, spese (scontrino) e panoramica. */
export function useUploadPhoto(tripId: string) {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (p: PhotoUpload) => photosApi.upload(tripId, p), onSuccess: () => qc.invalidateQueries({ queryKey: ['trips', tripId] }) })
}

export function useDeletePhoto(tripId: string) {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (photoId: string) => photosApi.remove(tripId, photoId), onSuccess: () => qc.invalidateQueries({ queryKey: ['trips', tripId] }) })
}

export function useSetPhotoPlace(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ photoId, body }: { photoId: string; body: PhotoPlace }) => photosApi.setPlace(tripId, photoId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips', tripId] }),
  })
}
