import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tripsApi, type ParticipantInput, type ParticipantPatch, type TripInput, type TripPatch } from './tripsApi'

export const tripKeys = {
  all: ['trips'] as const,
  one: (tripId: string) => ['trips', tripId] as const,
}

export function useTrips() {
  return useQuery({ queryKey: tripKeys.all, queryFn: tripsApi.list })
}

export function useTrip(tripId: string) {
  return useQuery({ queryKey: tripKeys.one(tripId), queryFn: () => tripsApi.get(tripId) })
}

/** Rilegge sempre il viaggio all'apertura (anche se in memoria è «fresco»): chi è appena entrato deve esserci. */
export function useFreshTrip(tripId: string, enabled: boolean) {
  return useQuery({ queryKey: tripKeys.one(tripId), queryFn: () => tripsApi.get(tripId), refetchOnMount: 'always', enabled })
}

// Invalidare ['trips'] copre anche ['trips', id, …]: lista e dettaglio si aggiornano insieme
export function useCreateTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: TripInput) => tripsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  })
}

export function useJoinTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ code, participantId }: { code: string; participantId?: string }) => tripsApi.join(code, participantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  })
}

export function useUpdateTrip(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: TripPatch) => tripsApi.update(tripId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  })
}

export function useDeleteTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tripId: string) => tripsApi.remove(tripId),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  })
}

export function useRegenerateCode(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => tripsApi.regenerateCode(tripId),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.one(tripId) }),
  })
}

/** Uscita dal viaggio (o rimozione da parte dell'organizzatore): il partecipante resta nello storico. */
export function useLeaveTrip(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (participantId: string) => tripsApi.leave(tripId, participantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  })
}

export function useAddParticipant(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ParticipantInput) => tripsApi.addParticipant(tripId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  })
}

export function useUpdateParticipant(tripId: string, participantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ParticipantPatch) => tripsApi.updateParticipant(tripId, participantId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  })
}

export function useUnlinkParticipant(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (participantId: string) => tripsApi.unlinkParticipant(tripId, participantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  })
}

/** Copertina del viaggio (D-71): la sceglie chiunque sia nel viaggio; cambia il viaggio e la Home. */
export function useSetCover(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (photoId: string | null) => { if (photoId) await tripsApi.setCover(tripId, photoId); else await tripsApi.clearCover(tripId) },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: tripKeys.one(tripId) }); void qc.invalidateQueries({ queryKey: ['home'] }) },
  })
}
