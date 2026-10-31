import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { errorMessage } from '../../api/client'
import AuthShell from './AuthShell'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'CUSTOMER' ? '/portal' : '/')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const fill = (email, password) => setForm({ email, password })

  return (
    <AuthShell>
      <h2>Welcome back</h2>
      <p>Sign in to manage subscriptions and invoices.</p>
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <div className="error-text">{error}</div>}
        </div>
        <button className="btn" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
      </form>
      <div className="auth-links">
        <Link to="/forgot-password">Forgot password?</Link>
        <Link to="/register">Create an account</Link>
      </div>
      <div className="demo-box">
        Try a demo account:{' '}
        <a href="#admin" onClick={(e) => { e.preventDefault(); fill('admin@brightloop.com', 'Admin@12345') }}>admin</a>,{' '}
        <a href="#staff" onClick={(e) => { e.preventDefault(); fill('staff@brightloop.com', 'Staff@12345') }}>staff</a>,{' '}
        <a href="#staff" onClick={(e) => { e.preventDefault(); fill('rishabh@brightloop.com', 'rishabh@123') }}>Rishabh</a>,{' '}
        <a href="#staff" onClick={(e) => { e.preventDefault(); fill('pratyush@brightloop.com', 'pratyush@123') }}>Pratyush</a>,{' '}
        <a href="#staff" onClick={(e) => { e.preventDefault(); fill('kratika@brightloop.com', 'kratika@123') }}>Kratika</a>,{' '}
        <a href="#customer" onClick={(e) => { e.preventDefault(); fill('naina@brightloop.com', 'naina@123') }}>Naina</a>
      </div>
    </AuthShell>
  )
}
