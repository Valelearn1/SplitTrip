import { api } from '../../shared/api/client'
import type { JoinPreview, Participant, Trip, TripStatus, TripSummary } from '../../shared/api/types'

export type TripInput = { name: string; destination: string; startDate: string; endDate: string; currency?: string; latitude?: number; longitude?: number }
export type TripPatch = Partial<Omit<TripInput, 'currency'>> & { status?: TripStatus }
export type ParticipantInput = { displayName: string; defaultWeight?: number; arrivalDate?: string; departureDate?: string }
/** Campi assenti = non toccare; clearDates azzera arrivo e partenza prima di applicare quelli presenti. */
export type ParticipantPatch = Partial<ParticipantInput> & { clearDates?: boolean }

export const tripsApi = {
  list: () => api<TripSummary[]>('/trips'),
  get: (tripId: string) => api<Trip>(`/trips/${tripId}`),
  create: (body: TripInput) => api<Trip>('/trips', { method: 'POST', body }),
  update: (tripId: string, body: TripPatch) => api<Trip>(`/trips/${tripId}`, { method: 'PATCH', body }),
  remove: (tripId: string) => api<void>(`/trips/${tripId}`, { method: 'DELETE' }),
  joinPreview: (code: string) => api<JoinPreview>(`/trips/join-preview?code=${encodeURIComponent(code)}`),
  join: (code: string, participantId?: string) => api<Trip>('/trips/join', { method: 'POST', body: { code, participantId } }),
  regenerateCode: (tripId: string) => api<Trip>(`/trips/${tripId}/invite-code/regenerate`, { method: 'POST' }),
  setCover: (tripId: string, photoId: string) => api<Trip>(`/trips/${tripId}/cover`, { method: 'PUT', body: { photoId } }),
  clearCover: (tripId: string) => api<void>(`/trips/${tripId}/cover`, { method: 'DELETE' }),
  addParticipant: (tripId: string, body: ParticipantInput) => api<Participant>(`/trips/${tripId}/participants`, { method: 'POST', body }),
  updateParticipant: (tripId: string, participantId: string, body: ParticipantPatch) =>
    api<Participant>(`/trips/${tripId}/participants/${participantId}`, { method: 'PATCH', body }),
  unlinkParticipant: (tripId: string, participantId: string) =>
    api<Participant>(`/trips/${tripId}/participants/${participantId}/unlink`, { method: 'POST' }),
  leave: (tripId: string, participantId: string) => api<void>(`/trips/${tripId}/participants/${participantId}`, { method: 'DELETE' }),
}
