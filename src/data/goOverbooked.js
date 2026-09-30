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
      'Owns Go Overbooked end to end, from product direction and engineering to customer onboarding and sales demos. Built a no-signup demo mode so prospective hotels can explore the full product before committing.',
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
      'Founded Go Overbooked and took it from concept to production. Defined the product for small and independent hotels, designed the architecture and data model, and shipped the first release to paying properties.',
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
      'Built the hotel management web app with Vue 3, TypeScript, PrimeVue, and Supabase, covering reservations, room inventory and rates, the dashboard, and a wallet and ledger finance module. Also built the guest-facing booking widget and the marketing site.',
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
      'Automated two-way OTA sync with Booking.com, Expedia, Agoda, and Airbnb through a white-label channel manager, keeping rates and availability aligned to prevent double bookings. Set up automated guest reminder emails, daily staff summaries, and a partner API that posts POS charges to guest folios.',
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
      'Sells Go Overbooked directly to small property owners in the Philippines. Runs the sales demos, onboards new properties, and turns their feedback into the product roadmap.',
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
