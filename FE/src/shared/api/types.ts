export type User = { id: string; email: string; displayName: string }
export type AuthResponse = { token: string; user: User }

export type TripStatus = 'PLANNING' | 'ONGOING' | 'CLOSED'
export type MemberRole = 'ORGANIZER' | 'MEMBER'
export type Participant = {
  id: string; userId: string | null; displayName: string; role: MemberRole
  defaultWeight: number; arrivalDate: string | null; departureDate: string | null
}
export type TripSummary = {
  id: string; name: string; destination: string; startDate: string; endDate: string
  currency: string; status: TripStatus; memberCount: number; myRole: MemberRole
}
export type Trip = Omit<TripSummary, 'memberCount' | 'myRole'> & { inviteCode: string; ownerId: string; participants: Participant[] }
export type JoinPreview = {
  name: string; destination: string; startDate: string; endDate: string; memberCount: number
  unclaimed: { id: string; displayName: string }[]
}

export type ExpenseCategory = 'FOOD' | 'TRANSPORT' | 'LODGING' | 'ACTIVITY' | 'OTHER'
export type SplitType = 'EQUAL' | 'CUSTOM' | 'WEIGHT' | 'DAYS'
export type DayBasis = 'DAYS' | 'NIGHTS'
export type Share = { participantId: string; displayName: string; amount: number; weight: number | null }
export type Expense = {
  id: string; description: string; amount: number; currency: string; date: string; category: ExpenseCategory
  splitType: SplitType; dayBasis: DayBasis | null; payerId: string; payerName: string; createdBy: string; shares: Share[]; createdAt: string
}
export type ExpenseInput = {
  description: string; amount: number; date: string; category: ExpenseCategory; payerId: string
  splitType: SplitType; dayBasis?: DayBasis; shares: { participantId: string; amount?: number; weight?: number }[]
}
export type TrashedExpense = { id: string; description: string; amount: number; date: string; deletedAt: string }

export type Settlement = {
  id: string; fromParticipantId: string; fromName: string; toParticipantId: string; toName: string
  amount: number; date: string; note: string | null; createdBy: string; createdAt: string
}
export type SettlementInput = { fromParticipantId: string; toParticipantId: string; amount: number; date: string; note?: string }

export type MemberBalance = { participantId: string; displayName: string; left: boolean; paid: number; owed: number; net: number }
export type Transfer = { fromParticipantId: string; fromName: string; toParticipantId: string; toName: string; amount: number }
export type Balances = { balances: MemberBalance[]; suggestedTransfers: Transfer[] }
export type Summary = { total: number; byCategory: Record<string, number>; byPayer: { participantId: string; displayName: string; amount: number }[] }

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  FOOD: 'Cibo', TRANSPORT: 'Trasporti', LODGING: 'Alloggio', ACTIVITY: 'Attività', OTHER: 'Altro',
}
export const STATUS_LABELS: Record<TripStatus, string> = {
  PLANNING: 'In pianificazione', ONGOING: 'In corso', CLOSED: 'Chiuso',
}
