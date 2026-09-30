// Hiring preferences on the Settings page. All amounts are PHP per month.

export const PHP_PER_USD = 62

export const baseSalary = 90000

// Range of the offer slider.
export const offerRange = { min: 20000, max: 200000, step: 1000 }

export const noticePeriodDays = 30

export const arrangements = [
  { value: 'remote', label: 'Remote', premium: 0 },
  { value: 'hybrid', label: 'Hybrid', premium: 5000 },
  { value: 'onsite', label: 'Onsite', premium: 10000 },
]

export const employmentTypes = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'contract', label: 'Contract', disabled: true },
  { value: 'part-time', label: 'Part-time', disabled: true },
]

export const engagements = [
  { value: '3-months', label: '3 months', disabled: true },
  { value: '6-months', label: '6 months', disabled: true },
  { value: 'long-term', label: 'Long-term' },
]

// daytimeHours: how many hours of the team's workday land in my daytime (PHT).
// Overlap past that is night work and earns the night differential.
export const teamRegions = [
  { value: 'apac', label: 'APAC', daytimeHours: 8, note: 'Same or close to my timezone.' },
  { value: 'europe', label: 'Europe', daytimeHours: 3, note: 'Your 9am is my 4pm.' },
  { value: 'americas', label: 'Americas', daytimeHours: 0, note: 'Your 9am is my 10pm.' },
]

export const overlapRange = { min: 0, max: 8, step: 1 }

export const nightDifferentialPerHour = 2500

export const roleFocuses = [
  { value: 'frontend', label: 'Frontend', premium: 0 },
  { value: 'full-stack', label: 'Full-stack', premium: 5000 },
  { value: 'backend', label: 'Backend', premium: 7500 },
]

export const teamSizes = [
  { value: 'solo', label: 'Solo', premium: 10000, premiumLabel: 'Solo developer (the whole department)' },
  { value: 'small', label: 'Small team', premium: 0 },
  { value: 'large', label: 'Big org', premium: 5000, premiumLabel: 'Big org process overhead' },
]

export const meetings = { max: 20, included: 8, complaintAbove: 10, premiumPerMeeting: 1000 }

export const takeHome = { max: 12, warnAbove: 4 }

export const weekendPremium = 20000

export const familyTax = 10000

// Checked from the lowest threshold up. The first match wins.
export const lowOfferNotices = [
  { below: 25000, tone: 'danger', text: 'Are you looking for a slave?' },
  { below: 30000, tone: 'danger', text: 'Build a time machine and hire 2023 Nestor.' },
  { below: 45000, tone: 'danger', text: 'This is well below the market rate for this role.' },
  { below: 60000, tone: 'warning', text: 'This falls below what my skills and experience command.' },
]

// Offers from here up get a "Let's negotiate" button. Offers that meet my ask get "Let's connect".
export const negotiateFrom = 60000
