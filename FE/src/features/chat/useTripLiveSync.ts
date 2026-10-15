import { useQueryClient } from '@tanstack/react-query'
import { useTripChannel } from '../../shared/live/useLive'
import { chatKeys, insertMessage, markDeleted, setReactions, type ChatData } from './chatCache'

/** tripId null finché non risulto partecipante: una sottoscrizione rifiutata chiuderebbe tutta la connessione. */
export function useTripLiveSync(tripId: string | null, myParticipantId: string) {
  const qc = useQueryClient()
  useTripChannel(tripId, (e) => {
    if (e.type === 'message.created') {
      qc.setQueryData<ChatData>(chatKeys.messages(tripId!), (d) => insertMessage(d, e.data))
      if (e.data.authorParticipantId !== myParticipantId) void qc.invalidateQueries({ queryKey: chatKeys.unread(tripId!) })
    } else if (e.type === 'message.deleted') {
      qc.setQueryData<ChatData>(chatKeys.messages(tripId!), (d) => markDeleted(d, e.data.id))
      void qc.invalidateQueries({ queryKey: chatKeys.unread(tripId!) })
    } else if (e.type === 'message.reacted') {
      // le reazioni non contano come non letti (D-47)
      qc.setQueryData<ChatData>(chatKeys.messages(tripId!), (d) => setReactions(d, e.data.id, e.data.reactions))
    }
  })
}
