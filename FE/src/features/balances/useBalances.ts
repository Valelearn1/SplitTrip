import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SettlementInput } from '../../shared/api/types'
import { balancesApi } from './balancesApi'

export function useBalances(tripId: string) {
  return useQuery({ queryKey: ['trips', tripId, 'balances'], queryFn: () => balancesApi.balances(tripId) })
}

export function useSummary(tripId: string) {
  return useQuery({ queryKey: ['trips', tripId, 'summary'], queryFn: () => balancesApi.summary(tripId) })
}

export function useSettlements(tripId: string) {
  return useQuery({ queryKey: ['trips', tripId, 'settlements'], queryFn: () => balancesApi.settlements(tripId) })
}

export function useCreateSettlement(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: SettlementInput) => balancesApi.createSettlement(tripId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips', tripId] }),
  })
}

export function useDeleteSettlement(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => balancesApi.removeSettlement(tripId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips', tripId] }),
  })
}
