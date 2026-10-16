import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { wrappedApi } from './wrappedApi'

// retry: false — prima della fine il server risponde 409 e riprovare non serve
export const useWrapped = (tripId: string) =>
  useQuery({ queryKey: ['trips', tripId, 'wrapped'], queryFn: () => wrappedApi.get(tripId), retry: false })

export function useGuess(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (amount: number) => wrappedApi.guess(tripId, amount),
    // anche su 409 (ipotesi già fatta, per esempio da un altro dispositivo) i dati vanno ricaricati
    onSettled: () => qc.invalidateQueries({ queryKey: ['trips', tripId, 'wrapped'] }),
  })
}
