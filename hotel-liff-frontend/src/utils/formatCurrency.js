const thbFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  maximumFractionDigits: 0,
})

export function formatCurrency(amount) {
  return thbFormatter.format(amount)
}
