import { useState } from 'react'
import DataTable from '../components/DataTable'
import PageHeader from '../components/PageHeader'
import Pagination from '../components/Pagination'
import useFetch from '../components/useFetch'
import { money, shortDate, titleCase } from '../utils/format'

export default function Payments() {
  const [page, setPage] = useState(0)
  const { data, loading } = useFetch('/payments', { page, size: 10 })

  return (
    <>
      <PageHeader title="Payments" subtitle="Every payment recorded against an invoice" />
      <DataTable
        loading={loading}
        rows={data?.items || []}
        empty={{ title: 'No payments yet', text: 'Record a payment from a confirmed invoice.' }}
        columns={[
          { label: 'Date', render: (r) => shortDate(r.paymentDate) },
          { label: 'Invoice', key: 'invoiceNumber' },
          { label: 'Customer', key: 'customerName' },
          { label: 'Method', render: (r) => titleCase(r.method) },
          { label: 'Note', render: (r) => r.note || '-' },
          { label: 'Amount', num: true, render: (r) => money(r.amount) },
        ]}
      />
      {data && <Pagination page={data.page} totalPages={data.totalPages} totalItems={data.totalItems} onChange={setPage} />}
    </>
  )
}
