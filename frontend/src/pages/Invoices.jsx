import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCheck, Search } from 'lucide-react'
import client, { errorMessage } from '../api/client'
import DataTable from '../components/DataTable'
import PageHeader from '../components/PageHeader'
import Pagination from '../components/Pagination'
import StatusBadge from '../components/StatusBadge'
import useFetch from '../components/useFetch'
import { useToast } from '../context/ToastContext'
import { money, shortDate, titleCase } from '../utils/format'

const filters = [
  { key: 'ALL', label: 'All' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PAID', label: 'Paid' },
  { key: 'OVERDUE', label: 'Overdue' },
  { key: 'CANCELLED', label: 'Cancelled' },
]

export default function Invoices() {
  const navigate = useNavigate()
  const toast = useToast()
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const params = {
    status: ['ALL', 'OVERDUE'].includes(filter) ? undefined : filter,
    overdue: filter === 'OVERDUE' ? true : undefined,
    search: search || undefined,
    page,
    size: 10,
  }
  const { data, loading, reload } = useFetch('/invoices', params)

  const confirmDrafts = async () => {
    try {
      const { data: result } = await client.post('/invoices/confirm-drafts')
      toast.success(`${result.confirmed} draft invoices confirmed`)
      reload()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <>
      <PageHeader title="Invoices" subtitle="Generated from subscriptions, never typed by hand">
        <button className="btn btn-ghost" onClick={confirmDrafts}><CheckCheck size={17} /> Confirm all drafts</button>
      </PageHeader>
      <div className="toolbar">
        <div className="search">
          <Search size={17} />
          <input placeholder="Search by invoice or customer" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} />
        </div>
        <div className="chips">
          {filters.map((f) => (
            <button key={f.key} className={`chip${filter === f.key ? ' on' : ''}`} onClick={() => { setFilter(f.key); setPage(0) }}>{f.label}</button>
          ))}
        </div>
      </div>
      <DataTable
        loading={loading}
        rows={data?.items || []}
        onRowClick={(r) => navigate(`/invoices/${r.id}`)}
        empty={{ title: 'No invoices match', text: 'Run billing from the dashboard to generate invoices for due subscriptions.' }}
        columns={[
          { label: 'Invoice', key: 'number' },
          { label: 'Customer', key: 'customerName' },
          { label: 'Subscription', key: 'subscriptionNumber' },
          { label: 'Invoice date', render: (r) => shortDate(r.invoiceDate) },
          { label: 'Due', render: (r) => shortDate(r.dueDate) },
          { label: 'Total', num: true, render: (r) => money(r.total) },
          { label: 'Paid', num: true, render: (r) => money(r.amountPaid) },
          { label: 'Status', render: (r) => <StatusBadge status={r.status} overdue={r.overdue} /> },
        ]}
      />
      {data && <Pagination page={data.page} totalPages={data.totalPages} totalItems={data.totalItems} onChange={setPage} />}
    </>
  )
}
