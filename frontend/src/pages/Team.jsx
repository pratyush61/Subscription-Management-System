import { useState } from 'react'
import { Plus } from 'lucide-react'
import client, { errorMessage } from '../api/client'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import useFetch from '../components/useFetch'
import { useToast } from '../context/ToastContext'
import { passwordChecks, titleCase } from '../utils/format'

export default function Team() {
  const toast = useToast()
  const { data, loading, reload } = useFetch('/users/team')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const checks = passwordChecks(form.password)

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await client.post('/users/staff', form)
      toast.success('Staff member added')
      setOpen(false)
      setForm({ name: '', email: '', password: '' })
      reload()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Team" subtitle="Admins and staff who run billing day to day">
        <button className="btn" onClick={() => setOpen(true)}><Plus size={18} /> Add staff member</button>
      </PageHeader>
      <DataTable
        loading={loading}
        rows={data || []}
        columns={[
          { label: 'Name', key: 'name' },
          { label: 'Email', key: 'email' },
          { label: 'Role', render: (r) => <span className="badge">{titleCase(r.role)}</span> },
        ]}
      />
      {open && (
        <Modal title="Add staff member" onClose={() => setOpen(false)}>
          <form onSubmit={save}>
            <div className="form-grid">
              <div className="full"><label htmlFor="n">Name</label><input id="n" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="full"><label htmlFor="e">Email</label><input id="e" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="full">
                <label htmlFor="p">Temporary password</label>
                <input id="p" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <ul className="rules">{checks.map((c) => <li key={c.label} className={c.ok ? 'ok' : ''}>{c.label}</li>)}</ul>
              </div>
            </div>
            <div className="modal-foot" style={{ padding: '22px 0 0' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn" disabled={busy || !checks.every((c) => c.ok)}>{busy ? 'Adding...' : 'Add staff member'}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
