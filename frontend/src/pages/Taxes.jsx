import CrudPage from '../components/CrudPage'

export default function Taxes() {
  return (
    <CrudPage
      title="Taxes"
      subtitle="Rules applied automatically to subscription lines and invoices"
      endpoint="/taxes"
      addLabel="Add tax"
      blank={{ name: '', rate: '' }}
      columns={[
        { label: 'Name', key: 'name' },
        { label: 'Rate', num: true, render: (r) => `${r.rate}%` },
      ]}
      fields={[
        { name: 'name', label: 'Tax name', required: true },
        { name: 'rate', label: 'Rate (%)', type: 'number', required: true, min: 0 },
      ]}
    />
  )
}
