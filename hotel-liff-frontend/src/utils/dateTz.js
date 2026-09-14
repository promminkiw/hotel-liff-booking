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
