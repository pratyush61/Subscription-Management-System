import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import client, { errorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import DataTable from './DataTable'
import Modal from './Modal'
import PageHeader from './PageHeader'
import useFetch from './useFetch'

function Field({ field, form, setForm }) {
  const value = form[field.name] ?? ''
  const update = (next) => setForm({ ...form, [field.name]: next })

  if (field.type === 'custom') return field.render(form, setForm)
  if (field.type === 'checkbox') {
    return (
      <label className="check full">
        <input type="checkbox" checked={!!form[field.name]} onChange={(e) => update(e.target.checked)} /> {field.label}
      </label>
    )
  }
  return (
    <div className={field.full ? 'full' : ''}>
      <label htmlFor={field.name}>{field.label}</label>
      {field.type === 'select' ? (
        <select id={field.name} value={value} required={field.required} onChange={(e) => update(e.target.value)}>
          <option value="">{field.placeholder || 'Choose'}</option>
          {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea id={field.name} value={value} onChange={(e) => update(e.target.value)} />
      ) : (
        <input id={field.name} type={field.type || 'text'} step={field.type === 'number' ? '0.01' : undefined}
          min={field.min} required={field.required} value={value} onChange={(e) => update(e.target.value)} />
      )}
      {field.hint && <div className="hint">{field.hint}</div>}
    </div>
  )
}

export default function CrudPage({ title, subtitle, endpoint, columns, fields, blank, toPayload, fromRow, canEditOverride, addLabel }) {
  const { isAdmin } = useAuth()
  const toast = useToast()
  const { data, loading, reload } = useFetch(endpoint)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [busy, setBusy] = useState(false)
  const canEdit = canEditOverride ?? isAdmin

  const openNew = () => {
    setForm(blank)
    setEditing({})
  }

  const openEdit = (row) => {
    setForm(fromRow ? fromRow(row) : row)
    setEditing(row)
  }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const payload = toPayload ? toPayload(form) : form
      if (editing.id) await client.put(`${endpoint}/${editing.id}`, payload)
      else await client.post(endpoint, payload)
      toast.success(editing.id ? 'Changes saved' : 'Created')
      setEditing(null)
      reload()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (row) => {
    if (!window.confirm('Delete this record? This cannot be undone.')) return
    try {
      await client.delete(`${endpoint}/${row.id}`)
      toast.success('Deleted')
      reload()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  const tableColumns = canEdit
    ? [...columns, {
        label: '',
        render: (row) => (
          <div className="row-actions">
            <button className="icon-btn" aria-label="Edit" onClick={() => openEdit(row)}><Pencil size={17} /></button>
            <button className="icon-btn" aria-label="Delete" onClick={() => remove(row)}><Trash2 size={17} /></button>
          </div>
        ),
      }]
    : columns

  return (
    <>
      <PageHeader title={title} subtitle={subtitle}>
        {canEdit && <button className="btn" onClick={openNew}><Plus size={18} /> {addLabel || 'Add new'}</button>}
      </PageHeader>
      <DataTable columns={tableColumns} rows={data || []} loading={loading} />
      {editing && (
        <Modal title={editing.id ? `Edit ${title.toLowerCase()}` : addLabel || 'Add new'} onClose={() => setEditing(null)}>
          <form onSubmit={save}>
            <div className="form-grid">
              {fields.map((f) => <Field key={f.name} field={f} form={form} setForm={setForm} />)}
            </div>
            <div className="modal-foot" style={{ padding: '22px 0 0' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
