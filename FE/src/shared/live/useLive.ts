import { useContext, useEffect, useRef } from 'react'
import type { LiveEvent, LiveNotification } from '../api/types'
import { LiveContext } from './liveContext'

export const useLiveStatus = () => useContext(LiveContext).status
export const useLivePublish = () => useContext(LiveContext).publish

export function useLiveSubscription(destination: string | null, onMessage: (body: unknown) => void) {
  const { subscribe } = useContext(LiveContext)
  const latest = useRef(onMessage)
  useEffect(() => { latest.current = onMessage })
  useEffect(() => {
    if (!destination) return
    return subscribe(destination, (body) => latest.current(body))
  }, [destination, subscribe])
}

export function useTripChannel(tripId: string | null, onEvent: (e: LiveEvent) => void) {
  useLiveSubscription(tripId ? `/topic/trips/${tripId}` : null, (b) => onEvent(b as LiveEvent))
}

export function useNotificationsChannel(onEvent: (e: LiveNotification) => void) {
  useLiveSubscription('/user/queue/notifications', (b) => onEvent(b as LiveNotification))
}
