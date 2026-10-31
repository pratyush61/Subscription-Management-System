import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import client, { errorMessage } from '../api/client'
import PageHeader from '../components/PageHeader'
import useFetch from '../components/useFetch'
import { useToast } from '../context/ToastContext'
import { money, today } from '../utils/format'

const terms = ['Immediate', 'Net 15', 'Net 30', 'Net 45']
const emptyLine = { productId: '', variantId: '', quantity: 1, taxId: '' }

export default function SubscriptionForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const customers = useFetch('/users/customers')
  const plans = useFetch('/plans')
  const products = useFetch('/products')
  const taxes = useFetch('/taxes')
  const discounts = useFetch('/discounts')
  const templates = useFetch('/templates')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    customerId: '', planId: '', templateId: '', startDate: today(), expiryDate: '', paymentTerms: 'Net 15', discountId: '', lines: [{ ...emptyLine }],
  })

  useEffect(() => {
    if (!id) return
    client.get(`/subscriptions/${id}`).then(({ data }) =>
      setForm({
        customerId: data.customerId, planId: data.planId, templateId: '', startDate: data.startDate, expiryDate: data.expiryDate || '',
        paymentTerms: data.paymentTerms || 'Immediate', discountId: data.discountId || '',
        lines: data.lines.map((l) => ({ productId: l.productId, variantId: l.variantId || '', quantity: l.quantity, taxId: l.taxId || '' })),
      }),
    ).catch((err) => toast.error(errorMessage(err)))
  }, [id])

  const productList = products.data || []
  const taxList = taxes.data || []
  const plan = (plans.data || []).find((p) => String(p.id) === String(form.planId))

  const applyTemplate = (templateId) => {
    const template = (templates.data || []).find((t) => String(t.id) === String(templateId))
    if (!template) return setForm({ ...form, templateId: '' })
    setForm({
      ...form,
      templateId,
      planId: template.plan?.id || form.planId,
      lines: template.lines.length ? template.lines.map((l) => ({ productId: l.productId, variantId: '', quantity: l.quantity, taxId: '' })) : form.lines,
    })
  }

  const setLine = (index, patch) => setForm({ ...form, lines: form.lines.map((l, i) => (i === index ? { ...l, ...patch } : l)) })

  const totals = useMemo(() => {
    let subtotal = 0
    let tax = 0
    form.lines.forEach((l) => {
      const product = productList.find((p) => String(p.id) === String(l.productId))
      if (!product) return
      const variant = product.variants.find((v) => String(v.id) === String(l.variantId))
      const amount = (Number(product.salesPrice) + Number(variant?.extraPrice || 0)) * Number(l.quantity || 0)
      const rate = Number(taxList.find((t) => String(t.id) === String(l.taxId))?.rate || 0)
      subtotal += amount
      tax += (amount * rate) / 100
    })
    return { subtotal, tax }
  }, [form.lines, productList, taxList])

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    const payload = {
      customerId: Number(form.customerId),
      planId: Number(form.planId),
      templateId: form.templateId ? Number(form.templateId) : null,
      startDate: form.startDate,
      expiryDate: form.expiryDate || null,
      paymentTerms: form.paymentTerms,
      discountId: form.discountId ? Number(form.discountId) : null,
      lines: form.lines.map((l) => ({
        productId: Number(l.productId),
        variantId: l.variantId ? Number(l.variantId) : null,
        quantity: Number(l.quantity),
        taxId: l.taxId ? Number(l.taxId) : null,
      })),
    }
    try {
      const { data } = id ? await client.put(`/subscriptions/${id}`, payload) : await client.post('/subscriptions', payload)
      toast.success(id ? 'Subscription updated' : `${data.number} created`)
      navigate(`/subscriptions/${data.id}`)
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <PageHeader title={id ? 'Edit subscription' : 'New subscription'} subtitle="Pick a customer and plan, then add what they are buying">
        <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
        <button className="btn" disabled={busy}>{busy ? 'Saving...' : 'Save subscription'}</button>
      </PageHeader>

      <div className="card">
        <h2>Details</h2>
        <div className="form-grid">
          {!id && (
            <div className="full">
              <label htmlFor="template">Start from a quotation template</label>
              <select id="template" value={form.templateId} onChange={(e) => applyTemplate(e.target.value)}>
                <option value="">No template</option>
                {(templates.data || []).map((t) => <option key={t.id} value={t.id}>{t.name} (valid {t.validityDays} days)</option>)}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="customer">Customer</label>
            <select id="customer" required value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
              <option value="">Choose a customer</option>
              {(customers.data || []).map((c) => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="plan">Plan</label>
            <select id="plan" required value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })}>
              <option value="">Choose a plan</option>
              {(plans.data || []).filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {plan && <div className="hint">Minimum quantity {plan.minQuantity}, billed {plan.billingPeriod.toLowerCase()}</div>}
          </div>
          <div><label htmlFor="start">Start date</label><input id="start" type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
          <div><label htmlFor="expiry">Expiry date</label><input id="expiry" type="date" min={form.startDate} value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></div>
          <div>
            <label htmlFor="terms">Payment terms</label>
            <select id="terms" value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}>
              {terms.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="discount">Discount</label>
            <select id="discount" value={form.discountId} onChange={(e) => setForm({ ...form, discountId: e.target.value })}>
              <option value="">None</option>
              {(discounts.data || []).filter((d) => d.active).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Order lines</h2>
        <div className="line-editor">
          {form.lines.map((l, i) => {
            const product = productList.find((p) => String(p.id) === String(l.productId))
            return (
              <div className="line-row" key={i}>
                <select required value={l.productId} onChange={(e) => setLine(i, { productId: e.target.value, variantId: '' })} aria-label="Product">
                  <option value="">Choose a product</option>
                  {productList.map((p) => <option key={p.id} value={p.id}>{p.name} ({money(p.salesPrice)})</option>)}
                </select>
                <select value={l.variantId} disabled={!product?.variants.length} onChange={(e) => setLine(i, { variantId: e.target.value })} aria-label="Variant">
                  <option value="">{product?.variants.length ? 'Base version' : 'No variants'}</option>
                  {product?.variants.map((v) => <option key={v.id} value={v.id}>{v.value} (+{v.extraPrice})</option>)}
                </select>
                <input type="number" min={plan?.minQuantity || 1} required value={l.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} aria-label="Quantity" />
                <select value={l.taxId} onChange={(e) => setLine(i, { taxId: e.target.value })} aria-label="Tax">
                  <option value="">No tax</option>
                  {taxList.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <button type="button" className="icon-btn" aria-label="Remove line" disabled={form.lines.length === 1}
                  onClick={() => setForm({ ...form, lines: form.lines.filter((_, x) => x !== i) })}><Trash2 size={17} /></button>
              </div>
            )
          })}
          <div style={{ padding: 10 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, lines: [...form.lines, { ...emptyLine }] })}><Plus size={16} /> Add line</button>
          </div>
        </div>
        <div className="totals">
          <div><span>Subtotal</span><span>{money(totals.subtotal)}</span></div>
          <div><span>Tax</span><span>{money(totals.tax)}</span></div>
          <div className="grand"><span>Per billing cycle</span><span>{money(totals.subtotal + totals.tax)}</span></div>
        </div>
        <div className="hint" style={{ textAlign: 'right' }}>Discounts are applied on the invoice.</div>
      </div>
    </form>
  )
}
