export type User = { id: string; email: string; displayName: string }
export type AuthResponse = { token: string; user: User }

export type TripStatus = 'PLANNING' | 'ONGOING' | 'CLOSED'
export type MemberRole = 'ORGANIZER' | 'MEMBER'
export type Member = { userId: string; displayName: string; role: MemberRole; joinedAt: string }
export type TripSummary = {
  id: string; name: string; destination: string; startDate: string; endDate: string
  currency: string; status: TripStatus; memberCount: number; myRole: MemberRole
}
export type Trip = Omit<TripSummary, 'memberCount' | 'myRole'> & { inviteCode: string; ownerId: string; members: Member[] }
export type JoinPreview = { name: string; destination: string; startDate: string; endDate: string; memberCount: number }

export type ExpenseCategory = 'FOOD' | 'TRANSPORT' | 'LODGING' | 'ACTIVITY' | 'OTHER'
export type SplitType = 'EQUAL' | 'CUSTOM'
export type Share = { userId: string; displayName: string; amount: number }
export type Expense = {
  id: string; description: string; amount: number; date: string; category: ExpenseCategory; splitType: SplitType
  payerId: string; payerName: string; createdBy: string; shares: Share[]; createdAt: string
}
export type ExpenseInput = {
  description: string; amount: number; date: string; category: ExpenseCategory; payerId: string
  splitType: SplitType; shares: { userId: string; amount?: number }[]
}
export type TrashedExpense = { id: string; description: string; amount: number; date: string; deletedAt: string }

export type Settlement = {
  id: string; fromUserId: string; fromName: string; toUserId: string; toName: string
  amount: number; date: string; note: string | null; createdBy: string; createdAt: string
}
export type SettlementInput = { fromUserId: string; toUserId: string; amount: number; date: string; note?: string }

export type MemberBalance = { userId: string; displayName: string; paid: number; owed: number; net: number }
export type Transfer = { fromUserId: string; fromName: string; toUserId: string; toName: string; amount: number }
export type Balances = { balances: MemberBalance[]; suggestedTransfers: Transfer[] }
export type Summary = { total: number; byCategory: Record<string, number>; byPayer: { userId: string; displayName: string; amount: number }[] }

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  FOOD: 'Cibo', TRANSPORT: 'Trasporti', LODGING: 'Alloggio', ACTIVITY: 'Attività', OTHER: 'Altro',
}
export const STATUS_LABELS: Record<TripStatus, string> = {
  PLANNING: 'In pianificazione', ONGOING: 'In corso', CLOSED: 'Chiuso',
}
