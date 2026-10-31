import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import client, { errorMessage } from '../api/client'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import useFetch from '../components/useFetch'
import { useToast } from '../context/ToastContext'
import { money, shortDate, titleCase } from '../utils/format'

const flow = ['DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'CLOSED']

export default function SubscriptionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { data: sub, loading, setData } = useFetch(`/subscriptions/${id}`)
  const [busy, setBusy] = useState(false)

  if (loading || !sub) return <div className="card"><div className="skeleton" style={{ width: '40%' }} /></div>

  const act = async (request, message) => {
    setBusy(true)
    try {
      const { data } = await request()
      setData(data)
      toast.success(message)
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const move = (to, message) => act(() => client.post(`/subscriptions/${id}/status`, null, { params: { to } }), message)

  const effective = sub.status === 'PAUSED' ? 'ACTIVE' : sub.status
  const position = flow.indexOf(effective)
  const editable = sub.status === 'DRAFT' || sub.status === 'QUOTATION'
  const subtotal = sub.lines.reduce((sum, l) => sum + Number(l.amount), 0)
  const tax = sub.lines.reduce((sum, l) => sum + (Number(l.amount) * Number(l.taxRate)) / 100, 0)

  const buttons = []
  if (sub.status === 'DRAFT') buttons.push(['Send as quotation', () => move('QUOTATION', 'Moved to quotation')])
  if (sub.status === 'QUOTATION') buttons.push(['Confirm', () => move('CONFIRMED', 'Subscription confirmed')])
  if (sub.status === 'CONFIRMED') buttons.push(['Activate', () => move('ACTIVE', 'Subscription is active')])
  if (sub.status === 'ACTIVE' && sub.pausable) buttons.push(['Pause', () => move('PAUSED', 'Subscription paused'), true])
  if (sub.status === 'PAUSED') buttons.push(['Resume', () => move('ACTIVE', 'Subscription resumed')])
  if ((sub.status === 'ACTIVE' || sub.status === 'CLOSED') && sub.renewable) buttons.push(['Renew', () => act(() => client.post(`/subscriptions/${id}/renew`), 'Subscription renewed'), true])
  if (sub.status !== 'CLOSED') buttons.push(['Close', () => window.confirm('Close this subscription?') && move('CLOSED', 'Subscription closed'), true, true])

  return (
    <>
      <PageHeader title={sub.number} subtitle={`${sub.customerName} on ${sub.planName}`}>
        {editable && <button className="btn btn-ghost" onClick={() => navigate(`/subscriptions/${id}/edit`)}><Pencil size={16} /> Edit</button>}
        {buttons.map(([label, onClick, ghost, danger]) => (
          <button key={label} className={`btn ${danger ? 'btn-ghost' : ghost ? 'btn-ghost' : ''}`} disabled={busy} onClick={onClick}>{label}</button>
        ))}
      </PageHeader>

      <div className="stepper" aria-label="Subscription progress">
        {flow.map((s, i) => <div key={s} className={`step${i < position ? ' done' : ''}${i === position ? ' now' : ''}`}>{titleCase(s)}</div>)}
      </div>

      <div className="card">
        <dl className="detail-grid">
          <div><dt>Status</dt><dd><StatusBadge status={sub.status} /></dd></div>
          <div><dt>Billing</dt><dd>{titleCase(sub.billingPeriod)}</dd></div>
          <div><dt>Start date</dt><dd>{shortDate(sub.startDate)}</dd></div>
          <div><dt>Expiry date</dt><dd>{shortDate(sub.expiryDate)}</dd></div>
          <div><dt>Next invoice</dt><dd>{sub.status === 'ACTIVE' ? shortDate(sub.nextBillingDate) : '-'}</dd></div>
          <div><dt>Payment terms</dt><dd>{sub.paymentTerms}</dd></div>
          <div><dt>Discount</dt><dd>{sub.discountName || 'None'}</dd></div>
          <div><dt>Quotation valid until</dt><dd>{shortDate(sub.quotationValidUntil)}</dd></div>
        </dl>
      </div>

      <div className="card">
        <h2>Order lines</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Product</th><th>Variant</th><th className="num">Qty</th><th className="num">Unit price</th><th>Tax</th><th className="num">Amount</th></tr></thead>
            <tbody>
              {sub.lines.map((l, i) => (
                <tr key={i}>
                  <td>{l.productName}</td><td>{l.variantLabel || '-'}</td><td className="num">{l.quantity}</td>
                  <td className="num">{money(l.unitPrice)}</td><td>{l.taxName || '-'}</td><td className="num">{money(l.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="totals">
          <div><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div><span>Tax</span><span>{money(tax)}</span></div>
          <div className="grand"><span>Per cycle</span><span>{money(subtotal + tax)}</span></div>
        </div>
      </div>
    </>
  )
}
