const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })

export const money = (value) => currency.format(Number(value || 0))

export const shortDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

export const titleCase = (value) =>
  value ? value.toLowerCase().replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) : ''

export const today = () => new Date().toISOString().slice(0, 10)

export const passwordChecks = (password) => [
  { label: 'More than 8 characters', ok: password.length > 8 },
  { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
  { label: 'One lowercase letter', ok: /[a-z]/.test(password) },
  { label: 'One special character', ok: /[^A-Za-z0-9]/.test(password) },
]
