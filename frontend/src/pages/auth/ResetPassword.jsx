import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import client, { errorMessage } from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { passwordChecks } from '../../utils/format'
import AuthShell from './AuthShell'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const checks = passwordChecks(password)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { data } = await client.post('/auth/reset-password', { token: params.get('token'), password })
      toast.success(data.message)
      navigate('/login')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell>
      <h2>Choose a new password</h2>
      <p>Pick something you have not used here before.</p>
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="password">New password</label>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <ul className="rules">
            {checks.map((c) => <li key={c.label} className={c.ok ? 'ok' : ''}>{c.ok ? 'Done: ' : ''}{c.label}</li>)}
          </ul>
          {error && <div className="error-text">{error}</div>}
        </div>
        <button className="btn" disabled={busy || !checks.every((c) => c.ok)}>{busy ? 'Saving...' : 'Update password'}</button>
      </form>
      <div className="auth-links"><Link to="/login">Back to sign in</Link></div>
    </AuthShell>
  )
}
