import { useState } from 'react'
import client, { errorMessage } from '../../api/client'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import useFetch from '../../components/useFetch'
import { useToast } from '../../context/ToastContext'
import { money, shortDate, titleCase } from '../../utils/format'

export default function PortalSubscriptions() {
  const toast = useToast()
  const { data, loading, reload } = useFetch('/portal/subscriptions')
  const [busyId, setBusyId] = useState(null)

  const move = async (sub, to, message) => {
    setBusyId(sub.id)
    try {
      await client.post(`/portal/subscriptions/${sub.id}/status`, null, { params: { to } })
      toast.success(message)
      reload()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <PageHeader title="My subscriptions" subtitle="See what you are paying for and manage it yourself" />
      {loading ? (
        <div className="card"><div className="skeleton" style={{ width: '50%' }} /></div>
      ) : !data.length ? (
        <div className="card empty">
          <h3>No subscriptions yet</h3>
          <p>Once our team sets one up for you, it will appear here.</p>
        </div>
      ) : (
        <div className="plan-cards">
          {data.map((sub) => (
            <div className="card" key={sub.id}>
              <div className="page-header" style={{ marginBottom: 6 }}>
                <h3>{sub.planName}</h3>
                <StatusBadge status={sub.status} />
              </div>
              <p className="meta">{sub.number}, billed {titleCase(sub.billingPeriod).toLowerCase()}, {money(sub.recurringAmount)} before tax</p>
              <dl className="detail-grid" style={{ marginBottom: 14 }}>
                <div><dt>Started</dt><dd>{shortDate(sub.startDate)}</dd></div>
                <div><dt>Ends</dt><dd>{shortDate(sub.expiryDate)}</dd></div>
                {sub.status === 'ACTIVE' && <div><dt>Next invoice</dt><dd>{shortDate(sub.nextBillingDate)}</dd></div>}
              </dl>
              <ul style={{ paddingLeft: 18, marginBottom: 16, color: 'var(--muted)' }}>
                {sub.lines.map((l, i) => <li key={i}>{l.quantity} x {l.productName}{l.variantLabel ? ` (${l.variantLabel})` : ''}</li>)}
              </ul>
              <div className="actions">
                {sub.status === 'ACTIVE' && sub.pausable && <button className="btn btn-ghost btn-sm" disabled={busyId === sub.id} onClick={() => move(sub, 'PAUSED', 'Subscription paused')}>Pause</button>}
                {sub.status === 'PAUSED' && <button className="btn btn-sm" disabled={busyId === sub.id} onClick={() => move(sub, 'ACTIVE', 'Subscription resumed')}>Resume</button>}
                {(sub.status === 'ACTIVE' || sub.status === 'PAUSED') && sub.closable && (
                  <button className="btn btn-ghost btn-sm" disabled={busyId === sub.id}
                    onClick={() => window.confirm('Close this subscription?') && move(sub, 'CLOSED', 'Subscription closed')}>Close subscription</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
