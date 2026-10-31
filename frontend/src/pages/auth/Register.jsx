import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { errorMessage } from '../../api/client'
import { passwordChecks } from '../../utils/format'
import AuthShell from './AuthShell'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const checks = passwordChecks(form.password)
  const strong = checks.every((c) => c.ok)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await register(form.name, form.email, form.password)
      navigate('/portal')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell>
      <h2>Create your account</h2>
      <p>Manage your subscriptions and invoices in one place.</p>
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="name">Name or company</label>
          <input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <ul className="rules">
            {checks.map((c) => <li key={c.label} className={c.ok ? 'ok' : ''}>{c.ok ? 'Done: ' : ''}{c.label}</li>)}
          </ul>
          {error && <div className="error-text">{error}</div>}
        </div>
        <button className="btn" disabled={busy || !strong}>{busy ? 'Creating...' : 'Create account'}</button>
      </form>
      <div className="auth-links">
        <span>Already registered?</span>
        <Link to="/login">Sign in</Link>
      </div>
    </AuthShell>
  )
}
