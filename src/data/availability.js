import { parseIso } from '../utils/dates.js'

// The single place the start date lives. The dashboard, the Hire me page and the page descriptions read it.
export const availableFrom = '2026-11-12'

export const availableFromLabel = parseIso(availableFrom).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
