const TIMEZONE = 'Asia/Bangkok'

const bangkokFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function todayInBangkok() {
  return bangkokFormatter.format(new Date())
}

// Shift a 'YYYY-MM' month string by `delta` months (can be negative).
export function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1 + delta, 1))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

