import { NavLink, Outlet, useLocation, useParams } from 'react-router'
import type { Participant, Trip } from '../../shared/api/types'
import { ApiError } from '../../shared/api/client'
import { FormError } from '../../shared/ui/FormError'
import { Icon } from '../../shared/ui/Icon'
import { Spinner } from '../../shared/ui/Spinner'
import { StatusBadge } from '../../shared/ui/StatusBadge'
import { formatDateRange } from '../../shared/utils/format'
import { useAuth } from '../auth/useAuth'
import { ChatButton } from '../chat/ChatButton'
import { NewMessageToast } from '../chat/NewMessageToast'
import { useTripLiveSync } from '../chat/useTripLiveSync'
import { useBalances } from '../balances/useBalances'
import { BalancePill } from '../../shared/ui/BalancePill'
import { MoneyText } from '../../shared/ui/MoneyText'
import { useTrip } from './useTrips'
import { useTripSeason } from '../../shared/season/seasonContext'

/** me = il mio partecipante: me.id è l'id usato nei soldi, me.userId il mio utente. */
export type TripContext = { trip: Trip; me: Participant; isOrganizer: boolean; canWrite: boolean }

export function TripLayout() {
  const { tripId = '' } = useParams()
  const { auth } = useAuth()
  const { data: trip, isPending, error } = useTrip(tripId)
  const balances = useBalances(tripId)
  const location = useLocation()
  // la cache della chat resta aggiornata in tutto il viaggio, non solo nella pagina Chat
  const myParticipantId = trip?.participants.find((p) => p.userId === auth?.user.id)?.id ?? ''
  useTripLiveSync(myParticipantId ? tripId : null, myParticipantId)
  useTripSeason(trip) // D-58: lo sfondo prende la stagione di questo viaggio

  if (isPending) return <Spinner />
  // D-63: se il server non si raggiunge (status 0) il viaggio già caricato resta; un 403/404 invece lo toglie
  const unreachable = error instanceof ApiError && error.status === 0
  if (!trip || (error && !unreachable)) return <FormError error={error ?? new Error('Viaggio non disponibile')} />

  const me = trip.participants.find((p) => p.userId === auth?.user.id)
  if (!me) return <p role="alert">Non fai parte di questo viaggio.</p>
  const ctx: TripContext = { trip, me, isOrganizer: me.role === 'ORGANIZER', canWrite: trip.status !== 'CLOSED' }
  // Panoramica e Saldi aprono già con la card grande del saldo: in testa lo mostriamo solo nelle altre sezioni
  const path = location.pathname.replace(/\/$/, '')
  const hasHeroBalance = path === `/trips/${tripId}` || path === `/trips/${tripId}/balances`
  const myNet = hasHeroBalance ? undefined : balances.data?.balances.find((b) => b.participantId === me.id)?.net

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>{trip.name}</h1>
          <p className="muted"><Icon name="location_on" className="inline-icon" /> {trip.destination} · {formatDateRange(trip.startDate, trip.endDate)}</p>
        </div>
        <div className="head-balance">
          <StatusBadge status={trip.status} />
          <span className="head-actions">
            <ChatButton tripId={trip.id} />
            <NavLink to={`settings?tab=${ctx.isOrganizer ? 'viaggio' : 'persone'}`} className="btn btn-secondary btn-sm icon-btn" aria-label="Impostazioni del viaggio"><Icon name="settings" /></NavLink>
          </span>
          {myNet !== undefined && (
            <>
              <MoneyText amount={myNet} currency={trip.currency} signed className="amount-lg" />
              <BalancePill net={myNet} />
            </>
          )}
        </div>
      </div>
      <nav className="tabs" aria-label="Sezioni del viaggio">
        <NavLink to="" end replace><Icon name="explore" />Panoramica</NavLink>
        <NavLink to="expenses" replace><Icon name="receipt_long" />Spese</NavLink>
        <NavLink to="balances" replace><Icon name="balance" />Saldi</NavLink>
        <NavLink to="lists" replace><Icon name="checklist" />Liste</NavLink>
        <NavLink to="photos" replace><Icon name="photo_library" />Foto</NavLink>
      </nav>
      <Outlet context={ctx} />
      <NewMessageToast tripId={trip.id} myParticipantId={me.id} onChatPage={path.endsWith('/chat')} />
    </section>
  )
}
