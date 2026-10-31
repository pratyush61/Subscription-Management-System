import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Printer, Send } from 'lucide-react'
import client, { errorMessage } from '../api/client'
import InvoiceSheet from '../components/InvoiceSheet'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import useFetch from '../components/useFetch'
import { useToast } from '../context/ToastContext'
import { titleCase, today } from '../utils/format'

const methods = ['CARD', 'UPI', 'BANK_TRANSFER', 'CASH']

export default function InvoiceDetail() {
  const { id } = useParams()
  const toast = useToast()
  const { data: invoice, loading, setData } = useFetch(`/invoices/${id}`)
  const [paying, setPaying] = useState(false)
  const [form, setForm] = useState({ method: 'BANK_TRANSFER', amount: '', paymentDate: today(), note: '' })
  const [busy, setBusy] = useState(false)

  if (loading || !invoice) return <div className="card"><div className="skeleton" style={{ width: '40%' }} /></div>

  const run = async (request, message) => {
    setBusy(true)
    try {
      const { data } = await request()
      if (data?.id) setData(data)
      toast.success(message || data.message)
      return true
    } catch (err) {
      toast.error(errorMessage(err))
      return false
    } finally {
      setBusy(false)
    }
  }

  const openPayment = () => {
    setForm({ method: 'BANK_TRANSFER', amount: invoice.balance, paymentDate: today(), note: '' })
    setPaying(true)
  }

  const submitPayment = async (e) => {
    e.preventDefault()
    const ok = await run(() => client.post(`/invoices/${id}/payments`, { ...form, amount: Number(form.amount) }), 'Payment recorded')
    if (ok) setPaying(false)
  }

  const canCancel = (invoice.status === 'DRAFT' || invoice.status === 'CONFIRMED') && Number(invoice.amountPaid) === 0

  return (
    <>
      <PageHeader title="Invoice" subtitle="Review, send, print and record payments">
        {invoice.status === 'DRAFT' && <button className="btn" disabled={busy} onClick={() => run(() => client.post(`/invoices/${id}/confirm`), 'Invoice confirmed')}>Confirm</button>}
        {invoice.status === 'CONFIRMED' && <button className="btn" onClick={openPayment}>Record payment</button>}
        {(invoice.status === 'CONFIRMED' || invoice.status === 'PAID') && (
          <button className="btn btn-ghost" disabled={busy} onClick={() => run(() => client.post(`/invoices/${id}/send`))}><Send size={16} /> Send</button>
        )}
        <button className="btn btn-ghost" onClick={() => window.print()}><Printer size={16} /> Print</button>
        {canCancel && <button className="btn btn-ghost" disabled={busy} onClick={() => window.confirm('Cancel this invoice?') && run(() => client.post(`/invoices/${id}/cancel`), 'Invoice cancelled')}>Cancel invoice</button>}
      </PageHeader>
      <InvoiceSheet invoice={invoice} />

      {paying && (
        <Modal title="Record a payment" onClose={() => setPaying(false)}>
          <form onSubmit={submitPayment}>
            <div className="form-grid">
              <div>
                <label htmlFor="method">Method</label>
                <select id="method" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                  {methods.map((m) => <option key={m} value={m}>{titleCase(m)}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="amount">Amount</label>
                <input id="amount" type="number" step="0.01" min="0.01" max={invoice.balance} required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                <div className="hint">Balance due {invoice.balance}</div>
              </div>
              <div><label htmlFor="date">Payment date</label><input id="date" type="date" required value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} /></div>
              <div className="full"><label htmlFor="note">Note</label><textarea id="note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
            </div>
            <div className="modal-foot" style={{ padding: '22px 0 0' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setPaying(false)}>Cancel</button>
              <button className="btn" disabled={busy}>Save payment</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
