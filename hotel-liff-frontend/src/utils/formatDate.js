const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

export function formatDate(dateStr) {
  // dateStr is a plain 'YYYY-MM-DD' - parse as UTC so the displayed day
  // never shifts backward/forward due to the browser's local timezone.
  const [y, m, d] = dateStr.split('-').map(Number)
  return thaiDateFormatter.format(new Date(Date.UTC(y, m - 1, d)))
}
