import { api } from '../../shared/api/client'
import type { Expense, ExpenseCategory, ExpenseInput, TrashedExpense } from '../../shared/api/types'

export const expensesApi = {
  list: (tripId: string, category?: ExpenseCategory) =>
    api<Expense[]>(`/trips/${tripId}/expenses${category ? `?category=${category}` : ''}`),
  get: (tripId: string, expenseId: string) => api<Expense>(`/trips/${tripId}/expenses/${expenseId}`),
  create: (tripId: string, body: ExpenseInput) => api<Expense>(`/trips/${tripId}/expenses`, { method: 'POST', body }),
  update: (tripId: string, expenseId: string, body: ExpenseInput) =>
    api<Expense>(`/trips/${tripId}/expenses/${expenseId}`, { method: 'PUT', body }),
  remove: (tripId: string, expenseId: string) => api<void>(`/trips/${tripId}/expenses/${expenseId}`, { method: 'DELETE' }),
  trash: (tripId: string) => api<TrashedExpense[]>(`/trips/${tripId}/expenses/trash`),
  restore: (tripId: string, expenseId: string) => api<Expense>(`/trips/${tripId}/expenses/${expenseId}/restore`, { method: 'POST' }),
}
