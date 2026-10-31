import { useState } from 'react'
import { Link } from 'react-router-dom'
import client, { errorMessage } from '../../api/client'
import AuthShell from './AuthShell'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { data } = await client.post('/auth/forgot-password', { email })
      setMessage(data.message)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell>
      <h2>Reset your password</h2>
      <p>Enter your registered email and we will send you a reset link.</p>
      {message ? (
        <div className="demo-box">{message}</div>
      ) : (
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <div className="error-text">{error}</div>}
          </div>
          <button className="btn" disabled={busy}>{busy ? 'Sending...' : 'Send reset link'}</button>
        </form>
      )}
      <div className="auth-links"><Link to="/login">Back to sign in</Link></div>
    </AuthShell>
  )
}
