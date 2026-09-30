const DAY_MS = 24 * 60 * 60 * 1000

export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

// Whole days from a to b. Rounded so DST shifts don't produce fractions.
export const dayDiff = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / DAY_MS)

export const isSameDay = (a, b) => dayDiff(a, b) === 0

// 'yyyy-mm-dd' as a local date. new Date(iso) would parse it as UTC.
export const parseIso = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// 'Jul 2023 – Present' for a project's start/end. since: 'Since Jun 2026' instead, for ongoing work.
export const formatRange = (start, end, since = false) => {
  const fmt = (iso) => parseIso(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  if (!end && since) return `Since ${fmt(start)}`
  return `${fmt(start)} – ${end ? fmt(end) : 'Present'}`
}
