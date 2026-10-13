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

// "What I shipped" timeline under the demo. Ordered by impact, unreleased work last.
// start/end: 'yyyy-mm', both months included. status: tag for work not released yet.
// highlights: short chips, not sentences. result: the one line that says what changed.
export const shipped = {
  from: '2025-11',
  to: '2026-10',
  commits: '~1,000 commits',
  items: [
    {
      id: 'onboarding',
      name: 'Onboarding wizard',
      title: 'Onboarding wizard + Google Drive',
      start: '2025-12',
      end: '2026-02',
      result: '15+ accounts onboarded. Client files are stored securely in the company’s Google Drive.',
      highlights: ['Multi-member team setup', 'Proceed with fields pending', 'Per-account Drive folders', 'Rollback on error', 'Multi-file document upload'],
      tech: ['Vue.js', 'Vuetify', 'ASP.NET Core', 'Google Drive'],
    },
    {
      id: 'reputation',
      name: 'Reputation',
      title: 'Reputation + multi-location Google Business Profile',
      start: '2026-01',
      end: '2026-10',
      result: 'Customers with several locations can compare how each branch performs on customer service.',
      highlights: ['Review graph', 'Combined profiles', 'Per-location star ratings', 'Failed-location handling'],
      tech: ['Vue.js', 'Vuetify', 'ASP.NET Core', 'Google Business Profile'],
    },
    {
      id: 'notifications',
      name: 'Notification center',
      title: 'Global notification center',
      start: '2025-11',
      end: '2025-12',
      result: 'Errors show up in the app, so the team no longer digs through deployment logs to find them.',
      highlights: ['SignalR delivery', 'Worker-to-API path', 'Reconnection handling', 'Account-switch fixes', 'Agency previews'],
      tech: ['Vue.js', 'Vuetify', 'SignalR', 'ASP.NET Core'],
    },
    {
      id: 'settings',
      name: 'Settings redesign',
      title: 'Settings + integrations redesign',
      start: '2026-09',
      end: '2026-10',
      result: 'Rebuilt on the company design system and released after rounds of sprint-demo, risk-flag and QA feedback.',
      highlights: ['Account settings', 'Integrations page', 'Design-system modals'],
      tech: ['Vue.js', 'Vuetify'],
    },
    {
      id: 'belay',
      name: 'Project Belay',
      title: 'Project Belay: budget automation',
      start: '2026-07',
      end: '2026-10',
      status: 'In development',
      result: 'Still in development, with the MVP launch coming up.',
      highlights: ['Belay integration', 'Dashboard config backend', 'Pause on reduced budget', 'Permission-gated emails'],
      tech: ['Vue.js', 'Vuetify', 'ASP.NET Core'],
    },
  ],
  also: [
    'Media gallery with bulk actions',
    'Google Ads optimization + MCP',
    'Keyword generator',
    'Grounding-factor presets',
    'Pod management',
    'Schema generator → WordPress',
    'Tiptap editor migration',
    'EPPlus replacement',
  ],
}
