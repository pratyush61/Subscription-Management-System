import { Plus, Trash2 } from 'lucide-react'
import CrudPage from '../components/CrudPage'
import useFetch from '../components/useFetch'
import { titleCase } from '../utils/format'

export default function Templates() {
  const { data: plans } = useFetch('/plans')
  const { data: products } = useFetch('/products')

  const LineEditor = (form, setForm) => {
    const lines = form.lines || []
    const change = (index, key, value) => setForm({ ...form, lines: lines.map((l, i) => (i === index ? { ...l, [key]: value } : l)) })
    return (
      <div className="full" key="lines">
        <label>Product lines</label>
        <div className="line-editor">
          {lines.map((l, i) => (
            <div className="line-row simple" key={i}>
              <select value={l.productId || ''} required onChange={(e) => change(i, 'productId', e.target.value)}>
                <option value="">Choose a product</option>
                {(products || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="number" min="1" value={l.quantity} onChange={(e) => change(i, 'quantity', e.target.value)} />
              <button type="button" className="icon-btn" aria-label="Remove line" onClick={() => setForm({ ...form, lines: lines.filter((_, x) => x !== i) })}><Trash2 size={17} /></button>
            </div>
          ))}
          <div style={{ padding: 10 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, lines: [...lines, { productId: '', quantity: 1 }] })}>
              <Plus size={16} /> Add line
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <CrudPage
      title="Quotation templates"
      subtitle="Start a quotation from a ready plan and product mix"
      endpoint="/templates"
      addLabel="Add template"
      blank={{ name: '', validityDays: 30, planId: '', lines: [{ productId: '', quantity: 1 }] }}
      fromRow={(r) => ({ name: r.name, validityDays: r.validityDays, planId: r.plan?.id || '', lines: r.lines })}
      toPayload={(f) => ({
        name: f.name,
        validityDays: Number(f.validityDays),
        plan: f.planId ? { id: Number(f.planId) } : null,
        lines: (f.lines || []).map((l) => ({ productId: Number(l.productId), quantity: Number(l.quantity) })),
      })}
      columns={[
        { label: 'Template', key: 'name' },
        { label: 'Plan', render: (r) => r.plan ? `${r.plan.name} (${titleCase(r.plan.billingPeriod)})` : '-' },
        { label: 'Valid for', render: (r) => `${r.validityDays} days` },
        { label: 'Lines', num: true, render: (r) => r.lines.length },
      ]}
      fields={[
        { name: 'name', label: 'Template name', required: true, full: true },
        { name: 'planId', label: 'Plan', type: 'select', required: true, options: (plans || []).map((p) => ({ value: p.id, label: p.name })) },
        { name: 'validityDays', label: 'Quotation validity (days)', type: 'number', min: 1, required: true },
        { name: 'lines', type: 'custom', render: LineEditor },
      ]}
    />
  )
}
