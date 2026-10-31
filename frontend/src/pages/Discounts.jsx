import CrudPage from '../components/CrudPage'
import StatusBadge from '../components/StatusBadge'
import useFetch from '../components/useFetch'
import { money, shortDate, titleCase } from '../utils/format'

const num = (v) => (v === '' || v == null ? null : Number(v))

export default function Discounts() {
  const { data: products } = useFetch('/products')

  return (
    <CrudPage
      title="Discounts"
      subtitle="Rules that show up on invoices automatically while they are valid"
      endpoint="/discounts"
      addLabel="Add discount"
      blank={{ name: '', type: 'PERCENTAGE', value: '', target: 'SUBSCRIPTION', productId: '', minPurchase: '', minQuantity: '', startDate: '', endDate: '', usageLimit: '', active: true }}
      fromRow={(r) => ({ ...r, productId: r.product?.id || '', minPurchase: r.minPurchase ?? '', minQuantity: r.minQuantity ?? '', usageLimit: r.usageLimit ?? '' })}
      toPayload={(f) => ({
        name: f.name,
        type: f.type,
        value: Number(f.value),
        target: f.target,
        product: f.target === 'PRODUCT' && f.productId ? { id: Number(f.productId) } : null,
        minPurchase: num(f.minPurchase),
        minQuantity: num(f.minQuantity),
        startDate: f.startDate || null,
        endDate: f.endDate || null,
        usageLimit: num(f.usageLimit),
        active: f.active,
      })}
      columns={[
        { label: 'Discount', key: 'name' },
        { label: 'Value', num: true, render: (r) => (r.type === 'PERCENTAGE' ? `${r.value}%` : money(r.value)) },
        { label: 'Applies to', render: (r) => (r.target === 'PRODUCT' ? r.product?.name || 'Product' : 'Whole subscription') },
        { label: 'Needs', render: (r) => [r.minPurchase && `min ${money(r.minPurchase)}`, r.minQuantity && `qty ${r.minQuantity}+`].filter(Boolean).join(', ') || 'Nothing' },
        { label: 'Valid', render: (r) => `${shortDate(r.startDate)} to ${r.endDate ? shortDate(r.endDate) : 'open'}` },
        { label: 'Used', num: true, render: (r) => `${r.usedCount}${r.usageLimit ? ` / ${r.usageLimit}` : ''}` },
        { label: 'Status', render: (r) => <StatusBadge status={r.active ? 'ACTIVE' : 'CLOSED'} /> },
      ]}
      fields={[
        { name: 'name', label: 'Discount name', required: true, full: true },
        { name: 'type', label: 'Type', type: 'select', required: true, options: ['PERCENTAGE', 'FIXED'].map((v) => ({ value: v, label: titleCase(v) })) },
        { name: 'value', label: 'Value', type: 'number', required: true, min: 0 },
        { name: 'target', label: 'Applies to', type: 'select', required: true, options: [{ value: 'SUBSCRIPTION', label: 'Whole subscription' }, { value: 'PRODUCT', label: 'Specific product' }] },
        { name: 'productId', label: 'Product', type: 'select', placeholder: 'Only for product discounts', options: (products || []).map((p) => ({ value: p.id, label: p.name })) },
        { name: 'minPurchase', label: 'Minimum purchase', type: 'number', min: 0 },
        { name: 'minQuantity', label: 'Minimum quantity', type: 'number', min: 0 },
        { name: 'startDate', label: 'Starts on', type: 'date' },
        { name: 'endDate', label: 'Ends on', type: 'date' },
        { name: 'usageLimit', label: 'Usage limit', type: 'number', min: 1, hint: 'Leave empty for unlimited' },
        { name: 'active', label: 'Discount is active', type: 'checkbox' },
      ]}
    />
  )
}
