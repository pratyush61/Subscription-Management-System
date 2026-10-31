import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Play } from 'lucide-react'
import client, { errorMessage } from '../api/client'
import DataTable from '../components/DataTable'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import useFetch from '../components/useFetch'
import { useToast } from '../context/ToastContext'
import { money, shortDate } from '../utils/format'

export default function Dashboard() {
  const navigate = useNavigate()
  const toast = useToast()
  const summary = useFetch('/reports/summary')
  const overdue = useFetch('/invoices', { overdue: true, size: 6 })
  const [running, setRunning] = useState(false)
  const s = summary.data

  const runBilling = async () => {
    setRunning(true)
    try {
      const { data } = await client.post('/billing/run')
      toast.success(`${data.invoicesCreated} invoices created, ${data.subscriptionsClosed} subscriptions closed`)
      summary.reload()
      overdue.reload()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setRunning(false)
    }
  }

  const stats = [
    { label: 'Active subscriptions', value: s?.activeSubscriptions },
    { label: 'Monthly recurring revenue', value: s && money(s.monthlyRecurringRevenue) },
    { label: 'Revenue collected', value: s && money(s.revenueCollected) },
    { label: 'Still owed', value: s && money(s.outstanding), tone: 'warn' },
    { label: `Overdue invoices${s ? ` (${money(s.overdueAmount)})` : ''}`, value: s?.overdueInvoices, tone: s?.overdueInvoices ? 'alert' : '' },
  ]

  return (
    <>
      <PageHeader title="Revenue overview" subtitle="Where subscriptions, payments and overdue invoices stand today">
        <button className="btn" onClick={runBilling} disabled={running}><Play size={17} /> {running ? 'Billing...' : 'Run billing now'}</button>
      </PageHeader>

      <div className="stat-grid">
        {stats.map((st) => (
          <div key={st.label} className={`stat ${st.tone || ''}`}>
            <span>{st.label}</span>
            {st.value === undefined ? <div className="skeleton" style={{ height: 28, marginTop: 10 }} /> : <strong>{st.value}</strong>}
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Payments received, last six months</h2>
          <div style={{ height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={s?.monthly || []} margin={{ left: 8, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3ebe8" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={60} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
                <Tooltip formatter={(v) => money(v)} cursor={{ fill: '#eef5f3' }} />
                <Bar dataKey="amount" fill="#0e7c6b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h2>Chase these first</h2>
          <DataTable
            loading={overdue.loading}
            rows={overdue.data?.items || []}
            onRowClick={(r) => navigate(`/invoices/${r.id}`)}
            empty={{ title: 'No overdue invoices', text: 'Everything due so far has been paid or is still within terms.' }}
            columns={[
              { label: 'Invoice', key: 'number' },
              { label: 'Customer', key: 'customerName' },
              { label: 'Due', render: (r) => shortDate(r.dueDate) },
              { label: 'Status', render: (r) => <StatusBadge status={r.status} overdue={r.overdue} /> },
            ]}
          />
        </div>
      </div>
    </>
  )
}
