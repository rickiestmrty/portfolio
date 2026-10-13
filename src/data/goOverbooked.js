// Demo data for the Go Overbooked calendar.
// Booking dates are day offsets from today, so the demo always shows bookings in the current week.

export const rooms = [
  { id: 'F1', type: 'Barkada Room', nightlyRate: 4500, maxGuests: 8 },
  { id: '301', type: 'Double Room', nightlyRate: 2400, maxGuests: 2 },
  { id: '302', type: 'Double Room', nightlyRate: 2400, maxGuests: 2 },
  { id: '303', type: 'Family Room', nightlyRate: 3200, maxGuests: 5 },
]

export const statuses = {
  'checked-in': 'Checked in',
  confirmed: 'Confirmed',
  pending: 'Pending',
}

export const bookings = [
  {
    id: 'GO-10238',
    guest: 'Nestor A. Desabille Jr.',
    room: '303',
    checkIn: 0,
    checkOut: 2,
    status: 'checked-in',
    source: 'Direct',
    guests: 4,
    nightlyRate: 3200,
    notes:
      'Owns Go Overbooked end to end, from product and engineering to sales, marketing and support. Wrote about 590 of its 600 commits across four repos. Built a no-signup demo mode so hotels and recruiters can try the full product.',
  },
  {
    id: 'GO-10241',
    guest: 'Nestor D.',
    role: 'Founder',
    room: 'F1',
    checkIn: 1,
    checkOut: 3,
    status: 'confirmed',
    source: 'Airbnb',
    guests: 6,
    nightlyRate: 4500,
    notes:
      'Started building Go Overbooked in June 2025, after two families arrived at my family’s guesthouse for the same room. Designed the product, architecture and data model for properties with 3 to 20 rooms. 50 properties, 83 users and 789 reservations in production as of September 2026.',
  },
  {
    id: 'GO-10247',
    guest: 'Nestor D.',
    role: 'Fullstack Engineer',
    room: '301',
    checkIn: 2,
    checkOut: 5,
    status: 'confirmed',
    source: 'Booking.com',
    guests: 2,
    nightlyRate: 2400,
    notes:
      'Built the PMS app with Vue 3, TypeScript, Pinia and PrimeVue, plus the guest booking engine and the marketing site. The backend is Supabase: Postgres with row-level security, 121 SQL migrations and 20 edge functions. Auth0 sign-in is exchanged for Supabase JWTs, so every row is scoped to the caller’s hotel.',
  },
  {
    id: 'GO-10252',
    guest: 'Nestor D.',
    role: 'Automation Engineer',
    room: '302',
    checkIn: 4,
    checkOut: 8,
    status: 'pending',
    source: 'Agoda',
    guests: 2,
    nightlyRate: 2400,
    notes:
      'Built two-way OTA sync through Channex. An outbox and a pg_cron job batch each hotel’s changes into one request, which keeps it under the limit of 20 requests a minute. Also built scheduled email and SMS reminders, and a signed, idempotent partner API that posts POS charges to guest bills.',
  },
  {
    id: 'GO-10259',
    guest: 'Nestor D.',
    role: 'Sales & Onboarding',
    room: '303',
    checkIn: 3,
    checkOut: 6,
    status: 'confirmed',
    source: 'Direct',
    guests: 2,
    nightlyRate: 3200,
    brand: true,
    notes:
      'Sells Go Overbooked directly to small property owners in the Philippines on a freemium plan. Runs the sales demos, onboards new properties, answers support, and turns their feedback into the product roadmap.',
  },
]

// OTAs connected through the white-label channel manager. Rates are per night, by room type.
export const channels = [
  { id: 'booking', name: 'Booking.com', color: '--accent', rate: { 'Barkada Room': 4700, 'Double Room': 2500, 'Family Room': 3300 } },
  { id: 'airbnb', name: 'Airbnb', color: '--danger', rate: { 'Barkada Room': 4500, 'Double Room': 2400, 'Family Room': 3200 } },
  { id: 'agoda', name: 'Agoda', color: '--status-pending', rate: { 'Barkada Room': 4600, 'Double Room': 2450, 'Family Room': 3250 } },
  { id: 'expedia', name: 'Expedia', color: '--status-checked-in', rate: { 'Barkada Room': 4800, 'Double Room': 2550, 'Family Room': 3350 } },
]

// Made-up guests for bookings sent from the channel sync demo.
export const demoGuests = [
  { name: 'Maria Santos', count: 2 },
  { name: 'Joshua Reyes', count: 2 },
  { name: 'Hannah Lim', count: 3 },
  { name: 'Carlo Villanueva', count: 4 },
  { name: 'Emma Johansson', count: 2 },
  { name: 'Kenji Watanabe', count: 1 },
  { name: 'Bea Mendoza', count: 5 },
  { name: 'Liam O’Connor', count: 2 },
]

// Case study under the demo. Facts from the founder brief. Update `traction` when the numbers move.
export const links = {
  app: 'https://app.gooverbooked.com',
  landing: 'https://gooverbooked.com',
  founderStory: 'https://gooverbooked.com/founder-story',
  exampleSite: 'https://nandfguesthouse.gooverbooked.com',
}

export const traction = {
  asOf: 'Sep 30, 2026',
  stats: [
    { value: '50', label: 'Properties' },
    { value: '83', label: 'Users' },
    { value: '789', label: 'Reservations' },
    { value: '98%', label: 'Of the 600 commits are mine' },
  ],
}

// Engineering highlights, most relevant to full stack roles first.
// summary: the one line that says what it does. points: how it works. link: optional, for highlights a visitor can try.
export const highlights = [
  {
    id: 'channel-sync',
    name: 'OTA channel sync',
    title: 'Two-way OTA sync that stays under the rate limit',
    summary: 'Price and availability edits reach the OTAs through Channex in batches, which keeps the system under Channex’s limit of 20 requests a minute.',
    points: [
      'Local price and availability changes are written to an outbox table.',
      'A pg_cron job drains the outbox every minute and merges each hotel’s pending changes into one Channex call. Ten price edits become one request.',
      'When Channex rate-limits, the job retries with exponential backoff. It also caps how much work it does per run.',
      'Incoming OTA bookings are polled and imported into the PMS calendar.',
    ],
    tech: ['Supabase', 'PostgreSQL', 'pg_cron', 'Channex API'],
  },
  {
    id: 'pos-api',
    name: 'Partner POS API',
    title: 'Signed, idempotent API for restaurant and bar charges',
    summary: 'Partner POS systems post restaurant and bar tickets onto a hotel guest’s bill. A retried request never charges twice.',
    points: [
      'Partners sign every request with HMAC-SHA256 and send an idempotency key, so retries are safe.',
      'Zod validates each request.',
      'Posting an invoice updates the reservation’s balance, its payment records and the hotel’s wallet ledger. Refunds are supported.',
      'Vitest tests cover replays, lookup failures, currency mismatches and the reconciliation math.',
    ],
    tech: ['Node.js', 'Express', 'TypeScript', 'Zod', 'Vitest'],
  },
  {
    id: 'auth',
    name: 'Multi-tenant auth',
    title: 'Auth0 sign-in, hotel-scoped data in Postgres',
    summary: 'Row-level security scopes every row to the caller’s hotel, resolved from a verified token.',
    points: [
      'An edge function exchanges the Auth0 ID token for a Supabase-signed JWT and caches it.',
      'Postgres row-level security and helper functions resolve the caller’s hotel from the verified token.',
      'Custom roles and permissions per property, team invites and multi-property support.',
    ],
    tech: ['Auth0', 'OAuth 2.0', 'Supabase', 'Row-level security'],
  },
  {
    id: 'demo-mode',
    name: 'Demo mode',
    title: 'The full product, no account needed',
    summary: 'Prospects and recruiters can use every screen of the real app with sample data and a guided tour.',
    points: [
      'One data-access composable, useHotelData, feeds every screen from either Supabase or a realistic in-memory dataset.',
      'Because screens read through the same composable either way, the demo is the real app, not a mock-up.',
      'A guided tour walks first-time visitors through it.',
    ],
    tech: ['Vue 3', 'Composition API', 'TypeScript'],
    link: { label: 'Open the live demo', href: links.app },
  },
  {
    id: 'plans',
    name: 'Plan gating',
    title: 'Feature tiers, trials and automatic downgrades',
    summary: 'Free, Plus and Pro features are gated in one place, and expired hotels are downgraded on a schedule.',
    points: [
      'A usePlan composable and a gate overlay component decide which features each tier can use.',
      'Trial periods are built in.',
      'A scheduled job downgrades hotels whose plan has expired.',
    ],
    tech: ['Vue 3', 'TypeScript', 'pg_cron'],
  },
  {
    id: 'messages',
    name: 'Automated messages',
    title: 'Scheduled email and SMS for guests and staff',
    summary: 'Booking confirmations, stay reminders and account nudges go out automatically by email and SMS.',
    points: [
      'Scheduled edge functions send booking confirmations and rejections.',
      'Pre-arrival and checkout reminders go to staff and guests by email and SMS.',
      'Hotels get onboarding nudges and billing reminders.',
    ],
    tech: ['Edge functions', 'pg_cron', 'Resend', 'UniSMS'],
  },
]

// System map: what each repo and service does. tech is shown as one line, joined with ' · '. Empty when not worth listing.
export const architecture = [
  {
    name: 'Apps',
    items: [
      { name: 'overbooked-web', what: 'The PMS app for hotel staff.', tech: ['Vue 3', 'TypeScript', 'Pinia', 'PrimeVue', 'Vite', 'Vercel'] },
      { name: 'overbooked-booking', what: 'Public booking engine. Guests pick rooms, enter details and upload proof of payment.', tech: [] },
      { name: 'overbooked-landing-page', what: 'Marketing site with a blog, pricing page, founder story and funnel tracking.', tech: [] },
    ],
  },
  {
    name: 'Backend',
    items: [
      { name: 'Supabase', what: 'PostgreSQL with row-level security. 121 SQL migrations.', tech: ['PostgreSQL', 'RLS'] },
      { name: 'Edge functions', what: '20 functions, including the Auth0 token exchange and scheduled messages, plus pg_cron jobs.', tech: ['Deno', 'pg_cron'] },
      { name: 'overbooked-external-api', what: 'REST API for partner POS systems.', tech: ['Node.js', 'Express', 'TypeScript'] },
    ],
  },
  {
    name: 'Services',
    items: [
      { name: 'Auth0', what: 'Sign-in with OAuth 2.0.', tech: [] },
      { name: 'Channex', what: 'Channel manager for OTA sync.', tech: [] },
      { name: 'Resend', what: 'Email.', tech: [] },
      { name: 'UniSMS', what: 'SMS.', tech: [] },
    ],
  },
]

export const features = [
  'Dashboard: occupancy, revenue, repeat guests, nights sold, weather',
  'Today’s check-ins and check-outs',
  'Booking calendar and list',
  'Room types with per-day, rate-aware pricing',
  'Discounts',
  'Availability blocking',
  'Public booking engine',
  'Website builder',
  'Guest booking status lookup',
  'Wallets and ledger',
  'Income and expense categories',
  'Receipts and PDF generation',
  'Activity and audit log',
  'Supplies inventory',
  'Housekeeping room status',
  'Team roles',
  'Admin console',
]

// Freemium pricing, and the work outside the code. price/what: null hides that line.
export const business = {
  plans: [
    { name: 'Free', price: 'Free forever', what: 'The core app' },
    { name: 'Plus', price: '$7/mo or ₱350/mo', what: null },
    { name: 'Website Builder', price: 'Add-on', what: 'A booking website for the property' },
    { name: 'Pro', price: null, what: 'OTA channel sync and multi-property support' },
  ],
  work: [
    'Product, sales, marketing and support',
    'Funnel and upsell event tracking',
    'Onboarding nudges 24 hours and 1 week after signup',
    'SEO blog',
    'Launch and ad videos made with Remotion',
  ],
}
