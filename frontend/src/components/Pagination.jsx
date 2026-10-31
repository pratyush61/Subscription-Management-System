import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, totalItems, onChange }) {
  if (!totalItems) return null
  return (
    <div className="pagination">
      <span>{totalItems} records, page {page + 1} of {Math.max(totalPages, 1)}</span>
      <div className="actions">
        <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => onChange(page - 1)}>
          <ChevronLeft size={16} /> Previous
        </button>
        <button className="btn btn-ghost btn-sm" disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)}>
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
