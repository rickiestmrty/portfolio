import { availableFromLabel } from './availability.js'

// Title and description per route. Read by the router (document title, Open Graph tags) and by
// vite.config.js, which writes one index.html per route so link previews work without running JS.
// Keep this file free of asset imports: Node loads it at build time.
export const SITE_NAME = 'Nestor Desabille'

const page = (label, description) => ({ title: `${label} | ${SITE_NAME}`, description })

export const pages = {
  '/dashboard': {
    title: `${SITE_NAME} | Full Stack Engineer`,
    description: `Full Stack Engineer in Cebu, Philippines, building SaaS products with Vue.js and ASP.NET Core. Open to full-time roles, available from ${availableFromLabel}.`,
  },
  '/hire-me': page(
    'Hire me',
    `Tell me what the role looks like and see my expected salary range. Open to full-time roles, available from ${availableFromLabel}.`,
  ),
  '/profile': page(
    'Profile',
    'Experience, skills and education of Nestor Desabille, a Full Stack Engineer with 4+ years of building SaaS products.',
  ),
  '/projects/at-capacity': page(
    'At Capacity',
    'Ad automation that pauses Google Ads when a business is too busy to take new work. Interactive demo and what I built.',
  ),
  '/projects/myconsumables': page(
    'MyConsumables',
    'A healthcare platform for pharmacies serving NDIS and Support at Home participants. Interactive special orders demo.',
  ),
  '/projects/go-overbooked': page(
    'Go Overbooked',
    'A property management system I founded and built for 3 to 20 room guesthouses. 50 properties, 83 users and 789 reservations in production. Case study and interactive demo.',
  ),
  '/projects/evstream': page(
    'EVStream',
    'Betting intelligence that tracks live odds across Australian bookmakers to find the best price. Live odds board demo.',
  ),
}

export const pageFor = (path) => pages[path] ?? pages['/dashboard']
