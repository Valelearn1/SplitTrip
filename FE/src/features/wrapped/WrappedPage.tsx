import { useState } from 'react'
import { Link, useOutletContext } from 'react-router'
import { ApiError, isUnreachable } from '../../shared/api/client'
import { CATEGORY_LABELS } from '../../shared/api/types'
import { tripSeason } from '../../shared/season/season'
import { AuthImage } from '../../shared/ui/AuthImage'
import { CategoryIcon } from '../../shared/ui/CategoryIcon'
import { Icon } from '../../shared/ui/Icon'
import { MoneyText } from '../../shared/ui/MoneyText'
import { Spinner } from '../../shared/ui/Spinner'
import { countLabel, formatDate, formatDateRange, formatMoney } from '../../shared/utils/format'
import { wheelColors } from '../games/wheel'
import { photoPath } from '../photos/photosApi'
import { PointsMap } from '../photos/PointsMap'
import type { TripContext } from '../trips/TripLayout'
import { BadgeCard } from './BadgeCard'
import { GuessGate } from './GuessGate'
import { Podium } from './Podium'
import { Reveal } from './Reveal'
import { StoryImage } from './StoryImage'
import { useGuess, useWrapped } from './useWrapped'

/** Il riepilogo di fine viaggio (D-53): prima la scommessa, poi la rivelazione, poi i numeri. */
export function WrappedPage() {
  const { trip, me } = useOutletContext<TripContext>()
  const wrapped = useWrapped(trip.id)
  const guess = useGuess(trip.id)
  const [phase, setPhase] = useState<'gate' | 'reveal' | 'page'>('gate')

  if (wrapped.isPending) return <Spinner />
  if (wrapped.error && !(isUnreachable(wrapped.error) && wrapped.data)) {   // D-63: il riepilogo già visto resta
    return (
      <section className="card wrapped-wait">
        <Icon name="celebration" />
        <h2>{wrapped.error instanceof ApiError ? wrapped.error.detail : 'Riepilogo non disponibile'}</h2>
        <p className="muted">{wrapped.error instanceof ApiError && wrapped.error.status === 409 ? `Torna qui dopo il ${formatDate(trip.endDate)}.` : 'Riprova tra poco.'}</p>
      </section>
    )
  }
  const d = wrapped.data!
  const colors = wheelColors(tripSeason(trip))
  if (phase === 'gate' && d.guess.mine === null) {
    // 409 = l'ipotesi c'è già (un altro dispositivo): niente errore, si va alla rivelazione con i dati ricaricati
    const already = guess.error instanceof ApiError && guess.error.status === 409
    return <GuessGate currency={d.trip.currency} pending={guess.isPending} error={already ? null : guess.error}
      onGuess={(a) => guess.mutate(a, { onSuccess: () => setPhase('reveal'), onError: (e) => { if (e instanceof ApiError && e.status === 409) setPhase('reveal') } })}
      onSkip={() => setPhase('reveal')} />
  }
  if (phase !== 'page') return <Reveal data={d} me={me.id} colors={colors} onContinue={() => setPhase('page')} />

  const money = (n: number) => formatMoney(n, d.trip.currency)
  const located = d.moments.filter((m) => m.latitude !== null && m.longitude !== null)
  return (
    <div className="stack wrapped">
      <section className="card wrapped-cover">
        {d.trip.coverPhotoId && <AuthImage path={photoPath(trip.id, d.trip.coverPhotoId, 'image')} alt="" className="wrapped-cover-img" />}
        <div className="wrapped-cover-text">
          <p className="label">Il vostro viaggio in numeri</p>
          <h1>{d.trip.name}</h1>
          <p>{d.trip.destination} · {formatDateRange(d.trip.startDate, d.trip.endDate)} · {countLabel(d.trip.nights, 'notte', 'notti')} · {countLabel(d.trip.people, 'persona', 'persone')}</p>
        </div>
      </section>

      <section className="card wrapped-total">
        <strong className="amount-xl">{money(d.totals.groupTotal)}</strong>
        <span>in tutto</span>
        <small className="muted">{money(d.totals.perPerson)} a persona · {countLabel(d.totals.expenseCount, 'spesa', 'spese')}</small>
      </section>

      {d.byCategory.length > 0 && (
        <section className="card">
          <h2>Dove sono finiti i soldi</h2>
          <ul className="cat-bars">
            {d.byCategory.map((c, i) => (
              <li key={c.category} className={i === 0 ? 'top' : ''}>
                <CategoryIcon category={c.category} />
                <span className="cat-name">{CATEGORY_LABELS[c.category]}</span>
                <span className="cat-bar" aria-hidden="true"><span style={{ width: `${c.share}%` }} /></span>
                <MoneyText amount={c.amount} currency={d.trip.currency} />
                <small className="muted">{c.share}%</small>
              </li>
            ))}
          </ul>
        </section>
      )}

      {d.biggestExpense && (
        <section className="card">
          <h2>Record</h2>
          <div className="kv">
            <div><span>La spesa più grande</span><span><strong>{d.biggestExpense.description}</strong> · {money(d.biggestExpense.amount)} · {d.biggestExpense.payerName}</span></div>
            {d.priciestDay && <div><span>Il giorno più caro</span><span>{formatDate(d.priciestDay.date)} · {money(d.priciestDay.amount)}</span></div>}
          </div>
        </section>
      )}

      {d.moments.length > 0 && (
        <section className="card">
          <h2>I momenti</h2>
          <ul className="photo-grid wrapped-moments">
            {d.moments.map((m) => (
              <li key={m.photoId}>
                <AuthImage path={photoPath(trip.id, m.photoId, 'thumbnail')} alt={m.caption ?? m.placeName ?? 'Foto del viaggio'} />
                {m.placeName && <small>{m.placeName}</small>}
              </li>
            ))}
          </ul>
          {located.length > 0 && <PointsMap points={located.map((m) => ({ id: m.photoId, name: m.placeName ?? m.caption ?? 'Foto', latitude: m.latitude!, longitude: m.longitude! }))} />}
        </section>
      )}

      {d.totals.photos + d.totals.messages + d.totals.reactions > 0 && (
        <section className="card">
          <h2>Il gruppo</h2>
          <div className="stats-grid">
            <div className="stat-big"><strong>{d.totals.photos}</strong><span>foto</span></div>
            <div className="stat-big"><strong>{d.totals.messages}</strong><span>messaggi</span></div>
            <div className="stat-big"><strong>{d.totals.reactions}</strong><span>reazioni</span></div>
          </div>
        </section>
      )}

      <section className="card">
        <h2>I badge</h2>
        <div className="badge-grid">
          {d.badges.map((b) => <BadgeCard key={b.participantId + b.code} badge={b} person={d.people.find((p) => p.participantId === b.participantId)} />)}
        </div>
      </section>

      <Podium title="Chi ha fatto più foto" people={d.people} value={(p) => p.photos} unit={['foto', 'foto']} />
      <Podium title="Chi ha scritto di più" people={d.people} value={(p) => p.messages} unit={['messaggio', 'messaggi']} />
      <Podium title="Chi ha ricevuto più reazioni" people={d.people} value={(p) => p.reactionsReceived} unit={['reazione', 'reazioni']} />

      <section className="card wrapped-end">
        {d.settlement.settled
          ? <p><Icon name="check_circle" className="inline-icon" /> Conti chiusi: siete in pari</p>
          : <Link to={`/trips/${trip.id}/balances`} className="btn btn-secondary"><Icon name="sync_alt" />{d.settlement.openTransfers === 1 ? 'Manca 1 rimborso' : `Mancano ${d.settlement.openTransfers} rimborsi`}</Link>}
        <StoryImage
          data={{ name: d.trip.name, dates: `${formatDateRange(d.trip.startDate, d.trip.endDate)} · ${countLabel(d.trip.nights, 'notte', 'notti')} · ${countLabel(d.trip.people, 'persona', 'persone')}`,
            total: d.totals.groupTotal, perPerson: d.totals.perPerson, photos: d.totals.photos, messages: d.totals.messages, currency: d.trip.currency,
            badges: d.badges.map((b) => ({ title: b.title })) }}
          coverPath={d.trip.coverPhotoId ? photoPath(trip.id, d.trip.coverPhotoId, 'image') : null} />
      </section>
    </div>
  )
}
