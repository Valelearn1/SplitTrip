import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { aiApi } from './aiApi'

export const aiKeys = { tips: (tripId: string) => ['ai', tripId, 'tips'] as const }

export function useAiTips(tripId: string) {
  return useQuery({ queryKey: aiKeys.tips(tripId), queryFn: () => aiApi.tips(tripId), retry: false, staleTime: 60_000 })
}

export function useGenerateTips(tripId: string) {
  const qc = useQueryClient()
  return useMutation({ mutationFn: () => aiApi.generateTips(tripId), onSuccess: (data) => qc.setQueryData(aiKeys.tips(tripId), data) })
}

export function usePackingSuggestions(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (listId: string) => aiApi.packing(tripId, listId),
    // anche la valigia consuma una generazione: si aggiorna il contatore della card
    onSuccess: () => qc.invalidateQueries({ queryKey: aiKeys.tips(tripId) }),
  })
}
