import { titleCase } from '../utils/format'

const tones = {
  ACTIVE: 'green', PAID: 'green', CONFIRMED: 'blue', QUOTATION: 'amber', DRAFT: '', PAUSED: 'amber',
  CLOSED: 'red', CANCELLED: 'red', OVERDUE: 'red',
}

export default function StatusBadge({ status, overdue }) {
  const shown = overdue ? 'OVERDUE' : status
  return <span className={`badge ${tones[shown] || ''}`}>{titleCase(shown)}</span>
}
