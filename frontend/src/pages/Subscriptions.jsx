import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import DataTable from '../components/DataTable'
import PageHeader from '../components/PageHeader'
import Pagination from '../components/Pagination'
import StatusBadge from '../components/StatusBadge'
import useFetch from '../components/useFetch'
import { money, shortDate, titleCase } from '../utils/format'

const statuses = ['', 'DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'PAUSED', 'CLOSED']

export default function Subscriptions() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const { data, loading } = useFetch('/subscriptions', { status: status || undefined, search: search || undefined, page, size: 10 })

  return (
    <>
      <PageHeader title="Subscriptions" subtitle="Follow every subscription from draft to closed">
        <button className="btn" onClick={() => navigate('/subscriptions/new')}><Plus size={18} /> New subscription</button>
      </PageHeader>
      <div className="toolbar">
        <div className="search">
          <Search size={17} />
          <input placeholder="Search by number or customer" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} />
        </div>
        <div className="chips">
          {statuses.map((s) => (
            <button key={s || 'all'} className={`chip${status === s ? ' on' : ''}`} onClick={() => { setStatus(s); setPage(0) }}>
              {s ? titleCase(s) : 'All'}
            </button>
          ))}
        </div>
      </div>
      <DataTable
        loading={loading}
        rows={data?.items || []}
        onRowClick={(r) => navigate(`/subscriptions/${r.id}`)}
        empty={{ title: 'No subscriptions found', text: 'Create one from a quotation template or from scratch.' }}
        columns={[
          { label: 'Number', key: 'number' },
          { label: 'Customer', key: 'customerName' },
          { label: 'Plan', key: 'planName' },
          { label: 'Starts', render: (r) => shortDate(r.startDate) },
          { label: 'Expires', render: (r) => shortDate(r.expiryDate) },
          { label: 'Recurring', num: true, render: (r) => money(r.recurringAmount) },
          { label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
      {data && <Pagination page={data.page} totalPages={data.totalPages} totalItems={data.totalItems} onChange={setPage} />}
    </>
  )
}
