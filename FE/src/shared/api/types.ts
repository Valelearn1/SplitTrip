export type User = { id: string; email: string; displayName: string; hasAvatar: boolean }
export type AuthResponse = { token: string; user: User }

export type TripStatus = 'PLANNING' | 'ONGOING' | 'CLOSED'
export type MemberRole = 'ORGANIZER' | 'MEMBER'
export type Participant = {
  id: string; userId: string | null; displayName: string; role: MemberRole
  defaultWeight: number; arrivalDate: string | null; departureDate: string | null; hasAvatar: boolean
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
  receiptPhotoId: string | null
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

export type TodoListType = 'PACKING' | 'GENERAL'
export type TodoItem = {
  id: string; text: string; done: boolean; assigneeParticipantId: string | null; assigneeName: string | null
  assigneeLeft: boolean; createdBy: string; createdAt: string
}
export type TodoList = { id: string; title: string; type: TodoListType; createdAt: string; items: TodoItem[] }

export type PhotoKind = 'PHOTO' | 'RECEIPT'
export type Photo = {
  id: string; kind: PhotoKind; expenseId: string | null; uploaderId: string; uploaderName: string; caption: string | null
  takenAt: string | null; latitude: number | null; longitude: number | null; width: number; height: number; createdAt: string
}

export type NotificationType = 'EXPENSE_ADDED' | 'SETTLEMENT_ADDED' | 'PARTICIPANT_JOINED' | 'TODO_ASSIGNED'
export type AppNotification = {
  id: string; tripId: string; type: NotificationType; message: string; link: string; readAt: string | null; createdAt: string
}

export type WeatherDay = { date: string; code: number; tMin: number; tMax: number }
export type Weather = { days: WeatherDay[] }
export type ChatEventType = 'EXPENSE_CREATED' | 'SETTLEMENT_CREATED' | 'PARTICIPANT_JOINED'
export type ChatMessage = {
  id: string; kind: 'TEXT' | 'EVENT'; authorParticipantId: string | null; authorName: string | null; authorUserId: string | null
  authorHasAvatar: boolean; content: string | null; eventType: ChatEventType | null; refId: string | null; createdAt: string; deleted: boolean
}
export type MessagePage = { items: ChatMessage[]; hasMore: boolean }
export type LiveEvent =
  | { type: 'message.created'; data: ChatMessage }
  | { type: 'message.deleted'; data: { id: string } }
  | { type: 'typing'; data: { participantId: string; name: string } }
export type LiveNotification = { notification: AppNotification; unreadCount: number }
export type AiTipCategory = 'SEE' | 'EAT' | 'PACK' | 'TIP'
export type AiTip = { title: string; text: string; category: AiTipCategory }
export type AiTips = { available: boolean; remainingToday: number; tips: AiTip[]; generatedAt: string | null }
export type PackingSuggestions = { items: string[]; remainingToday: number }
