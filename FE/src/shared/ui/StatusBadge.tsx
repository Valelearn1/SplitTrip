import { STATUS_LABELS, type TripStatus } from '../api/types'

export function StatusBadge({ status }: { status: TripStatus }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{STATUS_LABELS[status]}</span>
}
