import CrudPage from '../components/CrudPage'
import StatusBadge from '../components/StatusBadge'
import { money, shortDate, titleCase } from '../utils/format'

const periods = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].map((p) => ({ value: p, label: titleCase(p) }))

export default function Plans() {
  return (
    <CrudPage
      title="Plans"
      subtitle="Pricing, billing cycle and what customers can do with each plan"
      endpoint="/plans"
      addLabel="Add plan"
      blank={{ name: '', price: '', billingPeriod: 'MONTHLY', minQuantity: 1, startDate: '', endDate: '', autoClose: false, closable: true, pausable: true, renewable: true, active: true }}
      toPayload={(f) => ({ ...f, price: Number(f.price), minQuantity: Number(f.minQuantity), startDate: f.startDate || null, endDate: f.endDate || null })}
      columns={[
        { label: 'Plan', key: 'name' },
        { label: 'Price', num: true, render: (r) => money(r.price) },
        { label: 'Billing', render: (r) => titleCase(r.billingPeriod) },
        { label: 'Min qty', num: true, key: 'minQuantity' },
        { label: 'Available', render: (r) => `${shortDate(r.startDate)} to ${r.endDate ? shortDate(r.endDate) : 'open'}` },
        { label: 'Rules', render: (r) => [r.autoClose && 'Auto-close', r.closable && 'Closable', r.pausable && 'Pausable', r.renewable && 'Renewable'].filter(Boolean).join(', ') || 'None' },
        { label: 'Status', render: (r) => <StatusBadge status={r.active ? 'ACTIVE' : 'CLOSED'} /> },
      ]}
      fields={[
        { name: 'name', label: 'Plan name', required: true, full: true },
        { name: 'price', label: 'Price', type: 'number', required: true, min: 0 },
        { name: 'billingPeriod', label: 'Billing period', type: 'select', options: periods, required: true },
        { name: 'minQuantity', label: 'Minimum quantity', type: 'number', min: 1, required: true },
        { name: 'startDate', label: 'Available from', type: 'date' },
        { name: 'endDate', label: 'Available until', type: 'date' },
        { name: 'autoClose', label: 'Close automatically when the subscription ends', type: 'checkbox' },
        { name: 'closable', label: 'Customers can close it early', type: 'checkbox' },
        { name: 'pausable', label: 'Subscriptions can be paused', type: 'checkbox' },
        { name: 'renewable', label: 'Subscriptions can be renewed', type: 'checkbox' },
        { name: 'active', label: 'Plan is open for new subscriptions', type: 'checkbox' },
      ]}
    />
  )
}
