export const fmtOdds = (n) => (n < 10 ? n.toFixed(2) : n.toFixed(1))

export const dollars = (n) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
