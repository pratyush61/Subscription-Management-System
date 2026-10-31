import StatusBadge from './StatusBadge'
import { money, shortDate, titleCase } from '../utils/format'

export default function InvoiceSheet({ invoice }) {
  return (
    <div className="card">
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, marginBottom: 4 }}>{invoice.number}</h2>
          <p className="meta" style={{ margin: 0 }}>Subscription {invoice.subscriptionNumber}</p>
        </div>
        <StatusBadge status={invoice.status} overdue={invoice.overdue} />
      </div>
      <dl className="detail-grid">
        <div><dt>Billed to</dt><dd>{invoice.customerName}<br /><span style={{ fontWeight: 400 }}>{invoice.customerEmail}</span></dd></div>
        <div><dt>Invoice date</dt><dd>{shortDate(invoice.invoiceDate)}</dd></div>
        <div><dt>Due date</dt><dd>{shortDate(invoice.dueDate)}</dd></div>
        <div><dt>Billing period</dt><dd>{shortDate(invoice.periodStart)} to {shortDate(invoice.periodEnd)}</dd></div>
      </dl>

      <div className="table-wrap" style={{ marginTop: 22 }}>
        <table>
          <thead>
            <tr><th>Item</th><th className="num">Qty</th><th className="num">Unit price</th><th className="num">Tax</th><th className="num">Amount</th></tr>
          </thead>
          <tbody>
            {invoice.lines.map((l, i) => (
              <tr key={i}>
                <td>{l.description}</td>
                <td className="num">{l.quantity}</td>
                <td className="num">{money(l.unitPrice)}</td>
                <td className="num">{l.taxRate}%</td>
                <td className="num">{money(l.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="totals">
        <div><span>Subtotal</span><span>{money(invoice.subtotal)}</span></div>
        {invoice.discountAmount > 0 && <div><span>Discount ({invoice.discountLabel})</span><span>-{money(invoice.discountAmount)}</span></div>}
        <div><span>Tax</span><span>{money(invoice.taxAmount)}</span></div>
        <div className="grand"><span>Total</span><span>{money(invoice.total)}</span></div>
        <div><span>Paid</span><span>{money(invoice.amountPaid)}</span></div>
        <div style={{ fontWeight: 700 }}><span>Balance due</span><span>{money(invoice.balance)}</span></div>
      </div>

      {invoice.payments.length > 0 && (
        <>
          <h2 style={{ marginTop: 26 }}>Payments</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Method</th><th>Note</th><th className="num">Amount</th></tr></thead>
              <tbody>
                {invoice.payments.map((p) => (
                  <tr key={p.id}>
                    <td>{shortDate(p.paymentDate)}</td>
                    <td>{titleCase(p.method)}</td>
                    <td className="wrap">{p.note || '-'}</td>
                    <td className="num">{money(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
