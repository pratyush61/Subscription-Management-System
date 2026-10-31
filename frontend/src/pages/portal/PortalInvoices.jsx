import { useState } from 'react'
import client, { errorMessage } from '../../api/client'
import DataTable from '../../components/DataTable'
import InvoiceSheet from '../../components/InvoiceSheet'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import useFetch from '../../components/useFetch'
import { useToast } from '../../context/ToastContext'
import { money, shortDate } from '../../utils/format'

export default function PortalInvoices() {
  const toast = useToast()
  const { data, loading, reload } = useFetch('/portal/invoices')
  const [open, setOpen] = useState(null)
  const [busy, setBusy] = useState(false)

  const view = async (row) => {
    try {
      const response = await client.get(`/portal/invoices/${row.id}`)
      setOpen(response.data)
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  const pay = async (invoice) => {
    setBusy(true)
    try {
      const response = await client.post(`/portal/invoices/${invoice.id}/pay`)
      setOpen(response.data)
      toast.success('Payment received. Thank you')
      reload()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="My invoices" subtitle="What you have been billed and what is still due" />
      <DataTable
        loading={loading}
        rows={data || []}
        onRowClick={view}
        empty={{ title: 'No invoices yet', text: 'Your invoices will show up here after your first billing date.' }}
        columns={[
          { label: 'Invoice', key: 'number' },
          { label: 'Date', render: (r) => shortDate(r.invoiceDate) },
          { label: 'Due', render: (r) => shortDate(r.dueDate) },
          { label: 'Total', num: true, render: (r) => money(r.total) },
          { label: 'Status', render: (r) => <StatusBadge status={r.status} overdue={r.overdue} /> },
        ]}
      />
      {open && (
        <Modal title="Invoice" onClose={() => setOpen(null)}
          footer={open.status === 'CONFIRMED' && <button className="btn" disabled={busy} onClick={() => pay(open)}>Pay {money(open.balance)} now</button>}>
          <InvoiceSheet invoice={open} />
        </Modal>
      )}
    </>
  )
}
