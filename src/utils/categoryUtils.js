// Single source of truth for the three work categories.
// Categories are derived from an entry's shape, not stored as a field:
//   childcare  -> entry.type === 'childcare'
//   frilans    -> entry.type === 'job' && entry.job_label === 'Frilans'
//   invoicery  -> entry.type === 'job' && entry.job_label === 'Invoicery'

export const CATEGORIES = [
  { key: 'invoicery', label: 'Invoicery' },
  { key: 'frilans', label: 'Frilans' },
  { key: 'childcare', label: 'Childcare' },
]

export function entryCategory(entry) {
  if (entry.type === 'childcare') return 'childcare'
  if (entry.job_label === 'Frilans') return 'frilans'
  if (entry.job_label === 'Invoicery') return 'invoicery'
  return null
}

export function matchesFilter(entry, filter) {
  return filter === 'all' || entryCategory(entry) === filter
}
