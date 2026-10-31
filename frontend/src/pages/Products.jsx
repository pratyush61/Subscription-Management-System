import { Plus, Trash2 } from 'lucide-react'
import CrudPage from '../components/CrudPage'
import { money } from '../utils/format'

function VariantEditor(form, setForm) {
  const variants = form.variants || []
  const change = (index, key, value) =>
    setForm({ ...form, variants: variants.map((v, i) => (i === index ? { ...v, [key]: value } : v)) })

  return (
    <div className="full" key="variants">
      <label>Variants</label>
      <div className="hint" style={{ marginBottom: 8 }}>For example, Brand: Odoo adds 560 to the sales price.</div>
      <div className="line-editor">
        {variants.map((v, i) => (
          <div className="line-row variant" key={i}>
            <input placeholder="Attribute (Brand)" value={v.attribute} onChange={(e) => change(i, 'attribute', e.target.value)} required />
            <input placeholder="Value (Odoo)" value={v.value} onChange={(e) => change(i, 'value', e.target.value)} required />
            <input type="number" step="0.01" placeholder="Extra price" value={v.extraPrice} onChange={(e) => change(i, 'extraPrice', e.target.value)} />
            <button type="button" className="icon-btn" aria-label="Remove variant" onClick={() => setForm({ ...form, variants: variants.filter((_, x) => x !== i) })}><Trash2 size={17} /></button>
          </div>
        ))}
        <div style={{ padding: 10 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, variants: [...variants, { attribute: '', value: '', extraPrice: 0 }] })}>
            <Plus size={16} /> Add variant
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Products() {
  return (
    <CrudPage
      title="Products"
      subtitle="What Brightloop sells, with variants and price adjustments"
      endpoint="/products"
      addLabel="Add product"
      blank={{ name: '', type: '', salesPrice: '', costPrice: '', notes: '', variants: [] }}
      toPayload={(f) => ({
        ...f,
        salesPrice: Number(f.salesPrice),
        costPrice: Number(f.costPrice || 0),
        variants: (f.variants || []).map((v) => ({ attribute: v.attribute, value: v.value, extraPrice: Number(v.extraPrice || 0) })),
      })}
      columns={[
        { label: 'Product', key: 'name' },
        { label: 'Type', key: 'type' },
        { label: 'Sales price', num: true, render: (r) => money(r.salesPrice) },
        { label: 'Cost price', num: true, render: (r) => money(r.costPrice) },
        { label: 'Variants', render: (r) => r.variants.map((v) => `${v.value} (+${v.extraPrice})`).join(', ') || 'None' },
      ]}
      fields={[
        { name: 'name', label: 'Product name', required: true },
        { name: 'type', label: 'Type', required: true, hint: 'Software, Add-on, Service' },
        { name: 'salesPrice', label: 'Sales price', type: 'number', required: true, min: 0 },
        { name: 'costPrice', label: 'Cost price', type: 'number', min: 0 },
        { name: 'notes', label: 'Notes', type: 'textarea', full: true },
        { name: 'variants', type: 'custom', render: VariantEditor },
      ]}
    />
  )
}
