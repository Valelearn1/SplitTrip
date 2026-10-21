import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ExpenseCategory, ExpenseInput } from '../../shared/api/types'
import { expensesApi } from './expensesApi'

export const expenseKeys = {
  list: (tripId: string, category?: ExpenseCategory) => ['trips', tripId, 'expenses', category ?? 'all'] as const,
  one: (tripId: string, expenseId: string) => ['trips', tripId, 'expenses', 'one', expenseId] as const,
  trash: (tripId: string) => ['trips', tripId, 'trash'] as const,
}

/** Dopo ogni scrittura si invalida tutto il viaggio: spese, cestino, saldi e riepilogo. */
function useInvalidateTrip(tripId: string) {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: ['trips', tripId] })
}

export function useExpenses(tripId: string, category?: ExpenseCategory) {
  return useQuery({ queryKey: expenseKeys.list(tripId, category), queryFn: () => expensesApi.list(tripId, category), refetchOnMount: 'always' })   // come i saldi (D-66)
}

export function useExpense(tripId: string, expenseId: string) {
  return useQuery({ queryKey: expenseKeys.one(tripId, expenseId), queryFn: () => expensesApi.get(tripId, expenseId), enabled: expenseId !== '' })
}

export function useCreateExpense(tripId: string) {
  const invalidate = useInvalidateTrip(tripId)
  return useMutation({ mutationFn: (body: ExpenseInput) => expensesApi.create(tripId, body), onSuccess: invalidate })
}

export function useUpdateExpense(tripId: string, expenseId: string) {
  const invalidate = useInvalidateTrip(tripId)
  return useMutation({ mutationFn: (body: ExpenseInput) => expensesApi.update(tripId, expenseId, body), onSuccess: invalidate })
}

export function useDeleteExpense(tripId: string) {
  const invalidate = useInvalidateTrip(tripId)
  return useMutation({ mutationFn: (expenseId: string) => expensesApi.remove(tripId, expenseId), onSuccess: invalidate })
}

export function useTrash(tripId: string) {
  return useQuery({ queryKey: expenseKeys.trash(tripId), queryFn: () => expensesApi.trash(tripId) })
}

export function useRestoreExpense(tripId: string) {
  const invalidate = useInvalidateTrip(tripId)
  return useMutation({ mutationFn: (expenseId: string) => expensesApi.restore(tripId, expenseId), onSuccess: invalidate })
}
