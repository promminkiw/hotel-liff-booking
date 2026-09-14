// Two date ranges [startA, endA) and [startB, endB) overlap iff each
// starts before the other ends. Dates are 'YYYY-MM-DD' strings, which
// compare correctly with plain string comparison.
export function datesOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB
}
