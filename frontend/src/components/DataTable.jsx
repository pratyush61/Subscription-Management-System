export default function DataTable({ columns, rows, loading, onRowClick, empty }) {
  if (loading) {
    return (
      <div className="table-wrap" style={{ padding: 20 }}>
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ margin: '16px 0', width: `${90 - i * 8}%` }} />)}
      </div>
    )
  }
  if (!rows.length) {
    return (
      <div className="table-wrap">
        <div className="empty">
          <h3>{empty?.title || 'Nothing here yet'}</h3>
          <p>{empty?.text || 'Records you add will show up in this list.'}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map((c) => <th key={c.label} className={c.num ? 'num' : ''}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={onRowClick ? 'clickable' : ''} onClick={() => onRowClick?.(row)}>
              {columns.map((c) => (
                <td key={c.label} className={c.num ? 'num' : ''}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
