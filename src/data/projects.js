import goOverbookedLogo from '../../assets/gooverbooked_logo.png'
import atCapacityLogo from '../../assets/atcapacity_logo.png'
import evstreamLogo from '../../assets/evstream_logo.svg'
import myConsumablesLogo from '../../assets/myconsumables_lgo.svg'

// Work shown in the sidebar, dashboard and profile. Add a new entry here to add a nav item and a page.
// color: CSS variable used for the project's page background and its dashboard squares.
// start/end: ISO dates (yyyy-mm-dd) from the resume. end: null means "present". start: null hides it from the activity grid.
// tagline, role, stack: shown on the dashboard work cards.
// engagement: key of `engagements` below (null hides the tag). Order of this list is the order everywhere (sidebar, cards, profile),
// so the main job comes first and work done alongside it follows.
export const projects = [
  {
    slug: 'at-capacity',
    name: 'At Capacity',
    logo: atCapacityLogo,
    color: '--brand-at-capacity',
    tagline: 'Ad automation that pauses Google Ads when a business is too busy to take new work.',
    role: 'Full Stack Engineer',
    engagement: 'full-time',
    stack: ['Vue.js', 'Vuetify', 'ASP.NET Core', 'SQL Server', 'Azure Functions', 'SignalR', 'Google Ads API'],
    start: '2023-07-01',
    end: null,
  },
  {
    slug: 'myconsumables',
    name: 'MyConsumables',
    logo: myConsumablesLogo,
    color: '--brand-myconsumables',
    tagline: 'A healthcare platform for pharmacies serving NDIS and Support at Home participants.',
    role: 'Mid-Level Software Engineer',
    engagement: 'contract',
    stack: ['Next.js', 'TypeScript', 'MUI', 'Express', 'PostgreSQL', 'Drizzle', 'AWS'],
    start: '2026-06-01',
    end: null,
  },
  {
    slug: 'go-overbooked',
    name: 'Go Overbooked',
    logo: goOverbookedLogo,
    color: '--brand-go-overbooked',
    tagline: 'Property management for small accommodation owners, with OTA calendar sync to stop double bookings.',
    role: 'Founder & Engineer',
    engagement: 'founder',
    stack: ['Vue.js', 'TypeScript', 'PrimeVue', 'Supabase', 'Express', 'Auth0', 'Vercel'],
    start: '2025-01-01',
    end: null,
  },
  {
    slug: 'evstream',
    name: 'EVStream',
    logo: evstreamLogo,
    color: '--ev-bg',
    tagline: 'Betting intelligence that tracks live odds across Australian bookmakers to find the best price.',
    role: 'Junior Software Engineer',
    engagement: 'full-time',
    stack: ['React.js', '.NET', 'GraphQL', 'Supabase'],
    start: '2022-07-01',
    end: '2023-06-30',
  },
]

// How each piece of work relates to the main job. rank decides which color wins on the activity grid
// when two overlap, so the main job always reads as the primary line of work.
export const engagements = {
  'full-time': { label: 'Full-time', rank: 0 },
  contract: { label: 'Contract', rank: 1 },
  founder: { label: 'Own product', rank: 2 },
}

export const engagementLabel = (p) => engagements[p.engagement]?.label ?? null

export const findProject = (slug) => projects.find((p) => p.slug === slug)
