import goOverbookedLogo from '../../assets/gooverbooked_logo.png'
import atCapacityLogo from '../../assets/atcapacity_logo.png'
import evstreamLogo from '../../assets/evstream_logo.svg'
import myConsumablesLogo from '../../assets/myconsumables_lgo.svg'

// Work shown in the sidebar, dashboard and profile. Add a new entry here to add a nav item and a page.
// color: CSS variable used for the project's page background and its dashboard squares.
// start/end: ISO dates (yyyy-mm-dd) from the resume. end: null means "present". start: null hides it from the activity grid.
// since: true shows ongoing work as 'Since Jun 2026' instead of 'Jun 2026 – Present'.
// tagline, role, stack: shown on the dashboard work cards.
// study: the Problem / What I built / Result block under each demo. A value starting with 'TODO' is a fact still to fill in.
// repo: public repo URL. null hides the "View code" link.
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
    stack: ['Vue.js', 'Vuetify', 'Tiptap', 'ASP.NET Core', 'SQL Server', 'Azure Functions', 'SignalR', 'Cloudflare', 'Google Ads API'],
    start: '2023-07-01',
    end: null,
    study: {
      problem: 'Agencies run Google Ads for many client accounts at once. Each account has to be onboarded, its reviews and errors watched, and its ad spend kept in step with its budget.',
      built: 'Full stack across Vue and .NET. I built the onboarding wizard with Google Drive storage, reputation tracking across multiple Google Business Profile locations, a SignalR notification center and a settings redesign on the company design system. Now building Belay, which pauses ads when a budget is cut.',
      result: '15+ accounts onboarded, with client files kept in the company’s Google Drive. Multi-location customers can compare each branch’s reviews, and errors show up in the app instead of in deployment logs.',
      repo: null,
    },
  },
  {
    slug: 'myconsumables',
    name: 'MyConsumables',
    logo: myConsumablesLogo,
    color: '--brand-myconsumables',
    tagline: 'A healthcare platform for pharmacies serving NDIS and Support at Home participants.',
    role: 'Full Stack Engineer',
    engagement: 'freelance',
    stack: ['Next.js', 'TypeScript', 'MUI', 'Express', 'PostgreSQL', 'Drizzle', 'AWS'],
    start: '2026-06-01',
    end: null,
    since: true,
    study: {
      problem: 'Pharmacies that serve NDIS and Support at Home participants need their daily routine, special orders included, in software that is simple to use and hard to break.',
      built: 'Joined as a freelance full stack engineer in June 2026. I work with a cross-functional team to turn the pharmacy’s daily routine, starting with special orders, into simple and reliable software.',
      result: 'Ongoing engagement. Contributing to active development since June 2026.',
      repo: null,
    },
  },
  {
    slug: 'go-overbooked',
    name: 'Go Overbooked',
    logo: goOverbookedLogo,
    color: '--brand-go-overbooked',
    tagline: 'A property management system that puts every booking channel for a 3 to 20 room guesthouse on one calendar, with payments, receipts and guest messages.',
    role: 'Founder & Full Stack Engineer',
    engagement: 'founder',
    stack: ['Vue.js', 'TypeScript', 'Supabase', 'PostgreSQL', 'Express', 'PrimeVue', 'Pinia', 'Auth0', 'Vercel'],
    start: '2025-06-01',
    end: null,
    since: true,
    study: {
      problem: 'My family’s 9-room guesthouse on Bantayan Island took bookings from Booking.com, Agoda, walk-ins and Facebook Messenger, all tracked by hand. In Holy Week 2023, two families arrived for the same room, both paid and confirmed. Every PMS on the market was built for 200-room hotels and cost more per month than we charged for a night.',
      built: 'The whole system across four repos: the Vue 3 and TypeScript PMS app, a guest booking engine, a Node and Express partner API, and the marketing site, on Supabase with 121 SQL migrations, 20 edge functions and scheduled jobs. I wrote about 590 of the 600 commits, and I also run product, sales, marketing and support.',
      result: '50 properties, 83 users and 789 reservations in production as of September 2026. It still runs every booking at our guesthouse.',
      repo: null,
    },
  },
  {
    slug: 'evstream',
    name: 'EVStream',
    logo: evstreamLogo,
    color: '--ev-bg',
    tagline: 'Betting intelligence that tracks live odds across Australian bookmakers to find the best price.',
    role: 'Full Stack Engineer',
    engagement: 'full-time',
    stack: ['React.js', '.NET', 'GraphQL', 'Supabase'],
    start: '2022-07-01',
    end: '2023-06-30',
    study: {
      problem: 'The same runner is priced differently across Australian bookmakers and the prices keep moving, so punters struggle to see the best one.',
      built: 'Integrated 10+ bookmakers into the platform so the app ran better, and made UI changes for a smoother user experience.',
      // I left before the app launched, so there are no launch numbers.
      result: 'Delivered the bookmaker integrations and UI improvements for the pre-launch build. I moved on before the public launch.',
      repo: null,
    },
  },
]

// How each piece of work relates to the main job. rank decides which color wins on the activity grid
// when two overlap, so the main job always reads as the primary line of work.
export const engagements = {
  'full-time': { label: 'Full-time', rank: 0 },
  freelance: { label: 'Freelance', rank: 1 },
  founder: { label: 'Own product', rank: 2 },
}

export const engagementLabel = (p) => engagements[p.engagement]?.label ?? null

export const findProject = (slug) => projects.find((p) => p.slug === slug)
