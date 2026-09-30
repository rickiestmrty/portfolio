// Demo data for the At Capacity ad manager.
// `days` runs from today forward: [booked, capacity] per day. Hard-coded so the demo looks the same on every visit.

export const adModes = {
  'always-on': 'Always on',
  'always-off': 'Always off',
  capacity: '90% of capacity',
}

// Ads in `capacity` mode pause once bookings reach this share of capacity.
export const PAUSE_AT = 0.9

export const services = [
  {
    id: 'hvac',
    name: 'HVAC',
    ads: 'capacity',
    availabilityHours: 4,
    jobHours: 2,
    days: [[10, 10], [9, 10], [8, 10], [9, 10], [7, 10], [0, 0], [4, 8]],
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    ads: 'always-on',
    availabilityHours: 2,
    jobHours: 1,
    days: [[5, 8], [7, 8], [8, 8], [4, 8], [6, 8], [2, 4], [3, 8]],
  },
  {
    id: 'car-detailing',
    name: 'Car Detailing',
    ads: 'always-off',
    availabilityHours: 1,
    jobHours: 1,
    days: [[2, 6], [1, 6], [3, 6], [0, 6], [4, 6], [5, 6], [1, 6]],
  },
]

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

// Why ads are paused for a service on a given day, or null if they are running.
export function pauseReason(service, booked, capacity) {
  if (service.ads === 'always-off') return `Ads are turned off for ${service.name}.`
  if (capacity === 0) return 'No capacity is scheduled for this day.'
  if (booked >= capacity) return `Fully booked: ${booked} of ${capacity} jobs are taken.`

  const pct = Math.round((booked / capacity) * 100)
  if (service.ads === 'capacity' && booked / capacity >= PAUSE_AT) {
    return `${pct}% booked. Ads pause once bookings reach ${PAUSE_AT * 100}% of capacity.`
  }

  const openHours = (capacity - booked) * service.jobHours
  if (openHours < service.availabilityHours) {
    return `Only ${plural(openHours, 'open hour')} left. Ads need a ${service.availabilityHours}-hour window to take a new job.`
  }
  return null
}

// Illustrative endpoints shown by the "Show the API" toggle. Not the production routes.
export const endpoints = (id) => ({
  settings: `/services/${id}/ad-settings`,
  utilization: `/services/${id}/utilization?days=7`,
  capacity: `/services/${id}/capacity?days=7`,
  pauseReasons: `/services/${id}/pause-reasons`,
})

// Google Ads sync. A background service runs it on a timer; the button runs it on demand.
export const sync = {
  everyMinutes: 15,
  lastSyncedMinutesAgo: 4,
  status: '/sync/google-ads/status',
  run: '/sync/google-ads',
}
