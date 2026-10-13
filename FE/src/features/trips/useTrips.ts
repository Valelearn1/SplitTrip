import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tripsApi, type TripInput, type TripPatch } from './tripsApi'

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
    mutationFn: (code: string) => tripsApi.join(code),
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

export function useRemoveMember(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => tripsApi.removeMember(tripId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  })
}
