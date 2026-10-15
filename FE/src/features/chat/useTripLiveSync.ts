import { useQueryClient } from '@tanstack/react-query'
import { useTripChannel } from '../../shared/live/useLive'
import { chatKeys, insertMessage, markDeleted, type ChatData } from './chatCache'

export function useTripLiveSync(tripId: string, myParticipantId: string) {
  const qc = useQueryClient()
  useTripChannel(tripId, (e) => {
    if (e.type === 'message.created') {
      qc.setQueryData<ChatData>(chatKeys.messages(tripId), (d) => insertMessage(d, e.data))
      if (e.data.authorParticipantId !== myParticipantId) void qc.invalidateQueries({ queryKey: chatKeys.unread(tripId) })
    } else if (e.type === 'message.deleted') {
      qc.setQueryData<ChatData>(chatKeys.messages(tripId), (d) => markDeleted(d, e.data.id))
      void qc.invalidateQueries({ queryKey: chatKeys.unread(tripId) })
    }
  })
}
