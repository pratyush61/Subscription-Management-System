export default function AuthShell({ children }) {
  return (
    <div className="auth-page">
      <section className="auth-aside">
        <div className="brand" style={{ padding: 0 }}><span className="brand-mark" /> Brightloop</div>
        <div>
          <h1>Every renewal billed, every payment matched.</h1>
          <p>Plans, subscriptions, invoices and revenue in one place, so billing day stops being a spreadsheet exercise.</p>
        </div>
        <span style={{ fontSize: 13, color: '#7f9a94' }}>Subscription billing for Brightloop Software</span>
      </section>
      <section className="auth-form-side">
        <div className="auth-card">{children}</div>
      </section>
    </div>
  )
}
