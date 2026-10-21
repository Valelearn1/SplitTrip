import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SettlementInput } from '../../shared/api/types'
import { balancesApi } from './balancesApi'

// D-66: spese e saldi non arrivano dal vivo (D-39 copre chat e notifiche): una pagina di soldi si rilegge sempre quando si apre,
// mostrando intanto la copia in memoria (trovato dalla CI: Saldi riaperto pochi secondi dopo la spesa di un altro)
const MONEY = { refetchOnMount: 'always' } as const

export function useBalances(tripId: string) {
  return useQuery({ queryKey: ['trips', tripId, 'balances'], queryFn: () => balancesApi.balances(tripId), ...MONEY })
}

export function useSummary(tripId: string) {
  return useQuery({ queryKey: ['trips', tripId, 'summary'], queryFn: () => balancesApi.summary(tripId), ...MONEY })
}

export function useSettlements(tripId: string) {
  return useQuery({ queryKey: ['trips', tripId, 'settlements'], queryFn: () => balancesApi.settlements(tripId), ...MONEY })
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
